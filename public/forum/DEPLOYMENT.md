# Deployment Guide - Verenigd Amsterdam Forum

## 🚀 Deployment to https://verenigdamsterdam.nl/forum/

### Prerequisites

-   FTP/SFTP access to verenigdamsterdam.nl server
-   Web hosting control panel access
-   Domain already configured for verenigdamsterdam.nl

### File Structure for Upload

```
forum/
├── index.html                  # Main forum page
├── css/
│   └── main.css               # Forum styles
├── js/
│   └── main.js                # Firebase integration & app logic
├── sw.js                      # Service Worker
├── assets/                    # Images and logos
│   ├── verenigd-amsterdam-politiek-2025-logo.png
│   ├── verenigd-amsterdam-politiek-2025-logo_small.png
│   ├── verenigd-amsterdam-top-logo.png
│   ├── amsterdam-skyline.svg
│   ├── cultuur.png
│   ├── democratie.png
│   ├── economie.png
│   ├── groen.png
│   ├── veiligheid.png
│   ├── wonen.png
│   ├── wonen.avif
│   ├── og-default.jpg
│   ├── og-x.jpg
│   └── verkiezingsprogramma-og.jpg
└── favicon/                   # Favicon and PWA icons
    ├── favicon.ico
    ├── favicon.svg
    ├── favicon-96x96.png
    ├── apple-touch-icon.png
    ├── web-app-manifest-192x192.png
    ├── web-app-manifest-512x512.png
    └── site.webmanifest
```

### Step-by-Step Deployment

#### 1. **Prepare Files**

-   Ensure all files are ready in the local directory
-   Verify all asset paths are relative (no localhost references)
-   Test locally before deployment

#### 2. **Upload to Server**

```bash
# Example using SCP (replace with your server details)
scp -r ./verenigd-amsterdam-forum/* user@verenigdamsterdam.nl:/path/to/website/forum/

# Or using FTP client like FileZilla
# Connect to verenigdamsterdam.nl
# Navigate to public_html/ or www/ directory
# Create 'forum' folder if it doesn't exist
# Upload all files maintaining directory structure
```

#### 3. **Server Configuration**

##### **Apache (.htaccess)**

Create `/forum/.htaccess` file:

```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>

# Service Worker MIME type
<IfModule mod_mime.c>
    AddType application/javascript .js
    AddType text/javascript .js
</IfModule>
```

##### **Nginx Configuration**

Add to server block:

```nginx
location /forum/ {
    try_files $uri $uri/ /forum/index.html;

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Cache static assets
    location ~* \.(png|jpg|jpeg|gif|svg|css|js|ico)$ {
        expires 1M;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 4. **SSL/HTTPS Setup**

-   Ensure SSL certificate covers verenigdamsterdam.nl
-   Verify HTTPS redirect is working
-   Test forum at https://verenigdamsterdam.nl/forum/

#### 5. **DNS & CDN (Optional)**

-   Configure CloudFlare or similar CDN for better performance
-   Set up proper caching rules for static assets
-   Enable automatic HTTPS redirects

### 🔧 Post-Deployment Configuration

#### **Firebase Configuration**

1. Update Firebase config in `js/main.js` with production settings
2. Add `verenigdamsterdam.nl` to Firebase authorized domains
3. Configure Realtime Database rules for production
4. Set up Firebase hosting rules if using Firebase

#### **Google Analytics**

-   Verify GA tracking code G-0B4ZR31YFS is working
-   Set up goal tracking for forum engagement
-   Configure enhanced ecommerce if needed

#### **SEO Setup**

-   Submit sitemap to Google Search Console
-   Verify structured data markup
-   Test Open Graph meta tags with Facebook debugger
-   Validate Twitter Card implementation

### 🧪 Testing Checklist

#### **Functionality Testing**

-   [ ] Forum loads at https://verenigdamsterdam.nl/forum/
-   [ ] All images and assets load correctly
-   [ ] Navigation works properly
-   [ ] Search functionality works
-   [ ] User registration/login works
-   [ ] Firebase real-time features work
-   [ ] Service Worker installs correctly
-   [ ] PWA installation prompt appears
-   [ ] Offline functionality works

#### **Performance Testing**

-   [ ] Page load speed < 3 seconds
-   [ ] Images are optimized and compressed
-   [ ] CSS and JS are minified
-   [ ] GZIP compression is enabled
-   [ ] Browser caching headers are set

#### **SEO Testing**

-   [ ] Google PageSpeed Insights score > 90
-   [ ] All meta tags are present and correct
-   [ ] Structured data validates
-   [ ] Open Graph meta tags work
-   [ ] Twitter Cards display correctly
-   [ ] Canonical URLs are correct

#### **Security Testing**

-   [ ] HTTPS is enforced
-   [ ] Security headers are present
-   [ ] XSS protection is enabled
-   [ ] CSRF protection is working
-   [ ] File upload restrictions are in place

### 🔍 Monitoring & Maintenance

#### **Analytics**

-   Monitor forum usage via Google Analytics
-   Track user engagement and popular topics
-   Monitor conversion rates for political engagement

#### **Performance**

-   Use tools like GTmetrix or Pingdom for monitoring
-   Set up uptime monitoring
-   Monitor server resources and scaling needs

#### **Content Moderation**

-   Implement content moderation policies
-   Set up automated spam detection
-   Create user reporting mechanisms
-   Establish community guidelines

### 🆘 Troubleshooting

#### **Common Issues**

1. **Assets not loading**: Check file paths and permissions
2. **Firebase errors**: Verify API keys and domain authorization
3. **SSL issues**: Ensure certificate is valid and properly configured
4. **PWA not installing**: Check manifest.json and service worker
5. **SEO problems**: Validate structured data and meta tags

#### **Support Contacts**

-   **Technical Support**: [technical@verenigdamsterdam.nl]
-   **Content Management**: [content@verenigdamsterdam.nl]
-   **Emergency Contact**: +31-649319157

### 📊 Success Metrics

#### **Engagement Metrics**

-   Daily/Monthly Active Users
-   Forum posts per day
-   User registration rate
-   Session duration
-   Page views per session

#### **Political Engagement**

-   Discussion participation rate
-   Topic engagement levels
-   User-generated content quality
-   Community feedback scores

---

**Live URL**: https://verenigdamsterdam.nl/forum/
**Last Updated**: December 2024
**Version**: 2.0 (Police Blue Theme with Enhanced Assets)
