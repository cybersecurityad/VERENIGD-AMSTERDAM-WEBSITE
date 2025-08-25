/**
 * Firebase Admin SDK Configuration
 * Server-side Firebase implementation for Verenigd Amsterdam Forum
 */

const admin = require('firebase-admin');
const path = require('path');

// Import service account key
const serviceAccount = require(path.join(
    __dirname,
    '..',
    'keys',
    'toursamsterdam-eu-1-firebase-adminsdk-e8an4-68217c7e8f.json'
));

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL:
            'https://toursamsterdam-eu-1-default-rtdb.europe-west1.firebasedatabase.app',
        storageBucket: 'toursamsterdam-eu-1.firebasestorage.app',
    });
}

// Get Firebase services
const db = admin.database();
const auth = admin.auth();
const storage = admin.storage();

/**
 * Forum Database Operations
 */
class ForumDatabase {
    constructor() {
        this.db = db;
        this.categoriesRef = db.ref('forum/categories');
        this.postsRef = db.ref('forum/posts');
        this.usersRef = db.ref('forum/users');
        this.actionsRef = db.ref('forum/actions');
    }

    // Categories management
    async getCategories() {
        try {
            const snapshot = await this.categoriesRef.once('value');
            return snapshot.val() || {};
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    }

    async createCategory(categoryData) {
        try {
            const newCategoryRef = this.categoriesRef.push();
            await newCategoryRef.set({
                ...categoryData,
                id: newCategoryRef.key,
                createdAt: admin.database.ServerValue.TIMESTAMP,
                postCount: 0,
                lastActivity: admin.database.ServerValue.TIMESTAMP,
            });
            return newCategoryRef.key;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }

    // Posts management
    async getPosts(categoryId, limit = 20) {
        try {
            const snapshot = await this.postsRef
                .orderByChild('categoryId')
                .equalTo(categoryId)
                .limitToLast(limit)
                .once('value');
            return snapshot.val() || {};
        } catch (error) {
            console.error('Error getting posts:', error);
            throw error;
        }
    }

    async createPost(postData, userId) {
        try {
            const newPostRef = this.postsRef.push();
            const post = {
                ...postData,
                id: newPostRef.key,
                userId: userId,
                createdAt: admin.database.ServerValue.TIMESTAMP,
                updatedAt: admin.database.ServerValue.TIMESTAMP,
                likes: 0,
                replies: 0,
                isActive: true,
            };

            await newPostRef.set(post);

            // Update category post count
            if (postData.categoryId) {
                const categoryRef = this.categoriesRef.child(
                    postData.categoryId
                );
                await categoryRef
                    .child('postCount')
                    .transaction((count) => (count || 0) + 1);
                await categoryRef
                    .child('lastActivity')
                    .set(admin.database.ServerValue.TIMESTAMP);
            }

            return newPostRef.key;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    }

    // Political Actions management
    async createPoliticalAction(actionData, userId) {
        try {
            const newActionRef = this.actionsRef.push();
            const action = {
                ...actionData,
                id: newActionRef.key,
                userId: userId,
                createdAt: admin.database.ServerValue.TIMESTAMP,
                status: 'active',
                supporters: {},
                supportCount: 0,
            };

            await newActionRef.set(action);
            return newActionRef.key;
        } catch (error) {
            console.error('Error creating political action:', error);
            throw error;
        }
    }

    async supportAction(actionId, userId) {
        try {
            const actionRef = this.actionsRef.child(actionId);
            const supporterRef = actionRef.child(`supporters/${userId}`);

            await supporterRef.set({
                timestamp: admin.database.ServerValue.TIMESTAMP,
                active: true,
            });

            // Update support count
            await actionRef
                .child('supportCount')
                .transaction((count) => (count || 0) + 1);

            return true;
        } catch (error) {
            console.error('Error supporting action:', error);
            throw error;
        }
    }

    // User management
    async createUser(userData) {
        try {
            const userRef = this.usersRef.child(userData.uid);
            const user = {
                uid: userData.uid,
                email: userData.email,
                displayName: userData.displayName || 'Anonieme Gebruiker',
                photoURL: userData.photoURL || null,
                createdAt: admin.database.ServerValue.TIMESTAMP,
                lastActivity: admin.database.ServerValue.TIMESTAMP,
                postCount: 0,
                reputation: 0,
                isActive: true,
                role: 'member',
            };

            await userRef.set(user);
            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async updateUserActivity(userId) {
        try {
            const userRef = this.usersRef.child(userId);
            await userRef
                .child('lastActivity')
                .set(admin.database.ServerValue.TIMESTAMP);
        } catch (error) {
            console.error('Error updating user activity:', error);
        }
    }
}

/**
 * Authentication Operations
 */
class ForumAuth {
    constructor() {
        this.auth = auth;
    }

    async verifyIdToken(idToken) {
        try {
            const decodedToken = await this.auth.verifyIdToken(idToken);
            return decodedToken;
        } catch (error) {
            console.error('Error verifying ID token:', error);
            throw error;
        }
    }

    async createCustomToken(uid, additionalClaims = {}) {
        try {
            const customToken = await this.auth.createCustomToken(
                uid,
                additionalClaims
            );
            return customToken;
        } catch (error) {
            console.error('Error creating custom token:', error);
            throw error;
        }
    }

    async setUserClaims(uid, customClaims) {
        try {
            await this.auth.setCustomUserClaims(uid, customClaims);
        } catch (error) {
            console.error('Error setting user claims:', error);
            throw error;
        }
    }
}

/**
 * Storage Operations
 */
class ForumStorage {
    constructor() {
        this.bucket = storage.bucket();
    }

    async uploadFile(file, fileName, metadata = {}) {
        try {
            const fileRef = this.bucket.file(`forum/${fileName}`);

            await fileRef.save(file, {
                metadata: {
                    contentType:
                        metadata.contentType || 'application/octet-stream',
                    ...metadata,
                },
            });

            // Make file publicly readable
            await fileRef.makePublic();

            return `https://storage.googleapis.com/${this.bucket.name}/forum/${fileName}`;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    async deleteFile(fileName) {
        try {
            const fileRef = this.bucket.file(`forum/${fileName}`);
            await fileRef.delete();
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }
}

// Export initialized services
module.exports = {
    admin,
    db,
    auth,
    storage,
    ForumDatabase,
    ForumAuth,
    ForumStorage,
};
