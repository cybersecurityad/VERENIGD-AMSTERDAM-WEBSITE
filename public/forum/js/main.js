/**
 * Verenigd Amsterdam Network Forum - Main JavaScript
 * Handles user interactions, authentication, and dynamic content
 */

// Global configuration
const CONFIG = {
    API_BASE_URL: 'https://api.verenigdamsterdam.nl',
    FORUM_ENDPOINT: '/api/forum',
    AUTH_ENDPOINT: '/api/auth',
    ANIMATION_DURATION: 300,
    SEARCH_DEBOUNCE_DELAY: 500,
    FIREBASE_CONFIG: {
        databaseURL:
            'https://toursamsterdam-eu-1-default-rtdb.europe-west1.firebasedatabase.app/',
        storageBucket: 'gs://toursamsterdam-eu-1.firebasestorage.app',
    },
};

// Application state
const AppState = {
    currentUser: null,
    isLoggedIn: false,
    searchTimeout: null,
    notifications: [],
    firebaseInitialized: false,
    realtimeListeners: [],
    offlineMode: false,
    theme: 'light',
};

// Theme Management
class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.bindEvents();
    }

    getStoredTheme() {
        return localStorage.getItem('va-forum-theme');
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        AppState.theme = theme;
        localStorage.setItem('va-forum-theme', theme);

        // Update theme toggle button aria-label
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.setAttribute(
                'aria-label',
                theme === 'light'
                    ? 'Schakel naar donker thema'
                    : 'Schakel naar licht thema'
            );
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);

        // Add smooth transition
        document.body.style.transition =
            'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    bindEvents() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Listen for system theme changes
        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', (e) => {
                if (!this.getStoredTheme()) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
    }
}

// DOM Ready
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    console.log('Initializing Verenigd Amsterdam Forum...');

    // Initialize theme first
    window.themeManager = new ThemeManager();

    // Initialize Firebase Admin Integration
    window.firebaseAdminIntegration = new FirebaseAdminIntegration();

    // Initialize components
    initializeAuth();
    initializeSearch();
    initializeFormHandlers();
    initializeUIEffects();
    initializeAccessibility();

    // Initialize Firebase real-time features
    initializeFirebaseFeatures();

    // Check for existing session
    checkExistingSession();

    // Setup offline support
    setupOfflineSupport();

    console.log('Forum initialized successfully');
}

/**
 * Authentication System
 */
function initializeAuth() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Modal event listeners
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');

    if (loginModal) {
        loginModal.addEventListener('shown.bs.modal', function () {
            document.getElementById('login-email')?.focus();
        });
    }

    if (registerModal) {
        registerModal.addEventListener('shown.bs.modal', function () {
            document.getElementById('register-firstname')?.focus();
        });
    }
}

/**
 * Handle login form submission
 */
async function handleLogin(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const loginData = {
        email:
            formData.get('email') ||
            document.getElementById('login-email')?.value,
        password:
            formData.get('password') ||
            document.getElementById('login-password')?.value,
        remember: document.getElementById('remember-me')?.checked || false,
    };

    // Validate form data
    if (!loginData.email || !loginData.password) {
        showNotification('Vul alle velden in', 'error');
        return;
    }

    try {
        showLoadingState('login-form');

        // Simulate API call (replace with actual API endpoint)
        const response = await simulateAPICall('login', loginData);

        if (response.success) {
            AppState.currentUser = response.user;
            AppState.isLoggedIn = true;

            // Store session if remember me is checked
            if (loginData.remember) {
                localStorage.setItem('va_session', response.token);
            } else {
                sessionStorage.setItem('va_session', response.token);
            }

            updateUIForLoggedInUser();
            hideModal('login-modal');
            showNotification(`Welkom terug, ${response.user.name}!`, 'success');
        } else {
            showNotification(response.message || 'Inloggen mislukt', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Er is een fout opgetreden bij het inloggen', 'error');
    } finally {
        hideLoadingState('login-form');
    }
}

/**
 * Handle registration form submission
 */
async function handleRegister(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const registerData = {
        firstName:
            formData.get('firstName') ||
            document.getElementById('register-firstname')?.value,
        lastName:
            formData.get('lastName') ||
            document.getElementById('register-lastname')?.value,
        email:
            formData.get('email') ||
            document.getElementById('register-email')?.value,
        username:
            formData.get('username') ||
            document.getElementById('register-username')?.value,
        password:
            formData.get('password') ||
            document.getElementById('register-password')?.value,
        passwordConfirm:
            formData.get('passwordConfirm') ||
            document.getElementById('register-password-confirm')?.value,
        agreeTerms: document.getElementById('agree-terms')?.checked || false,
        newsletter:
            document.getElementById('newsletter-signup')?.checked || false,
    };

    // Validate form data
    const validation = validateRegistrationData(registerData);
    if (!validation.isValid) {
        showNotification(validation.message, 'error');
        return;
    }

    try {
        showLoadingState('register-form');

        // Simulate API call (replace with actual API endpoint)
        const response = await simulateAPICall('register', registerData);

        if (response.success) {
            hideModal('register-modal');
            showNotification(
                'Account succesvol aangemaakt! Je kunt nu inloggen.',
                'success'
            );

            // Auto-fill login form
            setTimeout(() => {
                document.getElementById('login-email').value =
                    registerData.email;
                const loginModal = new bootstrap.Modal(
                    document.getElementById('login-modal')
                );
                loginModal.show();
            }, 1000);
        } else {
            showNotification(
                response.message || 'Registratie mislukt',
                'error'
            );
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification(
            'Er is een fout opgetreden bij de registratie',
            'error'
        );
    } finally {
        hideLoadingState('register-form');
    }
}

/**
 * Validate registration data
 */
function validateRegistrationData(data) {
    if (!data.firstName || !data.lastName) {
        return { isValid: false, message: 'Vul je voor- en achternaam in' };
    }

    if (!data.email || !isValidEmail(data.email)) {
        return { isValid: false, message: 'Vul een geldig e-mailadres in' };
    }

    if (!data.username || data.username.length < 3) {
        return {
            isValid: false,
            message: 'Gebruikersnaam moet minimaal 3 karakters zijn',
        };
    }

    if (!data.password || data.password.length < 8) {
        return {
            isValid: false,
            message: 'Wachtwoord moet minimaal 8 karakters zijn',
        };
    }

    if (data.password !== data.passwordConfirm) {
        return { isValid: false, message: 'Wachtwoorden komen niet overeen' };
    }

    if (!data.agreeTerms) {
        return {
            isValid: false,
            message: 'Je moet akkoord gaan met de voorwaarden',
        };
    }

    return { isValid: true };
}

/**
 * Search Functionality
 */
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchForm = document.querySelector('.search-form');

    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keydown', handleSearchKeydown);
    }

    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchSubmit);
    }
}

/**
 * Handle search input with debouncing
 */
function handleSearchInput(event) {
    const query = event.target.value.trim();

    // Clear previous timeout
    if (AppState.searchTimeout) {
        clearTimeout(AppState.searchTimeout);
    }

    // Debounce search
    AppState.searchTimeout = setTimeout(() => {
        if (query.length >= 3) {
            performSearch(query);
        } else {
            clearSearchResults();
        }
    }, CONFIG.SEARCH_DEBOUNCE_DELAY);
}

/**
 * Handle search form submission
 */
function handleSearchSubmit(event) {
    event.preventDefault();
    const query = document.getElementById('search-input')?.value.trim();

    if (query) {
        performSearch(query);
    }
}

/**
 * Perform search operation
 */
async function performSearch(query) {
    try {
        console.log(`Searching for: ${query}`);

        // Show loading indicator
        showSearchLoading();

        // Simulate API search (replace with actual search endpoint)
        const results = await simulateAPICall('search', { query });

        displaySearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Er is een fout opgetreden bij zoeken', 'error');
    } finally {
        hideSearchLoading();
    }
}

/**
 * Form Handlers
 */
function initializeFormHandlers() {
    // Newsletter signup
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSignup);
    }

    // New topic button
    const newTopicBtn = document.getElementById('new-topic-btn');
    if (newTopicBtn) {
        newTopicBtn.addEventListener('click', handleNewTopic);
    }

    // Category links
    const categoryLinks = document.querySelectorAll(
        '.category-item .stretched-link'
    );
    categoryLinks.forEach((link) => {
        link.addEventListener('click', handleCategoryClick);
    });

    // Political Action Form (Firebase Admin SDK)
    initializePoliticalActionForms();

    // Enhanced Forum Post Form (Firebase Admin SDK)
    initializeEnhancedForumForms();
}

/**
 * Initialize Political Action Forms with Firebase Admin SDK
 */
function initializePoliticalActionForms() {
    // VA Action Form
    const vaActionForm = document.getElementById('va-action-form');
    if (vaActionForm) {
        vaActionForm.addEventListener('submit', handleVAActionSubmission);
    }

    // Network Building Form
    const networkForm = document.getElementById('network-form');
    if (networkForm) {
        networkForm.addEventListener('submit', handleNetworkSubmission);
    }

    // VA Handhaving Form
    const handhavingForm = document.getElementById('handhaving-form');
    if (handhavingForm) {
        handhavingForm.addEventListener('submit', handleHandhavingSubmission);
    }
}

/**
 * Handle VA Political Action Submission
 */
async function handleVAActionSubmission(event) {
    event.preventDefault();

    if (!AppState.isLoggedIn) {
        showNotification('Log in om een politieke actie te starten', 'warning');
        return;
    }

    const formData = new FormData(event.target);
    const actionData = {
        title: formData.get('title'),
        description: formData.get('description'),
        type: 'politiek',
        targetDate: formData.get('targetDate'),
        category: formData.get('category') || 'algemeen',
    };

    if (!actionData.title || !actionData.description) {
        showNotification('Vul alle verplichte velden in', 'error');
        return;
    }

    try {
        showLoadingState('va-action-form');

        if (window.firebaseAdminIntegration) {
            const result =
                await window.firebaseAdminIntegration.createPoliticalAction(
                    actionData.title,
                    actionData.description,
                    actionData.type,
                    actionData.targetDate,
                    actionData.category
                );

            showNotification(
                'Politieke actie succesvol aangemaakt!',
                'success'
            );
            event.target.reset();

            // Update UI with new action
            console.log('Political action created:', result);
        } else {
            throw new Error('Firebase Admin SDK niet beschikbaar');
        }
    } catch (error) {
        console.error('Error creating political action:', error);
        showNotification(
            'Fout bij aanmaken politieke actie: ' + error.message,
            'error'
        );
    } finally {
        hideLoadingState('va-action-form');
    }
}

/**
 * Handle Network Building Submission
 */
async function handleNetworkSubmission(event) {
    event.preventDefault();

    if (!AppState.isLoggedIn) {
        showNotification(
            'Log in om deel te nemen aan netwerk building',
            'warning'
        );
        return;
    }

    const formData = new FormData(event.target);
    const networkData = {
        title: formData.get('title'),
        description: formData.get('description'),
        type: 'netwerk',
        skillsOffered: formData.get('skillsOffered'),
        skillsNeeded: formData.get('skillsNeeded'),
    };

    try {
        showLoadingState('network-form');

        if (window.firebaseAdminIntegration) {
            const result =
                await window.firebaseAdminIntegration.createPoliticalAction(
                    networkData.title,
                    `${networkData.description}\n\nAangeboden vaardigheden: ${networkData.skillsOffered}\nGezochte vaardigheden: ${networkData.skillsNeeded}`,
                    networkData.type,
                    null,
                    'netwerk'
                );

            showNotification(
                'Netwerk initiatief succesvol aangemaakt!',
                'success'
            );
            event.target.reset();
        } else {
            throw new Error('Firebase Admin SDK niet beschikbaar');
        }
    } catch (error) {
        console.error('Error creating network initiative:', error);
        showNotification(
            'Fout bij aanmaken netwerk initiatief: ' + error.message,
            'error'
        );
    } finally {
        hideLoadingState('network-form');
    }
}

/**
 * Handle VA-Handhaving Submission
 */
async function handleHandhavingSubmission(event) {
    event.preventDefault();

    if (!AppState.isLoggedIn) {
        showNotification(
            'Log in om een handhavingsverzoek in te dienen',
            'warning'
        );
        return;
    }

    const formData = new FormData(event.target);
    const handhavingData = {
        title: formData.get('title'),
        description: formData.get('description'),
        type: 'handhaving',
        location: formData.get('location'),
        urgency: formData.get('urgency'),
        contactInfo: formData.get('contactInfo'),
    };

    try {
        showLoadingState('handhaving-form');

        if (window.firebaseAdminIntegration) {
            const result =
                await window.firebaseAdminIntegration.createPoliticalAction(
                    `VA-Handhaving: ${handhavingData.title}`,
                    `${handhavingData.description}\n\nLocatie: ${handhavingData.location}\nUrgentie: ${handhavingData.urgency}\nContact: ${handhavingData.contactInfo}`,
                    handhavingData.type,
                    null,
                    'handhaving'
                );

            showNotification(
                'Handhavingsverzoek succesvol ingediend!',
                'success'
            );
            event.target.reset();
        } else {
            throw new Error('Firebase Admin SDK niet beschikbaar');
        }
    } catch (error) {
        console.error('Error creating handhaving request:', error);
        showNotification(
            'Fout bij indienen handhavingsverzoek: ' + error.message,
            'error'
        );
    } finally {
        hideLoadingState('handhaving-form');
    }
}

/**
 * Initialize Enhanced Forum Forms with Firebase Admin SDK
 */
function initializeEnhancedForumForms() {
    // Enhanced discussion form
    const discussionForm = document.getElementById('discussion-form');
    if (discussionForm) {
        discussionForm.addEventListener(
            'submit',
            handleEnhancedDiscussionSubmission
        );
    }
}

/**
 * Handle Enhanced Discussion Submission with Firebase Admin SDK
 */
async function handleEnhancedDiscussionSubmission(event) {
    event.preventDefault();

    if (!AppState.isLoggedIn) {
        showNotification('Log in om een discussie te starten', 'warning');
        return;
    }

    const formData = new FormData(event.target);
    const postData = {
        title: formData.get('title'),
        content: formData.get('content'),
        categoryId: formData.get('category'),
        tags: formData.get('tags')
            ? formData
                  .get('tags')
                  .split(',')
                  .map((tag) => tag.trim())
            : [],
    };

    if (!postData.title || !postData.content || !postData.categoryId) {
        showNotification('Vul alle verplichte velden in', 'error');
        return;
    }

    try {
        showLoadingState('discussion-form');

        if (window.firebaseAdminIntegration) {
            const result =
                await window.firebaseAdminIntegration.createForumPost(
                    postData.title,
                    postData.content,
                    postData.categoryId,
                    postData.tags
                );

            showNotification('Discussie succesvol gestart!', 'success');
            event.target.reset();

            // Update forum display
            console.log('Forum post created:', result);
        } else {
            throw new Error('Firebase Admin SDK niet beschikbaar');
        }
    } catch (error) {
        console.error('Error creating forum post:', error);
        showNotification(
            'Fout bij starten discussie: ' + error.message,
            'error'
        );
    } finally {
        hideLoadingState('discussion-form');
    }
}

/**
 * Handle newsletter signup
 */
async function handleNewsletterSignup(event) {
    event.preventDefault();

    const emailInput = event.target.querySelector('input[type="email"]');
    const email = emailInput?.value;

    if (!email || !isValidEmail(email)) {
        showNotification('Vul een geldig e-mailadres in', 'error');
        return;
    }

    try {
        showLoadingState(event.target);

        const response = await simulateAPICall('newsletter', { email });

        if (response.success) {
            emailInput.value = '';
            showNotification(
                'Je bent ingeschreven voor de nieuwsbrief!',
                'success'
            );
        } else {
            showNotification(
                response.message || 'Inschrijving mislukt',
                'error'
            );
        }
    } catch (error) {
        console.error('Newsletter signup error:', error);
        showNotification('Er is een fout opgetreden', 'error');
    } finally {
        hideLoadingState(event.target);
    }
}

/**
 * UI Effects and Interactions
 */
function initializeUIEffects() {
    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', handleSmoothScroll);
    });

    // Category hover effects
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach((item) => {
        item.addEventListener('mouseenter', handleCategoryHover);
        item.addEventListener('mouseleave', handleCategoryLeave);
    });

    // Animate elements on scroll
    initializeScrollAnimations();

    // Add ripple effect to buttons
    initializeRippleEffects();
}

/**
 * Handle smooth scrolling
 */
function handleSmoothScroll(event) {
    event.preventDefault();

    const targetId = event.target.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }
}

/**
 * Scroll to forum section
 */
function scrollToForum() {
    const forumSection = document.getElementById('forum-section');
    if (forumSection) {
        forumSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }
}

/**
 * Password toggle functionality
 */
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input?.nextElementSibling;
    const icon = button?.querySelector('i');

    if (input && icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }
}

/**
 * Accessibility Features
 */
function initializeAccessibility() {
    // Keyboard navigation for forum categories
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach((item, index) => {
        item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', (event) => {
            handleCategoryKeydown(event, index, categoryItems);
        });
    });

    // Announce dynamic content changes to screen readers
    createAriaLiveRegion();

    // Focus management for modals
    initializeModalFocusManagement();
}

/**
 * Handle keyboard navigation for categories
 */
function handleCategoryKeydown(event, currentIndex, items) {
    let targetIndex = currentIndex;

    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            targetIndex = (currentIndex + 1) % items.length;
            break;
        case 'ArrowUp':
            event.preventDefault();
            targetIndex =
                currentIndex === 0 ? items.length - 1 : currentIndex - 1;
            break;
        case 'Enter':
        case ' ':
            event.preventDefault();
            const link = items[currentIndex].querySelector('.stretched-link');
            if (link) link.click();
            return;
        default:
            return;
    }

    items[targetIndex].focus();
}

/**
 * Firebase Real-time Features with Admin SDK Integration
 */
function initializeFirebaseFeatures() {
    // Initialize Firebase Admin Integration
    if (window.firebaseAdminIntegration) {
        window.firebaseAdminIntegration.initializeAuth();

        // Setup auth state listener
        window.firebaseAdminIntegration.onAuthStateChanged((user) => {
            if (user) {
                AppState.currentUser = user;
                AppState.isLoggedIn = true;
                updateUIForAuthenticatedUser(user);
                console.log('User authenticated with Firebase Admin SDK');
            } else {
                AppState.currentUser = null;
                AppState.isLoggedIn = false;
                updateUIForGuestUser();
            }
        });
    }

    // Wait for Firebase client to be loaded for real-time features
    const checkFirebase = setInterval(() => {
        if (window.firebaseApp && window.firebaseDB) {
            clearInterval(checkFirebase);
            AppState.firebaseInitialized = true;

            // Setup real-time forum discussions
            setupRealtimeDiscussions();

            // Setup push notifications
            setupPushNotificationHandlers();

            // Setup cloud storage for file uploads
            setupCloudStorage();

            // Load forum data from server
            loadForumDataFromServer();

            console.log('Firebase real-time features initialized');
        }
    }, 100);
}

/**
 * Load forum data using Firebase Admin SDK server
 */
async function loadForumDataFromServer() {
    try {
        if (window.firebaseAdminIntegration) {
            // Test server connection
            const health =
                await window.firebaseAdminIntegration.apiService.healthCheck();
            console.log('Server health check:', health);

            // Load categories from server
            const categories =
                await window.firebaseAdminIntegration.getForumCategories();
            console.log('Categories loaded from server:', categories);

            // Update UI with server data
            if (categories && Object.keys(categories).length > 0) {
                updateCategoryDisplayFromServer(categories);
            }
        }
    } catch (error) {
        console.error('Error loading forum data from server:', error);
        // Fallback to client-side Firebase if server is unavailable
        console.log('Falling back to client-side Firebase features');
    }
}

/**
 * Update category display with server data
 */
function updateCategoryDisplayFromServer(categories) {
    Object.keys(categories).forEach((categoryId) => {
        const category = categories[categoryId];
        const categoryElement = document.querySelector(
            `[data-category="${categoryId}"]`
        );
        if (categoryElement) {
            // Update post count
            const postCountElement =
                categoryElement.querySelector('.post-count');
            if (postCountElement && category.postCount !== undefined) {
                postCountElement.textContent = `${category.postCount} berichten`;
            }

            // Update last activity
            const lastActivityElement =
                categoryElement.querySelector('.last-activity');
            if (lastActivityElement && category.lastActivity) {
                const date = new Date(category.lastActivity);
                lastActivityElement.textContent = `Laatste activiteit: ${date.toLocaleDateString(
                    'nl-NL'
                )}`;
            }
        }
    });
}

/**
 * Real-time Forum Discussions
 */
function setupRealtimeDiscussions() {
    if (!window.firebaseDB) return;

    // Listen for new forum posts in real-time
    const { ref, onValue, push, set, serverTimestamp } = window.firebaseDB;

    // Real-time category updates
    const categoriesRef = ref(window.firebaseDB, 'forum/categories');
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
        const categories = snapshot.val();
        if (categories) {
            updateCategoryDisplayRealtime(categories);
        }
    });

    AppState.realtimeListeners.push(unsubscribe);
}

/**
 * Update category display with real-time data
 */
function updateCategoryDisplayRealtime(categories) {
    Object.keys(categories).forEach((categoryId) => {
        const categoryElement = document.querySelector(
            `[data-category="${categoryId}"]`
        );
        if (categoryElement) {
            const category = categories[categoryId];

            // Update topic count
            const topicCount = categoryElement.querySelector('.topic-count');
            if (topicCount) {
                topicCount.textContent = `${
                    category.topicCount || 0
                } onderwerpen`;
            }

            // Update message count
            const messageCount =
                categoryElement.querySelector('.message-count');
            if (messageCount) {
                messageCount.textContent = category.messageCount || 0;
            }

            // Update last activity
            const lastActivity =
                categoryElement.querySelector('.last-activity');
            if (lastActivity && category.lastActivity) {
                lastActivity.textContent = formatTimeAgo(
                    category.lastActivity.timestamp
                );
            }
        }
    });
}

/**
 * Post new forum message in real-time
 */
async function postForumMessage(categoryId, message) {
    if (!window.firebaseDB || !AppState.currentUser) return;

    const { ref, push, set, serverTimestamp } = window.firebaseDB;

    try {
        const messageRef = push(
            ref(window.firebaseDB, `forum/messages/${categoryId}`)
        );
        await set(messageRef, {
            userId: AppState.currentUser.uid,
            username:
                AppState.currentUser.displayName ||
                AppState.currentUser.email.split('@')[0],
            content: message.content,
            title: message.title,
            timestamp: serverTimestamp(),
            likes: 0,
            replies: 0,
        });

        // Update category statistics
        await updateCategoryStats(categoryId);

        // Add to activity feed
        await addToActivityFeed({
            type: 'new_post',
            userId: AppState.currentUser.uid,
            username:
                AppState.currentUser.displayName ||
                AppState.currentUser.email.split('@')[0],
            categoryId: categoryId,
            messageTitle: message.title,
            timestamp: Date.now(),
        });

        showNotification('Bericht succesvol geplaatst!', 'success');
    } catch (error) {
        console.error('Error posting message:', error);
        showNotification('Fout bij plaatsen bericht', 'error');
    }
}

/**
 * Update category statistics
 */
async function updateCategoryStats(categoryId) {
    if (!window.firebaseDB) return;

    const { ref, get, set, increment } = window.firebaseDB;

    try {
        const categoryRef = ref(
            window.firebaseDB,
            `forum/categories/${categoryId}`
        );
        await set(categoryRef, {
            messageCount: increment(1),
            lastActivity: {
                timestamp: Date.now(),
                userId: AppState.currentUser.uid,
            },
        });
    } catch (error) {
        console.error('Error updating category stats:', error);
    }
}

/**
 * Add activity to feed
 */
async function addToActivityFeed(activity) {
    if (!window.firebaseDB) return;

    const { ref, push, set } = window.firebaseDB;

    try {
        const activityRef = push(ref(window.firebaseDB, 'forum/activity'));
        await set(activityRef, activity);
    } catch (error) {
        console.error('Error adding to activity feed:', error);
    }
}

/**
 * Push Notification Handlers
 */
function setupPushNotificationHandlers() {
    // Request notification permission on user interaction
    document.addEventListener('click', requestNotificationPermission, {
        once: true,
    });
}

async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted');
            if (window.FirebaseForumUtils) {
                window.FirebaseForumUtils.setupPushNotifications();
            }
        }
    }
}

/**
 * Cloud Storage Integration
 */
function setupCloudStorage() {
    // Add file upload handlers for forum attachments
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => {
        input.addEventListener('change', handleFileUpload);
    });
}

/**
 * Handle file uploads to Firebase Storage
 */
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file || !window.firebaseStorage) return;

    const { ref, uploadBytes, getDownloadURL } = window.firebaseStorage;

    try {
        showLoadingState(event.target.parentElement);

        // Create unique filename
        const filename = `forum-uploads/${Date.now()}-${file.name}`;
        const storageRef = ref(window.firebaseStorage, filename);

        // Upload file
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Store file reference in database
        if (AppState.currentUser) {
            await storeFileReference(downloadURL, file.name, file.type);
        }

        showNotification('Bestand succesvol geüpload!', 'success');
    } catch (error) {
        console.error('Error uploading file:', error);
        showNotification('Fout bij uploaden bestand', 'error');
    } finally {
        hideLoadingState(event.target.parentElement);
    }
}

/**
 * Store file reference in database
 */
async function storeFileReference(downloadURL, filename, fileType) {
    if (!window.firebaseDB) return;

    const { ref, push, set } = window.firebaseDB;

    try {
        const fileRef = push(
            ref(window.firebaseDB, `forum/files/${AppState.currentUser.uid}`)
        );
        await set(fileRef, {
            url: downloadURL,
            filename: filename,
            fileType: fileType,
            uploadedAt: Date.now(),
            userId: AppState.currentUser.uid,
        });
    } catch (error) {
        console.error('Error storing file reference:', error);
    }
}

/**
 * Offline Support
 */
function setupOfflineSupport() {
    // Register service worker for offline caching
    if ('serviceWorker' in navigator) {
        registerServiceWorker();
    }

    // Monitor online/offline status
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    // Initial status check
    updateConnectionStatus();
}

async function registerServiceWorker() {
    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
    } catch (error) {
        console.error('Service Worker registration failed:', error);
    }
}

function handleOnlineStatus() {
    AppState.offlineMode = false;
    updateConnectionStatus();
    syncOfflineData();
    showNotification('Verbinding hersteld', 'success');
}

function handleOfflineStatus() {
    AppState.offlineMode = true;
    updateConnectionStatus();
    showNotification('Offline modus actief', 'warning');
}

function updateConnectionStatus() {
    const statusIndicator = document.querySelector('.connection-status');
    if (statusIndicator) {
        statusIndicator.textContent = AppState.offlineMode
            ? 'Offline'
            : 'Online';
        statusIndicator.className = `connection-status ${
            AppState.offlineMode ? 'offline' : 'online'
        }`;
    }
}

async function syncOfflineData() {
    // Sync any offline data when connection is restored
    const offlineData = getOfflineData();
    if (offlineData.length > 0) {
        for (const item of offlineData) {
            try {
                await syncDataItem(item);
            } catch (error) {
                console.error('Error syncing offline data:', error);
            }
        }
        clearOfflineData();
    }
}

function getOfflineData() {
    return JSON.parse(localStorage.getItem('va_offline_data') || '[]');
}

function clearOfflineData() {
    localStorage.removeItem('va_offline_data');
}

async function syncDataItem(item) {
    switch (item.type) {
        case 'forum_post':
            await postForumMessage(item.categoryId, item.message);
            break;
        case 'user_profile':
            await updateUserProfile(item.profile);
            break;
        default:
            console.warn('Unknown offline data type:', item.type);
    }
}

/**
 * Utility Functions
 */

/**
 * Simulate API calls (replace with actual API implementation)
 */
async function simulateAPICall(endpoint, data) {
    // Simulate network delay
    await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 1000)
    );

    switch (endpoint) {
        case 'login':
            return {
                success: true,
                user: {
                    id: 1,
                    name: data.email.split('@')[0],
                    email: data.email,
                    avatar: 'assets/default-avatar.png',
                },
                token: 'fake_jwt_token_' + Date.now(),
            };

        case 'register':
            return {
                success: true,
                message: 'Account succesvol aangemaakt',
            };

        case 'search':
            return {
                results: [
                    {
                        id: 1,
                        title: 'Fietsinfrastructuur Amsterdam Noord',
                        excerpt: 'Discussie over verbetering van fietspaden...',
                        category: 'Verkeer & Mobiliteit',
                    },
                    {
                        id: 2,
                        title: 'Duurzame energie voor de toekomst',
                        excerpt: 'Plannen voor zonnepanelen op daken...',
                        category: 'Duurzaamheid & Klimaat',
                    },
                ],
                total: 2,
            };

        case 'newsletter':
            return {
                success: Math.random() > 0.1, // 90% success rate
                message:
                    Math.random() > 0.1
                        ? 'Ingeschreven!'
                        : 'E-mail al ingeschreven',
            };

        default:
            return { success: false, message: 'Unknown endpoint' };
    }
}

/**
 * Show notification to user
 */
function showNotification(message, type = 'info') {
    const notification = createNotificationElement(message, type);
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);

    // Announce to screen readers
    announceToScreenReader(message);
}

/**
 * Create notification element
 */
function createNotificationElement(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)} me-2"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="removeNotification(this.parentElement.parentElement)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add CSS if not already present
    if (!document.querySelector('#notification-styles')) {
        addNotificationStyles();
    }

    return notification;
}

/**
 * Get appropriate icon for notification type
 */
function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle',
    };
    return icons[type] || icons.info;
}

/**
 * Remove notification
 */
function removeNotification(notification) {
    if (notification && notification.parentElement) {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

/**
 * Add notification styles dynamically
 */
function addNotificationStyles() {
    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            min-width: 300px;
            max-width: 500px;
            z-index: 9999;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.hide {
            transform: translateX(100%);
        }
        
        .notification-content {
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
        }
        
        .notification-success .notification-content {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        
        .notification-error .notification-content {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        
        .notification-warning .notification-content {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
        }
        
        .notification-info .notification-content {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
        }
        
        .notification-close {
            background: none;
            border: none;
            margin-left: auto;
            padding: 0.25rem;
            cursor: pointer;
            color: inherit;
            opacity: 0.7;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
    `;
    document.head.appendChild(styles);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show loading state on element
 */
function showLoadingState(elementOrSelector) {
    const element =
        typeof elementOrSelector === 'string'
            ? document.getElementById(elementOrSelector) ||
              document.querySelector(elementOrSelector)
            : elementOrSelector;

    if (element) {
        element.classList.add('loading');
        const submitBtn = element.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.dataset.originalText = submitBtn.textContent;
            submitBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin me-2"></i>Laden...';
        }
    }
}

/**
 * Hide loading state on element
 */
function hideLoadingState(elementOrSelector) {
    const element =
        typeof elementOrSelector === 'string'
            ? document.getElementById(elementOrSelector) ||
              document.querySelector(elementOrSelector)
            : elementOrSelector;

    if (element) {
        element.classList.remove('loading');
        const submitBtn = element.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            if (submitBtn.dataset.originalText) {
                submitBtn.textContent = submitBtn.dataset.originalText;
                delete submitBtn.dataset.originalText;
            }
        }
    }
}

/**
 * Hide modal by ID
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
            bsModal.hide();
        }
    }
}

/**
 * Update UI for logged in user
 */
function updateUIForLoggedInUser() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');

    if (loginBtn && registerBtn && AppState.currentUser) {
        const userDropdown = document.createElement('div');
        userDropdown.className = 'dropdown';
        userDropdown.innerHTML = `
            <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="fas fa-user me-1"></i>${AppState.currentUser.name}
            </button>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#"><i class="fas fa-user me-2"></i>Profiel</a></li>
                <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i>Instellingen</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="logout()"><i class="fas fa-sign-out-alt me-2"></i>Uitloggen</a></li>
            </ul>
        `;

        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        registerBtn.parentElement.appendChild(userDropdown);
    }
}

/**
 * Logout user
 */
function logout() {
    AppState.currentUser = null;
    AppState.isLoggedIn = false;
    localStorage.removeItem('va_session');
    sessionStorage.removeItem('va_session');

    // Reload page to reset UI
    window.location.reload();
}

/**
 * Check for existing session
 */
function checkExistingSession() {
    const token =
        localStorage.getItem('va_session') ||
        sessionStorage.getItem('va_session');

    if (token) {
        // Validate token with server (simulate for now)
        AppState.isLoggedIn = true;
        AppState.currentUser = {
            name: 'Gebruiker',
            email: 'user@example.com',
        };
        updateUIForLoggedInUser();
    }
}

/**
 * Create ARIA live region for screen reader announcements
 */
function createAriaLiveRegion() {
    if (!document.getElementById('aria-live-region')) {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }
}

/**
 * Announce message to screen readers
 */
function announceToScreenReader(message) {
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
        liveRegion.textContent = message;

        // Clear after announcement
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

// Export functions that need to be called from HTML
window.scrollToForum = scrollToForum;
window.togglePassword = togglePassword;
window.removeNotification = removeNotification;
window.logout = logout;

// Expose CONFIG for development
if (typeof window !== 'undefined') {
    window.VAForumConfig = CONFIG;
}
