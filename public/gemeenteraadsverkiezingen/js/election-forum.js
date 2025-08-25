/**
 * Gemeenteraadsverkiezingen Amsterdam 2026 Forum JavaScript
 * Enhanced functionality for the election forum platform
 */

class ElectionForum {
    constructor() {
        this.countdownTarget = new Date('2026-03-18T08:00:00');
        this.isOnline = navigator.onLine;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startCountdown();
        this.setupNetworkMonitoring();
        this.initializeForum();
        this.setupSmoothScroll();
        this.setupSearchFunctionality();
        this.setupCategoryInteractions();
        this.setupResponsiveNavigation();
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation buttons
        document.getElementById('login-btn')?.addEventListener('click', () => this.showLoginModal());
        document.getElementById('register-btn')?.addEventListener('click', () => this.showRegisterModal());
        document.getElementById('new-topic-btn')?.addEventListener('click', () => this.showNewTopicModal());

        // Category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleCategoryClick(e));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleCategoryClick(e);
                }
            });
        });

        // Search form
        document.querySelector('.search-form')?.addEventListener('submit', (e) => this.handleSearch(e));

        // Window events
        window.addEventListener('online', () => this.handleNetworkChange(true));
        window.addEventListener('offline', () => this.handleNetworkChange(false));
        window.addEventListener('resize', () => this.handleResize());
    }

    // Countdown Timer
    startCountdown() {
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = this.countdownTarget.getTime() - now;

            if (distance > 0) {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

                const countdownElement = document.getElementById('countdown-timer');
                if (countdownElement) {
                    if (days > 0) {
                        countdownElement.textContent = `${days} dagen`;
                    } else if (hours > 0) {
                        countdownElement.textContent = `${hours} uur, ${minutes} min`;
                    } else {
                        countdownElement.textContent = `${minutes} minuten`;
                    }
                }
            } else {
                document.getElementById('countdown-timer').textContent = 'Verkiezingsdag!';
            }
        };

        updateCountdown();
        setInterval(updateCountdown, 60000); // Update every minute
    }

    // Network Monitoring
    setupNetworkMonitoring() {
        this.updateConnectionStatus();
    }

    handleNetworkChange(isOnline) {
        this.isOnline = isOnline;
        this.updateConnectionStatus();
        
        if (isOnline) {
            this.showNotification('Verbinding hersteld', 'success');
            this.syncOfflineData();
        } else {
            this.showNotification('Geen internetverbinding', 'warning');
        }
    }

    updateConnectionStatus() {
        // Update any connection indicators if they exist
        const statusElements = document.querySelectorAll('.connection-status');
        statusElements.forEach(element => {
            element.className = `connection-status ${this.isOnline ? 'online' : 'offline'}`;
            element.innerHTML = `
                <i class="fas fa-${this.isOnline ? 'wifi' : 'exclamation-triangle'}" aria-hidden="true"></i>
                <span>${this.isOnline ? 'Online' : 'Offline'}</span>
            `;
        });
    }

    // Forum Initialization
    initializeForum() {
        this.loadForumData();
        this.setupRealTimeUpdates();
        this.loadUserPreferences();
    }

    loadForumData() {
        // Simulate loading forum data
        console.log('Loading forum data...');
        
        // Update category stats with dynamic data
        this.updateCategoryStats();
        
        // Load recent activity
        this.loadRecentActivity();
    }

    updateCategoryStats() {
        const categories = document.querySelectorAll('.category-card');
        categories.forEach((category, index) => {
            // Simulate real-time updates
            const statsElement = category.querySelector('.category-stats');
            if (statsElement) {
                // Add some randomness to make it feel alive
                const baseTopics = 20 + (index * 10);
                const randomTopics = baseTopics + Math.floor(Math.random() * 50);
                
                const topicsSpan = statsElement.querySelector('.category-stat');
                if (topicsSpan) {
                    topicsSpan.innerHTML = `
                        <i class="fas fa-comments" aria-hidden="true"></i>
                        ${randomTopics} onderwerpen
                    `;
                }
            }
        });
    }

    setupRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            if (this.isOnline) {
                this.updateCategoryStats();
                this.updateActivityFeed();
            }
        }, 30000);
    }

    // Search Functionality
    setupSearchFunctionality() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            // Add debounced search as user types
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performLiveSearch(e.target.value);
                }, 300);
            });
        }
    }

    handleSearch(e) {
        e.preventDefault();
        const searchInput = e.target.querySelector('.search-input');
        const query = searchInput.value.trim();
        
        if (query) {
            this.performSearch(query);
        }
    }

    performSearch(query) {
        console.log(`Searching for: ${query}`);
        // Implement search logic here
        this.showNotification(`Zoeken naar "${query}"...`, 'info');
        
        // Simulate search results
        setTimeout(() => {
            this.showSearchResults(query);
        }, 1000);
    }

    performLiveSearch(query) {
        if (query.length > 2) {
            console.log(`Live search: ${query}`);
            // Implement live search suggestions
        }
    }

    showSearchResults(query) {
        // This would typically show search results in a modal or navigate to results page
        this.showNotification(`Gevonden resultaten voor "${query}"`, 'success');
    }

    // Category Interactions
    setupCategoryInteractions() {
        document.querySelectorAll('.category-card').forEach(card => {
            // Add keyboard navigation
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
        });
    }

    handleCategoryClick(e) {
        const card = e.currentTarget;
        const category = card.dataset.category;
        
        // Add visual feedback
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        // Navigate to category
        this.navigateToCategory(category);
    }

    navigateToCategory(category) {
        console.log(`Navigating to category: ${category}`);
        // This would typically navigate to the category page
        this.showNotification(`Laden van ${category} discussies...`, 'info');
        
        // Simulate navigation
        setTimeout(() => {
            // window.location.href = `category/${category}`;
            this.showNotification(`${category} discussies geladen`, 'success');
        }, 1000);
    }

    // Modal Functionality
    showLoginModal() {
        console.log('Showing login modal');
        this.showNotification('Login functionaliteit komt binnenkort', 'info');
    }

    showRegisterModal() {
        console.log('Showing register modal');
        this.showNotification('Registratie functionaliteit komt binnenkort', 'info');
    }

    showNewTopicModal() {
        console.log('Showing new topic modal');
        this.showNotification('Nieuw onderwerp functionaliteit komt binnenkort', 'info');
    }

    // Smooth Scroll
    setupSmoothScroll() {
        window.scrollToForum = () => {
            const forumSection = document.querySelector('.forum-categories');
            if (forumSection) {
                forumSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        };
    }

    // Responsive Navigation
    setupResponsiveNavigation() {
        // Add mobile menu toggle if needed
        this.createMobileMenu();
    }

    createMobileMenu() {
        const nav = document.querySelector('.nav');
        if (!nav) return;

        // Check if we need mobile menu (screen width < 768px)
        if (window.innerWidth < 768) {
            this.addMobileMenuToggle();
        }
    }

    addMobileMenuToggle() {
        const nav = document.querySelector('.nav');
        const navMenu = document.querySelector('.nav-menu');
        
        if (!nav || !navMenu) return;

        // Create mobile menu button
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        mobileToggle.setAttribute('aria-label', 'Toggle mobile menu');

        // Add to nav
        nav.insertBefore(mobileToggle, navMenu);

        // Add click handler
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('mobile-active');
            const isOpen = navMenu.classList.contains('mobile-active');
            mobileToggle.innerHTML = `<i class="fas fa-${isOpen ? 'times' : 'bars'}"></i>`;
        });
    }

    handleResize() {
        // Handle responsive changes
        if (window.innerWidth >= 768) {
            // Remove mobile menu if screen becomes larger
            const mobileToggle = document.querySelector('.mobile-menu-toggle');
            const navMenu = document.querySelector('.nav-menu');
            
            if (mobileToggle) {
                mobileToggle.remove();
            }
            
            if (navMenu) {
                navMenu.classList.remove('mobile-active');
            }
        } else {
            // Add mobile menu if screen becomes smaller
            if (!document.querySelector('.mobile-menu-toggle')) {
                this.addMobileMenuToggle();
            }
        }
    }

    // Activity Feed
    loadRecentActivity() {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;

        // Simulate loading additional activity items
        setTimeout(() => {
            this.updateActivityFeed();
        }, 2000);
    }

    updateActivityFeed() {
        // Simulate new activity
        const activities = [
            {
                type: 'comment',
                user: 'JanAmsterdam',
                action: 'reageerde op',
                subject: 'Verkiezingsdebatten schema',
                time: 'net'
            },
            {
                type: 'post',
                user: 'SarahZuid',
                action: 'startte',
                subject: 'Klimaatplannen vergelijken',
                time: '5 minuten geleden'
            }
        ];

        // This would update the activity feed with new items
        console.log('Updated activity feed:', activities);
    }

    // Notification System
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}" aria-hidden="true"></i>
                <span>${message}</span>
                <button class="notification-close" aria-label="Sluiten">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Position notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;

        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Add close handler
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });

        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideNotification(notification);
        }, 5000);
    }

    hideNotification(notification) {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    getNotificationIcon(type) {
        const icons = {
            info: 'info-circle',
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            info: '#003366',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#dc2626'
        };
        return colors[type] || '#003366';
    }

    // User Preferences
    loadUserPreferences() {
        // Load user preferences from localStorage
        const preferences = localStorage.getItem('electionForumPrefs');
        if (preferences) {
            try {
                const prefs = JSON.parse(preferences);
                this.applyUserPreferences(prefs);
            } catch (e) {
                console.warn('Could not parse user preferences');
            }
        }
    }

    applyUserPreferences(prefs) {
        // Apply user preferences like theme, notifications, etc.
        if (prefs.theme) {
            document.body.className = `theme-${prefs.theme}`;
        }
    }

    saveUserPreferences(prefs) {
        localStorage.setItem('electionForumPrefs', JSON.stringify(prefs));
    }

    // Offline Data Sync
    syncOfflineData() {
        // Sync any offline data when connection is restored
        console.log('Syncing offline data...');
        
        const offlineData = localStorage.getItem('electionForumOfflineData');
        if (offlineData) {
            try {
                const data = JSON.parse(offlineData);
                // Process offline data
                this.processOfflineData(data);
                localStorage.removeItem('electionForumOfflineData');
            } catch (e) {
                console.warn('Could not sync offline data');
            }
        }
    }

    processOfflineData(data) {
        // Process any data that was stored while offline
        console.log('Processing offline data:', data);
    }

    // Accessibility Helpers
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Analytics and Tracking
    trackUserAction(action, category, label) {
        // Track user interactions for analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }
        
        console.log(`Analytics: ${action} - ${category} - ${label}`);
    }
}

// Initialize the forum when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.electionForum = new ElectionForum();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElectionForum;
}
