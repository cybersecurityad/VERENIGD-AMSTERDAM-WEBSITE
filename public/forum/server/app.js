/**
 * Verenigd Amsterdam Forum - Express Server
 * Handles server-side operations with Firebase Admin SDK
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { ForumDatabase, ForumAuth, ForumStorage } = require('./firebase-admin');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
    cors({
        origin: ['http://localhost:8080', 'https://verenigdamsterdam.nl'],
        credentials: true,
    })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Firebase services
const forumDB = new ForumDatabase();
const forumAuth = new ForumAuth();
const forumStorage = new ForumStorage();

// Authentication middleware
async function authenticateUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const idToken = authHeader.split('Bearer ')[1];
        if (!idToken) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decodedToken = await forumAuth.verifyIdToken(idToken);
        req.user = decodedToken;

        // Update user activity
        await forumDB.updateUserActivity(decodedToken.uid);

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
}

/**
 * API Routes
 */

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Verenigd Amsterdam Forum API is running',
        timestamp: new Date().toISOString(),
    });
});

// Categories endpoints
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await forumDB.getCategories();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

app.post('/api/categories', authenticateUser, async (req, res) => {
    try {
        const { title, description, icon, color } = req.body;

        if (!title || !description) {
            return res
                .status(400)
                .json({ error: 'Title and description are required' });
        }

        const categoryId = await forumDB.createCategory({
            title,
            description,
            icon: icon || 'fas fa-comments',
            color: color || '#00008b',
            createdBy: req.user.uid,
        });

        res.status(201).json({
            id: categoryId,
            message: 'Category created successfully',
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// Posts endpoints
app.get('/api/posts/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const limit = parseInt(req.query.limit) || 20;

        const posts = await forumDB.getPosts(categoryId, limit);
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

app.post('/api/posts', authenticateUser, async (req, res) => {
    try {
        const { title, content, categoryId, tags } = req.body;

        if (!title || !content || !categoryId) {
            return res
                .status(400)
                .json({ error: 'Title, content, and categoryId are required' });
        }

        const postId = await forumDB.createPost(
            {
                title,
                content,
                categoryId,
                tags: tags || [],
                author: req.user.name || req.user.email,
            },
            req.user.uid
        );

        res.status(201).json({
            id: postId,
            message: 'Post created successfully',
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Political Actions endpoints
app.post('/api/actions', authenticateUser, async (req, res) => {
    try {
        const { title, description, type, targetDate, category } = req.body;

        if (!title || !description || !type) {
            return res
                .status(400)
                .json({ error: 'Title, description, and type are required' });
        }

        const actionId = await forumDB.createPoliticalAction(
            {
                title,
                description,
                type, // 'politiek', 'netwerk', 'handhaving'
                targetDate,
                category: category || 'algemeen',
                author: req.user.name || req.user.email,
            },
            req.user.uid
        );

        res.status(201).json({
            id: actionId,
            message: 'Political action created successfully',
        });
    } catch (error) {
        console.error('Error creating political action:', error);
        res.status(500).json({ error: 'Failed to create political action' });
    }
});

app.post(
    '/api/actions/:actionId/support',
    authenticateUser,
    async (req, res) => {
        try {
            const { actionId } = req.params;

            const success = await forumDB.supportAction(actionId, req.user.uid);

            if (success) {
                res.json({ message: 'Action supported successfully' });
            } else {
                res.status(500).json({ error: 'Failed to support action' });
            }
        } catch (error) {
            console.error('Error supporting action:', error);
            res.status(500).json({ error: 'Failed to support action' });
        }
    }
);

// User endpoints
app.post('/api/users', authenticateUser, async (req, res) => {
    try {
        const userData = {
            uid: req.user.uid,
            email: req.user.email,
            displayName: req.body.displayName || req.user.name,
            photoURL: req.body.photoURL,
        };

        const user = await forumDB.createUser(userData);
        res.status(201).json({ user, message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// File upload endpoints
app.post('/api/upload', authenticateUser, async (req, res) => {
    try {
        const { file, fileName, contentType } = req.body;

        if (!file || !fileName) {
            return res
                .status(400)
                .json({ error: 'File and fileName are required' });
        }

        // Convert base64 to buffer
        const fileBuffer = Buffer.from(file, 'base64');

        const fileUrl = await forumStorage.uploadFile(fileBuffer, fileName, {
            contentType,
            uploadedBy: req.user.uid,
            uploadedAt: new Date().toISOString(),
        });

        res.json({ url: fileUrl, message: 'File uploaded successfully' });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Admin endpoints (require admin role)
async function requireAdmin(req, res, next) {
    if (!req.user.admin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

app.get(
    '/api/admin/stats',
    authenticateUser,
    requireAdmin,
    async (req, res) => {
        try {
            // Get forum statistics
            const categories = await forumDB.getCategories();
            const categoriesCount = Object.keys(categories || {}).length;

            res.json({
                categories: categoriesCount,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            res.status(500).json({ error: 'Failed to fetch statistics' });
        }
    }
);

// Static file serving for development
if (process.env.NODE_ENV !== 'production') {
    app.use(express.static(path.join(__dirname, '..')));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    });
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path,
        timestamp: new Date().toISOString(),
    });
});

// Start server
app.listen(PORT, () => {
    console.log(
        `🏛️ Verenigd Amsterdam Forum API server running on port ${PORT}`
    );
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔥 Firebase Admin SDK initialized`);
});

module.exports = app;
