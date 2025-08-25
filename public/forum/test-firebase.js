/**
 * Test Firebase Admin SDK Setup
 */

const path = require('path');

console.log('🔥 Testing Firebase Admin SDK Setup');
console.log('====================================');
console.log('Current directory:', process.cwd());
console.log('Script location:', __filename);

// Test if Firebase Admin SDK is available
try {
    const admin = require('firebase-admin');
    console.log('✅ Firebase Admin SDK loaded successfully');

    // Test if service account key exists
    const keyPath = path.join(
        __dirname,
        'keys',
        'toursamsterdam-eu-1-firebase-adminsdk-e8an4-68217c7e8f.json'
    );
    console.log('Looking for service account key at:', keyPath);

    const fs = require('fs');
    if (fs.existsSync(keyPath)) {
        console.log('✅ Service account key found');

        // Try to load and validate the key
        const serviceAccount = require(keyPath);
        if (serviceAccount.project_id && serviceAccount.private_key) {
            console.log('✅ Service account key is valid');
            console.log('   Project ID:', serviceAccount.project_id);
            console.log('   Client Email:', serviceAccount.client_email);
        } else {
            console.log('❌ Service account key is invalid');
        }

        // Try to initialize Firebase Admin SDK
        if (!admin.apps.length) {
            try {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    databaseURL:
                        'https://toursamsterdam-eu-1-default-rtdb.europe-west1.firebasedatabase.app',
                    storageBucket: 'toursamsterdam-eu-1.firebasestorage.app',
                });
                console.log('✅ Firebase Admin SDK initialized successfully');

                // Test database connection
                const db = admin.database();
                console.log('✅ Database service connected');

                // Test auth service
                const auth = admin.auth();
                console.log('✅ Auth service connected');

                // Test storage service
                const storage = admin.storage();
                console.log('✅ Storage service connected');

                console.log('');
                console.log('🎉 All Firebase Admin SDK services are working!');
            } catch (initError) {
                console.error(
                    '❌ Error initializing Firebase Admin SDK:',
                    initError.message
                );
            }
        }
    } else {
        console.log('❌ Service account key not found');
        console.log('   Please make sure the file exists at:', keyPath);
    }
} catch (error) {
    console.error('❌ Error loading Firebase Admin SDK:', error.message);
    console.log('   Make sure to run: npm install firebase-admin');
}

console.log('');
console.log('📋 Next steps:');
console.log('   1. Ensure service account key is in the correct location');
console.log('   2. Run: node server/app.js');
console.log('   3. Test API at: http://localhost:3001/api/health');
