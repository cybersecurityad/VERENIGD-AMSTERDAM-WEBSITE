/**
 * API Service for Verenigd Amsterdam Forum
 * Handles communication with Firebase Admin SDK server
 */

class ForumAPIService {
    constructor() {
        this.baseURL = 'http://localhost:3001/api'; // Development server
        this.authToken = null;

        // Switch to production URL when deployed
        if (window.location.hostname === 'verenigdamsterdam.nl') {
            this.baseURL = 'https://verenigdamsterdam.nl/api';
        }
    }

    // Set authentication token
    setAuthToken(token) {
        this.authToken = token;
    }

    // Get headers with authentication
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        return headers;
    }

    // Generic API request method
    async makeRequest(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const config = {
                method: 'GET',
                headers: this.getHeaders(),
                ...options,
            };

            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        return this.makeRequest('/health');
    }

    // Categories API
    async getCategories() {
        return this.makeRequest('/categories');
    }

    async createCategory(categoryData) {
        return this.makeRequest('/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData),
        });
    }

    // Posts API
    async getPosts(categoryId, limit = 20) {
        return this.makeRequest(`/posts/${categoryId}?limit=${limit}`);
    }

    async createPost(postData) {
        return this.makeRequest('/posts', {
            method: 'POST',
            body: JSON.stringify(postData),
        });
    }

    // Political Actions API
    async createPoliticalAction(actionData) {
        return this.makeRequest('/actions', {
            method: 'POST',
            body: JSON.stringify(actionData),
        });
    }

    async supportAction(actionId) {
        return this.makeRequest(`/actions/${actionId}/support`, {
            method: 'POST',
        });
    }

    // User API
    async createUser(userData) {
        return this.makeRequest('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    // File Upload API
    async uploadFile(file, fileName) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const base64Data = reader.result.split(',')[1];
                    const result = await this.makeRequest('/upload', {
                        method: 'POST',
                        body: JSON.stringify({
                            file: base64Data,
                            fileName: fileName,
                            contentType: file.type,
                        }),
                    });
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Admin API
    async getAdminStats() {
        return this.makeRequest('/admin/stats');
    }
}

// Enhanced Firebase integration with Admin SDK backend
class FirebaseAdminIntegration {
    constructor() {
        this.apiService = new ForumAPIService();
        this.currentUser = null;
        this.authListeners = [];
    }

    // Initialize Firebase Auth (client-side)
    async initializeAuth() {
        if (!window.firebaseAuth) {
            console.warn('Firebase Auth not loaded');
            return;
        }

        const { onAuthStateChanged } = window.firebaseAuth;

        onAuthStateChanged(window.firebaseAuth, async (user) => {
            if (user) {
                try {
                    // Get ID token for server authentication
                    const idToken = await user.getIdToken();
                    this.apiService.setAuthToken(idToken);
                    this.currentUser = user;

                    // Create/update user in backend
                    await this.apiService.createUser({
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                    });

                    // Notify listeners
                    this.notifyAuthListeners(user);
                } catch (error) {
                    console.error(
                        'Error setting up authenticated user:',
                        error
                    );
                }
            } else {
                this.apiService.setAuthToken(null);
                this.currentUser = null;
                this.notifyAuthListeners(null);
            }
        });
    }

    // Auth state listeners
    onAuthStateChanged(callback) {
        this.authListeners.push(callback);

        // Call immediately with current state
        if (this.currentUser !== undefined) {
            callback(this.currentUser);
        }

        // Return unsubscribe function
        return () => {
            const index = this.authListeners.indexOf(callback);
            if (index > -1) {
                this.authListeners.splice(index, 1);
            }
        };
    }

    notifyAuthListeners(user) {
        this.authListeners.forEach((callback) => {
            try {
                callback(user);
            } catch (error) {
                console.error('Error in auth listener:', error);
            }
        });
    }

    // Enhanced forum operations with server backend
    async createForumPost(title, content, categoryId, tags = []) {
        if (!this.currentUser) {
            throw new Error('User must be authenticated to create posts');
        }

        return this.apiService.createPost({
            title,
            content,
            categoryId,
            tags,
        });
    }

    async createPoliticalAction(
        title,
        description,
        type,
        targetDate,
        category
    ) {
        if (!this.currentUser) {
            throw new Error(
                'User must be authenticated to create political actions'
            );
        }

        return this.apiService.createPoliticalAction({
            title,
            description,
            type,
            targetDate,
            category,
        });
    }

    async supportPoliticalAction(actionId) {
        if (!this.currentUser) {
            throw new Error('User must be authenticated to support actions');
        }

        return this.apiService.supportAction(actionId);
    }

    // Get forum data
    async getForumCategories() {
        return this.apiService.getCategories();
    }

    async getForumPosts(categoryId, limit = 20) {
        return this.apiService.getPosts(categoryId, limit);
    }

    // File upload
    async uploadForumFile(file, fileName) {
        if (!this.currentUser) {
            throw new Error('User must be authenticated to upload files');
        }

        return this.apiService.uploadFile(file, fileName);
    }

    // Admin functions
    async getAdminStatistics() {
        if (!this.currentUser) {
            throw new Error('User must be authenticated');
        }

        return this.apiService.getAdminStats();
    }
}

// Make available globally
window.ForumAPIService = ForumAPIService;
window.FirebaseAdminIntegration = FirebaseAdminIntegration;
