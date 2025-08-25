// Verenigd Amsterdam Network - Enhanced JavaScript Functionality

class VeiligheidsNetwork {
    constructor() {
        this.incidents = [];
        this.isLoading = false;
        this.lastUpdate = new Date();
        this.updateInterval = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.startRealTimeUpdates();
        this.initializeNotifications();
        console.log('🚔 Verenigd Amsterdam Veiligheidsnetwerk geladen');
    }

    bindEvents() {
        // Incident card interactions
        this.bindIncidentCards();
        
        // Search functionality
        this.bindSearch();
        
        // Quick actions
        this.bindQuickActions();
        
        // Tag filtering
        this.bindTagFiltering();
    }

    bindIncidentCards() {
        document.querySelectorAll('.incident-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    this.showIncidentDetails(card);
                }
            });

            // Add keyboard navigation
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.showIncidentDetails(card);
                }
            });
        });
    }

    bindSearch() {
        const searchForm = document.querySelector('form');
        const searchInput = document.querySelector('input[type="search"]');
        
        if (searchForm && searchInput) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch(searchInput.value);
            });

            // Real-time search as user types
            searchInput.addEventListener('input', 
                this.debounce((e) => {
                    if (e.target.value.length > 2) {
                        this.performSearch(e.target.value);
                    }
                }, 300)
            );
        }
    }

    bindQuickActions() {
        // Incident reporting
        document.addEventListener('click', (e) => {
            if (e.target.closest('button')?.textContent.includes('Incident melden')) {
                this.showReportModal();
            }
            
            if (e.target.closest('button')?.textContent.includes('Vraag stellen')) {
                this.showQuestionModal();
            }
            
            if (e.target.closest('button')?.textContent.includes('Contact wijkagent')) {
                this.contactLocalOfficer();
            }
        });
    }

    bindTagFiltering() {
        document.querySelectorAll('.tag-cloud .badge').forEach(tag => {
            tag.addEventListener('click', () => {
                const tagText = tag.textContent.split(' ')[0];
                this.filterByTag(tagText);
            });
        });
    }

    showIncidentDetails(card) {
        const title = card.querySelector('.card-title').textContent;
        const description = card.querySelector('.card-text').textContent;
        const location = card.querySelector('.fa-map-marker-alt').nextSibling.textContent.trim();
        const time = card.querySelector('.fa-clock').nextSibling.textContent.trim();
        
        const modal = this.createModal('Incident Details', `
            <div class="incident-details">
                <h4>${title}</h4>
                <p class="text-muted mb-3">${description}</p>
                <div class="row">
                    <div class="col-6">
                        <strong>📍 Locatie:</strong><br>
                        ${location}
                    </div>
                    <div class="col-6">
                        <strong>🕐 Tijd:</strong><br>
                        ${time}
                    </div>
                </div>
                <hr>
                <div class="mt-3">
                    <button class="btn btn-police-blue me-2" onclick="this.shareIncident('${title}')">
                        <i class="fas fa-share me-1"></i> Delen
                    </button>
                    <button class="btn btn-outline-police-blue me-2" onclick="this.followIncident('${title}')">
                        <i class="fas fa-bell me-1"></i> Volgen
                    </button>
                    <button class="btn btn-outline-secondary" onclick="this.reportFakeNews('${title}')">
                        <i class="fas fa-flag me-1"></i> Rapporteer
                    </button>
                </div>
            </div>
        `);
        
        modal.show();
    }

    performSearch(query) {
        console.log(`🔍 Zoeken naar: ${query}`);
        
        // Show loading state
        this.showSearchLoading();
        
        // Simulate API call
        setTimeout(() => {
            const results = this.mockSearchResults(query);
            this.displaySearchResults(results);
            this.hideSearchLoading();
        }, 500);
    }

    mockSearchResults(query) {
        const mockIncidents = [
            {
                title: `Zoekresultaat voor "${query}" - Incident Centrum`,
                description: `Incident gerelateerd aan zoekopdracht "${query}" in het centrum van Amsterdam.`,
                location: 'Centrum Amsterdam',
                time: '5 minuten geleden',
                priority: 'medium'
            },
            {
                title: `${query} - Gerelateerd incident Noord`,
                description: `Politiebericht over "${query}" in Amsterdam Noord.`,
                location: 'Amsterdam Noord',
                time: '1 uur geleden',
                priority: 'low'
            }
        ];
        
        return mockIncidents.filter(incident => 
            incident.title.toLowerCase().includes(query.toLowerCase()) ||
            incident.description.toLowerCase().includes(query.toLowerCase())
        );
    }

    displaySearchResults(results) {
        const incidentsList = document.querySelector('.incidents-list');
        
        if (results.length === 0) {
            this.showNotification('Geen resultaten gevonden', 'warning');
            return;
        }
        
        // Clear current incidents
        incidentsList.innerHTML = '';
        
        // Add search results
        results.forEach(incident => {
            const incidentCard = this.createIncidentCard(incident);
            incidentsList.appendChild(incidentCard);
        });
        
        this.showNotification(`${results.length} resultaat(en) gevonden`, 'success');
    }

    createIncidentCard(incident) {
        const card = document.createElement('div');
        card.className = `incident-card card mb-3 incident-priority-${incident.priority}`;
        
        const priorityColors = {
            high: 'danger',
            medium: 'warning', 
            low: 'success'
        };
        
        const priorityIcons = {
            high: 'exclamation-triangle',
            medium: 'car-crash',
            low: 'bicycle'
        };
        
        card.innerHTML = `
            <div class="card-body">
                <div class="row">
                    <div class="col-auto">
                        <div class="incident-icon bg-${priorityColors[incident.priority]} text-white rounded-circle p-3">
                            <i class="fas fa-${priorityIcons[incident.priority]}"></i>
                        </div>
                    </div>
                    <div class="col">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-1">${incident.title}</h5>
                            <span class="badge bg-${priorityColors[incident.priority]}">Prioriteit: ${incident.priority === 'high' ? 'Hoog' : incident.priority === 'medium' ? 'Gemiddeld' : 'Laag'}</span>
                        </div>
                        <p class="card-text text-muted">${incident.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="fas fa-map-marker-alt me-1"></i>
                                ${incident.location}
                            </small>
                            <small class="text-muted">
                                <i class="fas fa-clock me-1"></i>
                                ${incident.time}
                            </small>
                        </div>
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-police-blue me-2">
                                <i class="fas fa-info-circle me-1"></i>
                                Meer info
                            </button>
                            <button class="btn btn-sm btn-outline-secondary">
                                <i class="fas fa-share me-1"></i>
                                Delen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return card;
    }

    showSearchLoading() {
        const loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'text-center p-4';
        loadingSpinner.id = 'search-loading';
        loadingSpinner.innerHTML = `
            <div class="spinner-border text-police-blue" role="status">
                <span class="visually-hidden">Zoeken...</span>
            </div>
            <p class="mt-2 text-muted">Zoeken in politieberichten...</p>
        `;
        
        const incidentsList = document.querySelector('.incidents-list');
        incidentsList.insertAdjacentElement('beforebegin', loadingSpinner);
    }

    hideSearchLoading() {
        const loader = document.getElementById('search-loading');
        if (loader) loader.remove();
    }

    filterByTag(tag) {
        console.log(`🏷️ Filter op tag: ${tag}`);
        this.performSearch(tag);
    }

    showReportModal() {
        const modal = this.createModal('Incident Melden', `
            <form id="incident-report-form">
                <div class="mb-3">
                    <label for="incident-type" class="form-label">Type incident</label>
                    <select class="form-select" id="incident-type" required>
                        <option value="">Selecteer type...</option>
                        <option value="theft">Diefstal</option>
                        <option value="burglary">Inbraak</option>
                        <option value="violence">Geweld</option>
                        <option value="drugs">Drugs</option>
                        <option value="traffic">Verkeer</option>
                        <option value="nuisance">Overlast</option>
                        <option value="other">Anders</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="incident-location" class="form-label">Locatie</label>
                    <input type="text" class="form-control" id="incident-location" placeholder="Adres of buurt" required>
                </div>
                <div class="mb-3">
                    <label for="incident-description" class="form-label">Beschrijving</label>
                    <textarea class="form-control" id="incident-description" rows="4" placeholder="Beschrijf wat er is gebeurd..." required></textarea>
                </div>
                <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="incident-anonymous">
                    <label class="form-check-label" for="incident-anonymous">
                        Anonieme melding
                    </label>
                </div>
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>Let op:</strong> Voor spoedeisende gevallen bel direct 112!
                </div>
            </form>
        `, `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuleren</button>
            <button type="submit" form="incident-report-form" class="btn btn-police-blue">Melding Versturen</button>
        `);

        // Handle form submission
        document.getElementById('incident-report-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitIncidentReport();
            modal.hide();
        });

        modal.show();
    }

    showQuestionModal() {
        const modal = this.createModal('Vraag Stellen', `
            <form id="question-form">
                <div class="mb-3">
                    <label for="question-category" class="form-label">Categorie</label>
                    <select class="form-select" id="question-category" required>
                        <option value="">Selecteer categorie...</option>
                        <option value="safety">Veiligheid in buurt</option>
                        <option value="police">Politie zichtbaarheid</option>
                        <option value="policy">Veiligheidsbeleid</option>
                        <option value="prevention">Preventie maatregelen</option>
                        <option value="other">Anders</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="question-text" class="form-label">Jouw vraag</label>
                    <textarea class="form-control" id="question-text" rows="4" placeholder="Wat wil je weten over veiligheid in Amsterdam?" required></textarea>
                </div>
                <div class="mb-3">
                    <label for="question-email" class="form-label">E-mailadres (optioneel)</label>
                    <input type="email" class="form-control" id="question-email" placeholder="Voor een persoonlijk antwoord">
                </div>
            </form>
        `, `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuleren</button>
            <button type="submit" form="question-form" class="btn btn-police-blue">Vraag Versturen</button>
        `);

        document.getElementById('question-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitQuestion();
            modal.hide();
        });

        modal.show();
    }

    contactLocalOfficer() {
        const modal = this.createModal('Contact Wijkagent', `
            <div class="text-center">
                <i class="fas fa-user-shield fa-4x text-police-blue mb-3"></i>
                <h4>Wijkagent Contact</h4>
                <p class="text-muted mb-4">Neem direct contact op met jouw wijkagent</p>
                
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <div class="card h-100">
                            <div class="card-body text-center">
                                <i class="fas fa-phone fa-2x text-police-blue mb-2"></i>
                                <h6>Telefonisch</h6>
                                <a href="tel:0900-8844" class="btn btn-police-blue">0900-8844</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="card h-100">
                            <div class="card-body text-center">
                                <i class="fas fa-envelope fa-2x text-police-blue mb-2"></i>
                                <h6>E-mail</h6>
                                <a href="mailto:wijkagent@politie.nl" class="btn btn-outline-police-blue">E-mail</a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="alert alert-info mt-3">
                    <strong>Tip:</strong> Vermeld altijd je postcode voor de juiste wijkagent
                </div>
            </div>
        `);

        modal.show();
    }

    submitIncidentReport() {
        // Simulate API call
        this.showNotification('Incident melding wordt verwerkt...', 'info');
        
        setTimeout(() => {
            this.showNotification('Melding succesvol verstuurd! Bedankt voor je bijdrage aan de veiligheid.', 'success');
        }, 1500);
    }

    submitQuestion() {
        this.showNotification('Vraag wordt verstuurd...', 'info');
        
        setTimeout(() => {
            this.showNotification('Vraag verstuurd! Je krijgt binnen 24 uur een antwoord.', 'success');
        }, 1500);
    }

    startRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            this.checkForUpdates();
        }, 30000); // Check every 30 seconds
    }

    checkForUpdates() {
        // Simulate checking for new incidents
        const now = new Date();
        const timeDiff = now - this.lastUpdate;
        
        if (timeDiff > 60000) { // If more than 1 minute since last update
            this.addRealTimeUpdate();
            this.lastUpdate = now;
        }
    }

    addRealTimeUpdate() {
        const updates = [
            'Nieuw incident gemeld in centrum Amsterdam',
            'Politie patrol versterkt in Noord-Amsterdam', 
            'Verkeersopstopping opgelost op A10',
            'Extra surveillance tijdens avondspits',
            'Verdachte aangehouden na woninginbraak'
        ];
        
        const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
        this.showNotification(randomUpdate, 'info');
        
        // Update real-time indicator
        const indicator = document.querySelector('.realtime-indicator');
        if (indicator) {
            indicator.style.background = '#ff6b6b';
            setTimeout(() => {
                indicator.style.background = '#28a745';
            }, 1000);
        }
    }

    initializeNotifications() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('📱 Notificaties ingeschakeld');
                }
            });
        }
    }

    showNotification(message, type = 'info', duration = 4000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : type === 'error' ? 'danger' : 'info'} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 100px; 
            right: 20px; 
            z-index: 9999; 
            min-width: 350px;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle', 
            error: 'times-circle',
            info: 'info-circle'
        };
        
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${icons[type]} me-2"></i>
                <div class="flex-grow-1">${message}</div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        }
        
        return notification;
    }

    createModal(title, body, footer = '') {
        const modalId = 'dynamic-modal-' + Date.now();
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = modalId;
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${body}
                    </div>
                    ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const bootstrapModal = new bootstrap.Modal(modal);
        
        // Clean up after modal is hidden
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
        
        return bootstrapModal;
    }

    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Cleanup method
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.veiligheidsNetwork = new VeiligheidsNetwork();
});

// Global functions for backwards compatibility
function scrollToIncidents() {
    document.getElementById('incidents-section').scrollIntoView({
        behavior: 'smooth'
    });
}

function showCrimeMap() {
    document.getElementById('crime-map-section').scrollIntoView({
        behavior: 'smooth'
    });
}

function refreshIncidents() {
    if (window.veiligheidsNetwork) {
        const button = event.target.closest('button');
        const icon = button.querySelector('i');
        
        button.disabled = true;
        icon.classList.add('fa-spin');
        
        setTimeout(() => {
            button.disabled = false;
            icon.classList.remove('fa-spin');
            window.veiligheidsNetwork.showNotification('Berichten bijgewerkt', 'success');
        }, 2000);
    }
}

function showReportModal() {
    if (window.veiligheidsNetwork) {
        window.veiligheidsNetwork.showReportModal();
    }
}

function showEmergencyInfo() {
    const info = `
🚨 NOODGEVALLEN AMSTERDAM 🚨

📞 112 - Spoed (ambulance, brandweer, politie)
🚔 0900-8844 - Politie (niet-spoedeisend)  
💜 0800-2000 - Slachtofferhulp
📱 06-49319157 - Verenigd Amsterdam Veiligheid

⚠️ Bij levensbedreigende situaties: BEL 112!
    `;
    
    alert(info);
}
