# Verenigd Amsterdam Forum - Solidair, Sociaal, Sterk!

Ee### 🔥 **Firebase Real-t### 🔍 **Search & Discovery\*\*

-   Real-time search with debouncing
-   Category-based filtering
-   Recent activity tracking
-   Forum statisticsatures\*\*

-   **Real-time Discussions**: Live forum updates and messaging
-   **User Authentication**: Firebase Auth integration with profiles
-   **Cloud Storage**: File uploads and media sharing
-   **Push Notifications**: Real-time alerts for forum activity
-   **Offline Support**: Service worker with data synchronization
-   **Real-time Database**: Live data updates

### 🏛️ **Political Action Platform**

-   **VA Action Forum**: Platform for organizing political actions
-   **Network Building**: Connect with fellow activists and citizens
-   **VA-Handhaving**: Direct reporting system for community issues
-   **Campaign Organization**: Tools for political campaigns and movements
-   **News Ticker**: Real-time updates met "Genoeg is genoeg!" messaging, real-time politiek forum platform voor de Amsterdamse gemeenschap, met light/dark mode en Firebase voor real-time functionaliteit.

## 🏛️ Project Overview

Het Verenigd Amsterdam Forum is ontworpen om democratische participatie en gemeenschapsengagement in de lokale politiek van Amsterdam te bevorderen. Het biedt een digitale ruimte waar burgers kunnen:

-   Discussiëren over politieke programma's en beleid
-   Lokale initiatieven per stadsdeel delen
-   Samenwerken aan duurzaamheidsprojecten
-   Debatteren over wonen en ruimtelijke ordening
-   Participeren in verkeer- en mobiliteitsdiscussies
-   Verbinden met medeburgers en partijleden

**"Genoeg is genoeg! Geen sorry-zeggers meer, maar concrete actie voor een solidair, sociaal en sterk Amsterdam!"**

## ✨ Features

### 🎨 User Interface & Theming

-   **Modern Design**: Clean, responsive interface met Verenigd Amsterdam branding
-   **Light/Dark Mode**: Volledig ondersteunde thema-wisselaar met systeem detectie
-   **Montserrat & Roboto Fonts**: Professionele typografie voor headings en body text
-   **Accessibility First**: WCAG 2.1 AA compliant met screen reader support
-   **Mobile Responsive**: Geoptimaliseerd voor alle apparaten en schermformaten
-   **Police Blue Theme**: Aangepaste kleurenschema met politie blauw (#00008b)

### 🌙 Dark Mode Features

-   **Automatische Detectie**: Respecteert systeemvoorkeur voor dark mode
-   **Handmatige Toggle**: Theme-wissel knop in navigatie
-   **Lokale Opslag**: Onthoud gebruikersvoorkeur tussen sessies
-   **Smooth Transitions**: Vloeiende overgangen tussen themes
-   **Accessibility**: Focus styles aangepast voor beide themes
-   **Print Optimized**: Blijft licht voor afdrukken

### 🔐 Authentication & User Management

-   User registration and login system
-   Password strength validation
-   "Remember Me" functionality
-   Password visibility toggle
-   Session management

### 💬 Forum Functionality

-   **Categorized Discussions**:
    -   Verkiezingsprogramma (Election Program)
    -   Stadsdeel Initiatieven (District Initiatives)
    -   Duurzaamheid & Klimaat (Sustainability & Climate) - met groen.png icon
    -   Wonen & Ruimte (Housing & Space) - met wonen.png icon
    -   Verkeer & Mobiliteit (Traffic & Mobility) - met veiligheid.png icon
    -   Economie & Werkgelegenheid - met economie.png icon
    -   Cultuur & Evenementen - met cultuur.png icon
    -   Democratie & Participatie - met democratie.png icon
    -   Algemene Discussie (General Discussion)

### � **Firebase Real-time Features**

-   **Real-time Discussions**: Live forum updates and messaging
-   **User Authentication**: Firebase Auth integration with profiles
-   **Cloud Storage**: File uploads and media sharing (`gs://toursamsterdam-eu-1.firebasestorage.app`)
-   **Push Notifications**: Real-time alerts for forum activity
-   **Offline Support**: Service worker with data synchronization
-   **Real-time Database**: Live data updates (`https://toursamsterdam-eu-1-default-rtdb.europe-west1.firebasedatabase.app/`)

### �🔍 **Search & Discovery**

-   Real-time search with debouncing
-   Category-based filtering
-   Recent activity tracking
-   Forum statistics

### 📅 Community Features

-   Event calendar and announcements
-   Newsletter subscription
-   Social media integration
-   Contact information and support

## 🛠️ Technical Stack

### Frontend Technologies

-   **HTML5**: Semantic markup with accessibility features
-   **CSS3**: Custom properties, Flexbox, Grid, animations met dark mode support
-   **JavaScript (ES6+)**: Modern vanilla JS met ThemeManager class
-   **Montserrat & Roboto**: Google Fonts voor professionele typografie
-   **Font Awesome 6**: Icon library
-   **Police Blue Theme**: Custom branding met #00008b primary color

### Development Tools

-   **Node.js**: Development environment
-   **Live Server**: Local development server
-   **ESLint**: JavaScript linting
-   **Clean CSS**: CSS minification
-   **Terser**: JavaScript minification
-   **HTML Validate**: HTML validation

## 🚀 Getting Started

### Prerequisites

-   Node.js (v16 or higher)
-   npm (v8 or higher)
-   Modern web browser

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/verenigd-amsterdam/network-forum.git
    cd verenigd-amsterdam-forum
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Start development server**

    ```bash
    npm run dev
    ```

4. **Open in browser**
   Navigate to `http://localhost:8080` (or the port shown in terminal)

### Available Scripts

-   `npm start` - Start production server
-   `npm run dev` - Start development server with live reload
-   `npm run build` - Build optimized production files
-   `npm run lint` - Run JavaScript linting
-   `npm run validate` - Validate HTML structure
-   `npm test` - Run tests (placeholder)

## 📁 Project Structure

```
verenigd-amsterdam-forum/
├── index.html              # Main HTML file met theme toggle
├── css/
│   └── main.css            # Custom styles, VA branding en dark mode
├── js/
│   └── main.js             # Application logic met ThemeManager
├── assets/                 # Images, icons, and media files
│   ├── favicon.ico
│   ├── verenigd-amsterdam-top-logo.png     # Main logo
│   ├── verenigd-amsterdam-politiek-2025-logo_small.png
│   ├── amsterdam-skyline.svg
│   ├── groen.png          # Sustainability icon
│   ├── wonen.png          # Housing icon
│   ├── veiligheid.png     # Safety/Traffic icon
│   ├── economie.png       # Economy icon
│   ├── cultuur.png        # Culture icon
│   └── democratie.png     # Democracy icon
├── package.json            # Project configuration and dependencies
└── README.md              # Project documentation
```

## 🎨 Design System

### Color Palette

-   **Police Blue**: `#00008b` (Primary Verenigd Amsterdam brand color)
-   **Dark Mode**: CSS custom properties voor theme switching
-   **Light/Dark Variants**: Volledig ondersteunde color schemes
-   **Accessibility**: WCAG AA compliant contrast ratios

### Typography

-   **Headings**: Montserrat (Google Fonts) - 400, 600, 700 weights
-   **Body Text**: Roboto (Google Fonts) - 300, 400, 500 weights
-   **Responsive sizing**: Fluid typography met CSS clamp
-   **Dark Mode**: Optimized contrast voor beide themes

### Component Design

-   **Cards**: Elevated surfaces met hover effects en dark mode support
-   **Buttons**: Consistent styling met hover animations
-   **Forms**: Accessible inputs met validation states
-   **Navigation**: Clear hierarchy met active states en theme toggle
-   **Theme Toggle**: Smooth transitions tussen light/dark modes

## ♿ Accessibility Features

-   **Semantic HTML**: Proper heading structure and landmarks
-   **ARIA Labels**: Comprehensive labeling for screen readers
-   **Keyboard Navigation**: Full keyboard accessibility
-   **Focus Management**: Visible focus indicators
-   **Color Contrast**: WCAG AA compliant color ratios
-   **Skip Links**: Quick navigation for screen reader users
-   **Live Regions**: Dynamic content announcements

## 📱 Responsive Design

-   **Mobile First**: Designed for mobile devices first
-   **Breakpoints**:
    -   Small (576px+): Phone landscape
    -   Medium (768px+): Tablets
    -   Large (992px+): Desktops
    -   Extra Large (1200px+): Large screens

## 🔧 Customization

### Brand Colors

Update CSS custom properties in `css/main.css`:

```css
:root {
    --police-blue: #00008b;
    --police-blue-light: #3333a3;
    --police-blue-dark: #000066;
    /* Dark mode colors */
}

[data-theme='dark'] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --card-bg: #2d2d2d;
    /* Custom dark theme colors */
}
```

### Content Management

-   Update forum categories in `index.html`
-   Modify news items in the ticker section met political messaging
-   Customize footer links and contact information
-   Update theme toggle functionality en branding

### API Integration

Replace simulated API calls in `js/main.js` with actual endpoints:

```javascript
const CONFIG = {
    API_BASE_URL: 'https://your-api-domain.com',
    FORUM_ENDPOINT: '/api/forum',
    AUTH_ENDPOINT: '/api/auth',
};
```

## 🔒 Security Considerations

-   Input validation on client and server side
-   CSRF protection for form submissions
-   XSS prevention through proper escaping
-   Secure authentication with JWT tokens
-   HTTPS enforcement in production

## 🌐 SEO & Performance

### SEO Features

-   Semantic HTML structure
-   Meta tags for social sharing
-   Structured data (JSON-LD)
-   XML sitemap generation
-   robots.txt configuration

### Performance Optimizations

-   Optimized images and assets
-   CSS and JavaScript minification
-   Lazy loading for images
-   Service worker for caching
-   CDN integration for external libraries

## 🧪 Testing

### Manual Testing Checklist

-   [ ] Form validation and submission
-   [ ] Authentication flow
-   [ ] Responsive design on multiple devices
-   [ ] Light/Dark mode toggle functionality
-   [ ] Theme persistence tussen sessies
-   [ ] Accessibility with screen readers in beide themes
-   [ ] Cross-browser compatibility
-   [ ] Performance on slow connections

### Automated Testing (Future)

-   Unit tests for JavaScript functions
-   Integration tests for user flows
-   Visual regression testing
-   Accessibility testing automation

## 🚀 Deployment

### Production Deployment to https://verenigdamsterdam.nl/forum/

1. **Build optimized files**

    ```bash
    npm run build
    ```

2. **Upload to web server**

    - Deploy to `https://verenigdamsterdam.nl/forum/`
    - Upload `index.html`, `css/`, `js/`, and `assets/` folders
    - Ensure proper MIME types are configured
    - Enable GZIP compression

3. **Configure server**
    - Set up HTTPS certificates
    - Configure caching headers
    - Set up redirects if needed
    - Test theme toggle functionality in production

### Environment Variables

-   `API_BASE_URL`: Backend API endpoint
-   `ANALYTICS_ID`: Google Analytics tracking ID
-   `SOCIAL_SHARE_URL`: Base URL for social sharing

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

-   Use semantic HTML5 elements
-   Follow BEM methodology for CSS
-   Write vanilla JavaScript (ES6+)
-   Maintain accessibility standards
-   Add comments for complex logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

-   **Verenigd Amsterdam** - Political party and project owner
-   **Development Team** - Technical implementation and maintenance

## 📞 Support

For technical support or questions about the forum:

-   Email: tech@verenigdamsterdam.nl
-   Forum: Post in the "Algemene Discussie" category
-   GitHub Issues: Report bugs and feature requests

## 🔮 Future Enhancements

-   [ ] Enhanced Firebase real-time features
-   [ ] Advanced moderation tools
-   [ ] Mobile app development
-   [ ] Integration with voting systems
-   [ ] Multi-language support (Dutch/English)
-   [ ] Advanced analytics dashboard
-   [ ] AI-powered content recommendations
-   [ ] Expanded political action features
-   [ ] Community reporting system

---

**Made with ❤️ for Amsterdam by Verenigd Amsterdam**
