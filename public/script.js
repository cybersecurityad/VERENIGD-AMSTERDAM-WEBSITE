/**
 * Verenigd Amsterdam - Main Application Script
 * Version: 2.1.0
 * Last Updated: 2024-12-15
 */



// ========================================
// FONT LOADING DETECTION
// ========================================
document.documentElement.classList.add('fonts-loading');

if ('fonts' in document) {
    Promise.all([
        document.fonts.load('400 1em Montserrat'),
        document.fonts.load('600 1em Montserrat'),
        document.fonts.load('700 1em Montserrat')
    ]).then(function () {
        document.documentElement.classList.remove('fonts-loading');
        document.documentElement.classList.add('fonts-loaded');
    }).catch(function() {
        setTimeout(function() {
            document.documentElement.classList.remove('fonts-loading');
            document.documentElement.classList.add('fonts-loaded');
        }, 3000);
    });
} else {
    window.addEventListener('load', function() {
        document.documentElement.classList.remove('fonts-loading');
        document.documentElement.classList.add('fonts-loaded');
    });
}

// ========================================
// GOOGLE ANALYTICS WITH CONSENT
// ========================================
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// Default: GRANT all cookies (opt-out approach)
gtag('consent', 'default', {
    'ad_storage': 'granted',
    'analytics_storage': 'granted',
    'functionality_storage': 'granted',
    'personalization_storage': 'granted',
    'security_storage': 'granted'
});

gtag('js', new Date());
gtag('config', 'G-0B4ZR31YFS', {
    'anonymize_ip': true,
    'cookie_flags': 'SameSite=None;Secure'
});

// ========================================
// COOKIE CONSENT FUNCTIONS
// ========================================
window.acceptCookies = function() {
    localStorage.setItem('cookieConsent', 'all');
    if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
            'analytics_storage': 'granted',
            'ad_storage': 'granted',
            'functionality_storage': 'granted',
            'personalization_storage': 'granted'
        });
    }
    const banner = document.getElementById('cookieBanner');
    if (banner) banner.classList.remove('show');
}

window.rejectCookies = function() {
    localStorage.setItem('cookieConsent', 'necessary');
    if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'functionality_storage': 'denied',
            'personalization_storage': 'denied'
        });
    }
    const banner = document.getElementById('cookieBanner');
    if (banner) banner.classList.remove('show');
}

// ========================================
// MODAL FUNCTIONS
// ========================================
window.openModal = function(type) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (!modal) return;
    
    const titles = {
        'lid': 'Word Lid van Verenigd Amsterdam',
        'vrijwilliger': 'Word Vrijwilliger',
        'doneer': 'Steun Verenigd Amsterdam'
    };
    
    if (modalTitle) {
        modalTitle.textContent = titles[type] || 'Contact';
    }
    
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

window.closeModal = function() {
    const modal = document.getElementById('modal');
    if (!modal) return;
    
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// ========================================
// MAIN APP INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏛️ Verenigd Amsterdam - Initializing...');
    
    // ========================================
    // 1. COOKIE CONSENT
    // ========================================
    const consent = localStorage.getItem('cookieConsent');
    
    if (consent === 'necessary') {
        // User previously rejected cookies - apply denial
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'functionality_storage': 'denied',
                'personalization_storage': 'denied'
            });
        }
    } else if (!consent) {
        // No previous consent recorded - show banner
        const banner = document.getElementById('cookieBanner');
        if (banner) {
            setTimeout(() => banner.classList.add('show'), 1000);
        }
    }
    // If consent === 'all', cookies remain granted (default state)
    
    // ========================================
    // 2. INTERACTIVE PHONE FEATURES
    // ========================================
    const features = document.querySelectorAll('.feature-bubble');
    const screens = document.querySelectorAll('.screen-content');
    
    features.forEach(feature => {
        feature.addEventListener('click', function() {
            const featureName = this.closest('.feature-item').dataset.feature;
            
            // Remove active from all
            features.forEach(f => f.classList.remove('active'));
            screens.forEach(s => s.classList.remove('active'));
            
            // Add active to clicked
            this.classList.add('active');
            const targetScreen = document.querySelector(`[data-screen="${featureName}"]`);
            if (targetScreen) {
                targetScreen.classList.add('active');
            }
            
            // Reset to home after 5 seconds
            setTimeout(() => {
                features.forEach(f => f.classList.remove('active'));
                screens.forEach(s => s.classList.remove('active'));
                document.querySelector('[data-screen="home"]').classList.add('active');
            }, 5000);
        });
    });
    
    // ========================================
    // 3. ANIMATED COUNTERS
    // ========================================
    function animateCounter(element) {
        const target = parseInt(element.dataset.target);
        if (isNaN(target)) return;
        
        let current = 0;
        const increment = target / 100;
        const duration = 2000;
        const stepTime = duration / 100;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Format number with thousand separator
            const formatted = Math.floor(current).toLocaleString('nl-NL');
            
            // Keep the + sign if originally present
            const originalText = element.textContent;
            if (originalText.includes('+')) {
                element.textContent = formatted + '+';
            } else {
                element.textContent = formatted;
            }
        }, stepTime);
    }
    
    // Observe stat numbers for animation
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    if (statNumbers.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    animateCounter(entry.target);
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '0px'
        });
        
        statNumbers.forEach(number => observer.observe(number));
    }
    
    // ========================================
    // 5. STADSDEEL SELECTION
    // ========================================
    const stadsdeelData = {
        'noord': {
            title: 'Amsterdam Noord',
            plans: [
                '10.000 betaalbare woningen in NDSM en Buiksloterham',
                '2.000 nieuwe bomen langs het IJ',
                'Groene corridor Noord-Zuid',
                'Betere pontverbindingen en 24/7 Noord-Zuidlijn',
                'Behoud groene zones Noorderpark en Vliegenbos',
                'Extra wijkagenten Nieuwendam en Volewijck',
                'Jongerencentrum met sport en cultuur',
                'Gratis sportscholen voor jongeren'
            ]
        },
        'nieuw-west': {
            title: 'Nieuw-West',
            plans: [
                'Renovatie Plein \'40-\'45 en Osdorpplein',
                'Sloterplas parkzone uitbreiden',
                '1.500 nieuwe bomen in Geuzenveld',
                '8.000 sociale huurwoningen behouden',
                'Nieuwe markt in Geuzenveld',
                'Veiligere fietsroutes naar centrum',
                'Cultuurhuis Nieuw-West uitbreiden',
                'Gratis sportscholen in elke buurt'
            ]
        },
        'west': {
            title: 'Amsterdam West',
            plans: [
                'Mercatorplein wordt groen stadsplein',
                'Groene daken Kinkerbuurt',
                'Betaalbare werkruimtes voor creatieven',
                'Westerpark en Rembrandtpark beter verbinden',
                'Kleinschalige horeca Staatsliedenbuurt',
                'Extra zorg voor ouderen in Bos en Lommer',
                'Geen gebruiksbussen in woonwijken'
            ]
        },
        'centrum': {
            title: 'Centrum',
            plans: [
                'Balans bewoners-toeristen herstellen',
                'Grachten vergroenen met drijvende tuinen',
                '500 geveltuinen in de Jordaan',
                'Strengere handhaving vakantieverhuur',
                'Lokale ondernemers voorrang',
                'Autoluwe grachten, meer groen',
                'Behoud sociale huur Jordaan en Plantage',
                'Geen gebruiksbussen in centrum'
            ]
        },
        'oost': {
            title: 'Amsterdam Oost',
            plans: [
                'Javaplein wordt groen buurtpark',
                '2.500 nieuwe bomen Watergraafsmeer',
                'Betaalbare gezinswoningen Oostelijk Havengebied',
                'Park Frankendael toegankelijker',
                'Veiligere oversteek Weesperzijde',
                'Buurtcentra Indische Buurt versterken',
                'Baan Integratie bij uitkering'
            ]
        },
        'zuid': {
            title: 'Amsterdam Zuid',
            plans: [
                'Betaalbare starterswoningen Zuidas',
                'Beatrixpark en Vondelpark opknappen',
                'Groene Zuidas met dakparken',
                'Stadionplein veiliger voor fietsers',
                'Gemengde wijken Buitenveldert behouden',
                'Lokale winkels De Pijp beschermen',
                'Gratis sportscholen voor 65+'
            ]
        },
        'zuidoost': {
            title: 'Zuidoost',
            plans: [
                'Bijlmer Centrum doorontwikkelen',
                'Nelson Mandelapark uitbreiden met 10 hectare',
                '3.000 nieuwe bomen Gaasperdam',
                '15.000 nieuwe woningen, 60% sociaal',
                'Metro naar Almere doortrekken',
                'Ondernemershub voor jongeren',
                'Baan Integratie programma',
                'Gratis sportscholen voor iedereen'
            ]
        }
    };
    
    const stadsdeelButtons = document.querySelectorAll('.stadsdeel-btn');
    const stadsdeelInfo = document.getElementById('stadsdeelInfo');
    
    stadsdeelButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active from all buttons
            stadsdeelButtons.forEach(btn => btn.classList.remove('active'));
            // Add active to clicked button
            this.classList.add('active');
            
            const stadsdeel = this.dataset.stadsdeel;
            const data = stadsdeelData[stadsdeel];
            
            if (data && stadsdeelInfo) {
                const planItems = data.plans.map(plan => {
                    const isGreen = plan.includes('boom') || plan.includes('groen') || plan.includes('park');
                    const isRed = plan.includes('Gratis') || plan.includes('Geen gebruiks');
                    const style = isGreen ? 'color: var(--va-green);' : isRed ? 'color: var(--va-red);' : '';
                    return `<li${style ? ` style="${style}"` : ''}>• ${plan}</li>`;
                }).join('');
                
                stadsdeelInfo.innerHTML = `
                    <h3>${data.title}</h3>
                    <p><strong>Onze plannen voor ${data.title}:</strong></p>
                    <ul class="stadsdeel-plans">${planItems}</ul>
                    <button class="btn-primary" onclick="openModal('vrijwilliger')">
                        Meld je aan als vrijwilliger in ${data.title}
                    </button>
                `;
                stadsdeelInfo.classList.add('animated');
            }
        });
    });
    
    // ========================================
    // 6. NAVIGATION & SCROLLING
    // ========================================
    document.querySelectorAll('a[data-scroll]').forEach(link => {
        link.addEventListener('click', function(e) {
            const scrollTarget = this.getAttribute('data-scroll');
            const href = this.getAttribute('href');
            
            if (window.location.pathname === '/') {
                e.preventDefault();
                const element = document.querySelector(scrollTarget);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    history.pushState(null, null, href);
                }
            } else {
                e.preventDefault();
                window.location.href = '/' + scrollTarget;
            }
        });
    });
    
    // ========================================
    // 7. MOBILE MENU
    // ========================================
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
            this.setAttribute('aria-expanded', navMenu.classList.contains('active'));
        });
    }
    
    // ========================================
    // 7.1. DROPDOWN MENU FUNCTIONALITY
    // ========================================
    const dropdownToggle = document.querySelector('.nav-dropdown-toggle');
    const dropdownMenu = document.querySelector('.nav-dropdown-menu');
    
    if (dropdownToggle && dropdownMenu) {
        // Mobile dropdown toggle
        if (window.innerWidth <= 768) {
            dropdownToggle.addEventListener('click', function(e) {
                e.preventDefault();
                const dropdown = this.parentElement;
                dropdown.classList.toggle('active');
                dropdownMenu.style.display = dropdown.classList.contains('active') ? 'block' : 'none';
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-dropdown')) {
                document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
                    dropdown.classList.remove('active');
                    const menu = dropdown.querySelector('.nav-dropdown-menu');
                    if (menu && window.innerWidth <= 768) {
                        menu.style.display = 'none';
                    }
                });
            }
        });
        
        // Handle responsive behavior
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
                    dropdown.classList.remove('active');
                    const menu = dropdown.querySelector('.nav-dropdown-menu');
                    if (menu) {
                        menu.style.display = '';
                    }
                });
            }
        });
    }
    
    // ========================================
    // 8. NAVBAR SCROLL EFFECT
    // ========================================
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // ========================================
    // 9. SERVICE WORKER
    // ========================================
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW registered'))
                .catch(err => console.log('SW registration failed'));
        });
    }
    
    // ========================================
    // 10. LAZY LOADING
    // ========================================
    const lazyImages = document.querySelectorAll('img.lazy');
    if (lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.01
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
    
    console.log('✅ Verenigd Amsterdam website initialized');
});

// ========================================
// THEME CARDS EXPANSION - SEPARATE HANDLER
// Added as a separate DOMContentLoaded to ensure it runs
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing theme cards (separate handler)...');
    
    const themeButtons = document.querySelectorAll('.theme-expand');
    console.log('Found', themeButtons.length, 'theme buttons');
    
    themeButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Button clicked:', index);
            
            const card = this.closest('.theme-card');
            const details = card.querySelector('.theme-details');
            
            if (!details) {
                console.error('No details found for card:', index);
                return;
            }
            
            const isExpanded = details.classList.contains('active');
            console.log('Is expanded:', isExpanded);
            
            if (isExpanded) {
                // Collapse
                details.classList.remove('active');
                details.style.maxHeight = '0';
                this.textContent = 'Lees standpunt →';
                this.setAttribute('aria-expanded', 'false');
            } else {
                // Expand
                details.classList.add('active');
                // Calculate the actual height needed
                details.style.maxHeight = details.scrollHeight + 'px';
                this.textContent = 'Minder ←';
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });
});

(function(){
  const TOAST_ID = 'va-news-toast';
  const LIST_ID  = 'va-news-list';
  const SNOOZE_KEY = 'va_news_snooze_until';
  const SOURCE = '/sitemap-news.xml'; // gebruikt je News-sitemap

  // helper: datumformat NL
  function fmtDate(iso){
    try{
      const d = new Date(iso);
      return d.toLocaleDateString('nl-NL',{ day:'2-digit', month:'long', year:'numeric' });
    }catch(e){ return ''; }
  }
  function within(hours, iso){
    const d = new Date(iso).getTime();
    return (Date.now() - d) <= hours*3600*1000;
  }
  function snoozed(){
    const until = +localStorage.getItem(SNOOZE_KEY) || 0;
    return Date.now() < until;
  }
  function setSnooze(minutes){
    const ms = minutes*60*1000;
    localStorage.setItem(SNOOZE_KEY, String(Date.now()+ms));
  }

  async function getNews(){
    const res = await fetch(SOURCE, {cache:'no-store'});
    const xml = new DOMParser().parseFromString(await res.text(), 'application/xml');
    const urls = [...xml.querySelectorAll('urlset > url')];
    const items = urls.map(u=>{
      const loc   = u.querySelector('loc')?.textContent?.trim();
      const pub   = u.querySelector('news\\:publication_date, publication_date')?.textContent?.trim();
      const title = u.querySelector('news\\:title, title')?.textContent?.trim();
      const img   = u.querySelector('image\\:image > image\\:loc, image\\:loc')?.textContent?.trim();
      return {loc, pub, title, img};
    }).filter(x=>x.loc && x.pub && x.title);

    // sort DESC by date, pak top 3
    items.sort((a,b)=> new Date(b.pub)-new Date(a.pub));
    return items.slice(0,3);
  }

  function render(items){
    const toast = document.getElementById(TOAST_ID);
    const list  = document.getElementById(LIST_ID);
    if(!toast || !list) return;

    list.innerHTML = '';
    items.forEach(it=>{
      const li = document.createElement('li');
      li.className = 'va-news-item';
      li.innerHTML = `
        <a href="${it.loc}">
          <img class="va-news-thumb" src="${it.img || '/images/og-default.jpg'}" alt="" loading="lazy" decoding="async">
        </a>
        <div>
          <h4 class="va-news-title"><a href="${it.loc}">${it.title}</a></h4>
          <div class="va-news-meta">${fmtDate(it.pub)}</div>
        </div>`;
      list.appendChild(li);
    });

    // show only if er iets recent is (< 7 dagen)
    const fresh = items.some(x => within(24*7, x.pub));
    if(!fresh || snoozed()) return;

    toast.classList.remove('hidden');
    // force layout to trigger transition
    requestAnimationFrame(()=> toast.classList.add('show'));

    // bindings
    toast.querySelector('.va-news-close')?.addEventListener('click', ()=>{
      setSnooze(1440); // niet meer vandaag
      toast.remove();
    });
    toast.querySelectorAll('.va-news-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const mins = parseInt(btn.getAttribute('data-snooze') || '60',10);
        setSnooze(mins);
        toast.remove();
      });
    });
  }

  // init wanneer pagina idle is
  if(document.readyState === 'complete') init(); else window.addEventListener('load', init);
  function init(){
    // alleen op de homepage
    if(location.pathname !== '/' && location.pathname !== '/index.html') return;
    getNews().then(render).catch(()=>{/* zwijgzaam falen */});
  }
})();
// Theme toggle functionality - Light mode default
function initThemeToggle() {
    // Prevent multiple initializations
    if (window.themeToggleInitialized) {
        console.log('Theme toggle already initialized, skipping...');
        return;
    }
    
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.querySelector('.theme-toggle-icon');
    const themeText = document.querySelector('.theme-toggle-text');
    
    console.log('Theme toggle elements found:', {
        toggle: !!themeToggle,
        icon: !!themeIcon,
        text: !!themeText
    });
    
    if (!themeToggle) {
        console.error('Theme toggle button not found!');
        return;
    }
    
    // Get saved theme or default to light mode
    let currentTheme = localStorage.getItem('theme');
    
    if (!currentTheme) {
        // Always default to light mode
        currentTheme = 'light';
    }
    
    console.log('Initial theme:', currentTheme);
    
    // Apply theme
    function applyTheme(theme) {
        console.log('Applying theme:', theme);
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (themeIcon) themeIcon.textContent = '☀️';
            if (themeText) themeText.textContent = 'Light';
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (themeIcon) themeIcon.textContent = '🌙';
            if (themeText) themeText.textContent = 'Dark';
        }
        localStorage.setItem('theme', theme);
        console.log('Theme applied. data-theme:', document.documentElement.getAttribute('data-theme'));
    }
    
    // Initialize theme
    applyTheme(currentTheme);
    
    // Remove any existing event listeners to prevent duplicates
    themeToggle.removeEventListener('click', handleThemeToggle);
    
    // Toggle theme function
    function handleThemeToggle() {
        console.log('Theme toggle clicked!');
        const currentDataTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentDataTheme === 'dark' ? 'light' : 'dark';
        console.log('Current data-theme:', currentDataTheme, '-> New theme:', newTheme);
        applyTheme(newTheme);
    }
    
    // Add event listener
    themeToggle.addEventListener('click', handleThemeToggle);
    
    // Mark as initialized
    window.themeToggleInitialized = true;
    console.log('✅ Theme toggle initialized successfully');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initThemeToggle);

// Also try to initialize after a delay as backup (only if not already initialized)
setTimeout(() => {
    if (!window.themeToggleInitialized) {
        initThemeToggle();
    }
}, 1000);