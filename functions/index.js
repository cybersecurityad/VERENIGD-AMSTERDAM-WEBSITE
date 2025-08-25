/**
 * Cloud Functions for Verenigd Amsterdam
 * Version: 2.0.0
 * 
 * Handles newsletter signups, contact forms, and other backend functionality
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Get Firestore instance
const db = admin.firestore();

// ============================================
// CORS MIDDLEWARE
// ============================================
const cors = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return true;
  }
  return false;
};

// ============================================
// EMAIL VALIDATION
// ============================================
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ============================================
// NEWSLETTER SIGNUP FUNCTION
// ============================================
exports.newsletterSignup = functions.https.onRequest(async (req, res) => {
  // Handle CORS
  if (cors(req, res)) return;
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Please use POST method'
    });
    return;
  }
  
  try {
    // Extract and validate email
    const { email, name } = req.body;
    
    if (!email) {
      res.status(400).json({ 
        error: 'Validation error',
        message: 'Email adres is verplicht'
      });
      return;
    }
    
    if (!validateEmail(email)) {
      res.status(400).json({ 
        error: 'Validation error',
        message: 'Ongeldig email adres'
      });
      return;
    }
    
    // Check if email already exists
    const existingSubscriber = await db
      .collection('newsletter')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();
    
    if (!existingSubscriber.empty) {
      res.status(200).json({ 
        success: true,
        message: 'Je bent al aangemeld voor onze nieuwsbrief'
      });
      return;
    }
    
    // Save to Firestore
    const subscriberData = {
      email: email.toLowerCase(),
      name: name || null,
      subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'website',
      status: 'active'
    };
    
    const docRef = await db.collection('newsletter').add(subscriberData);
    
    // Log the subscription
    console.log('New newsletter subscription:', docRef.id, email);
    
    // Send success response
    res.status(201).json({ 
      success: true,
      message: 'Bedankt voor je aanmelding!',
      subscriptionId: docRef.id
    });
    
  } catch (error) {
    console.error('Newsletter signup error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Er ging iets mis. Probeer het later opnieuw.'
    });
  }
});

// ============================================
// CONTACT FORM FUNCTION
// ============================================
exports.contactForm = functions.https.onRequest(async (req, res) => {
  // Handle CORS
  if (cors(req, res)) return;
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Please use POST method'
    });
    return;
  }
  
  try {
    // Extract form data
    const { 
      name, 
      email, 
      phone,
      stadsdeel,
      subject,
      message, 
      type 
    } = req.body;
    
    // Validation
    const errors = [];
    
    if (!name || name.trim().length < 2) {
      errors.push('Naam is verplicht');
    }
    
    if (!email) {
      errors.push('Email is verplicht');
    } else if (!validateEmail(email)) {
      errors.push('Ongeldig email adres');
    }
    
    if (!message || message.trim().length < 10) {
      errors.push('Bericht is verplicht');
    }
    
    if (errors.length > 0) {
      res.status(400).json({ 
        error: 'Validation error',
        messages: errors
      });
      return;
    }
    
    // Prepare contact data
    const contactData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || null,
      stadsdeel: stadsdeel || null,
      subject: subject || 'Algemeen contact',
      message: message.trim(),
      type: type || 'general',
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'new',
      read: false,
      replied: false
    };
    
    // Save to Firestore
    const docRef = await db.collection('contact').add(contactData);
    
    // Log the submission
    console.log('New contact form submission:', docRef.id, email);
    
    // Send success response
    res.status(201).json({ 
      success: true,
      message: 'Bedankt voor je bericht!',
      submissionId: docRef.id
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Er ging iets mis. Probeer het later opnieuw.'
    });
  }
});

// ============================================
// HEALTH CHECK FUNCTION
// ============================================
exports.healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    service: 'Verenigd Amsterdam Cloud Functions',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Log function initialization
console.log('Verenigd Amsterdam Cloud Functions initialized successfully');