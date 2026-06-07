# Bright Future Academy - School Website Demo

A professional, responsive school website template built with HTML, CSS, and JavaScript. This demo showcases a complete school website that can be customized for any educational institution.

## 🎯 Features

### Core Pages
- **Home** - Hero section, welcome message, features, news preview, gallery preview, contact preview
- **About** - School history, mission/vision, principal's message, leadership team, stats
- **Academics** - Programs by level, subjects, extracurricular activities, exam performance
- **Admissions** - Application process, requirements, fee structure, downloadable forms, inquiry form
- **News & Events** - Latest news, announcements, upcoming events calendar, photo highlights
- **Gallery** - Filterable photo gallery, video gallery section
- **Contact** - Contact form, contact information, Google Maps embed, FAQ section

### Special Features
- ✅ **Mobile-Friendly Design** - Fully responsive across all devices
- ✅ **WhatsApp Contact Button** - Floating button for instant communication
- ✅ **Online Admission Inquiry Form** - Collect prospective student information
- ✅ **Events/Announcements Section** - Keep community informed
- ✅ **Staff/Teachers Section** - Showcase leadership team
- ✅ **Downloadable Fee Structure** - Transparent fee information
- ✅ **Google Map Embed** - Easy location finding
- ✅ **Simple Admin Dashboard Demo** - Content management interface

### Technical Features
- Modern CSS with CSS Variables for easy theming
- Smooth scroll animations and transitions
- Interactive forms with validation
- Gallery filtering system
- Animated statistics counter
- Back to top button
- Notification system
- Clean, professional design

## 📁 Project Structure

```
school-web-demo/
├── index.html          # Homepage
├── about.html          # About page
├── academics.html      # Academics page
├── admissions.html     # Admissions page
├── news.html           # News & Events page
├── gallery.html        # Gallery page
├── contact.html        # Contact page
├── admin.html          # Admin dashboard demo
├── css/
│   └── style.css       # Main stylesheet
├── js/
│   └── main.js         # Main JavaScript file
└── README.md           # This file
```

## 🚀 Getting Started

### Option 1: Open Directly
Simply open `index.html` in your web browser to view the website.

### Option 2: Use a Local Server
For the best experience (especially for forms and dynamic features), use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## 🎨 Customization Guide

### Colors
The website uses CSS variables for easy color customization. Edit these in `css/style.css`:

```css
:root {
    --primary-color: #1a5f7a;      /* Main brand color */
    --secondary-color: #ffc107;    /* Accent color */
    --accent-color: #28a745;       /* Success/highlight color */
    --text-dark: #333333;          /* Dark text */
    --text-light: #666666;         /* Light text */
}
```

### Content
1. **School Name**: Replace "Bright Future Academy" with your school name
2. **Contact Info**: Update phone, email, and address in contact.html and footer
3. **Images**: Replace Unsplash placeholder images with actual school photos
4. **Text Content**: Customize all text content to match your school's information
5. **Fee Structure**: Update the fee table in admissions.html
6. **Academic Programs**: Modify subjects and programs in academics.html

### WhatsApp Number
Update the WhatsApp link in all pages:
```html
<a href="https://wa.me/254700000000" class="whatsapp-float">
```
Replace `254700000000` with your actual WhatsApp number (include country code).

### Google Maps
Update the map embed in contact.html with your school's location:
1. Go to Google Maps
2. Find your school location
3. Click "Share" → "Embed a map"
4. Copy the iframe code and replace the existing one

## 📱 Responsive Design

The website is fully responsive with breakpoints at:
- **Desktop**: 992px and above
- **Tablet**: 768px - 991px
- **Mobile**: Below 768px

## 🛠️ Admin Dashboard

The admin dashboard (`admin.html`) demonstrates content management capabilities:
- Dashboard with statistics
- News article management
- Events calendar management
- Gallery photo management
- Admission inquiries viewer

**Note**: This is a frontend demo only. For a production website, you would need:
- Backend server (Node.js, PHP, Python, etc.)
- Database (MySQL, MongoDB, etc.)
- Authentication system
- File upload handling

## 🌐 Browser Compatibility

Tested and works well on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Forms

All forms are frontend-only demos. They show success notifications but don't actually submit data. For production use, connect forms to:
- Email service (EmailJS, Formspree, etc.)
- Backend API
- CRM system

## 🎯 Selling Points for Schools

When presenting this demo to schools, highlight:

1. **Professional Design** - Clean, modern, trustworthy appearance
2. **Mobile-First** - Works perfectly on phones (where most parents browse)
3. **Easy Communication** - WhatsApp integration for instant contact
4. **Complete Information** - All essential school information organized logically
5. **Admissions Tool** - Online inquiry forms to capture leads
6. **News & Updates** - Keep parents informed about school activities
7. **Easy to Customize** - Can be branded with school colors and logo
8. **SEO-Friendly** - Clean code structure for search engines
9. **Fast Loading** - Optimized for quick page loads
10. **Admin Control** - Easy content management for school staff

## 🔧 Development Notes

### Technologies Used
- HTML5
- CSS3 (with CSS Variables, Flexbox, Grid)
- Vanilla JavaScript (ES6+)
- Font Awesome 6 (icons)
- Google Fonts (Poppins)

### No Dependencies
- No jQuery
- No Bootstrap
- No framework dependencies
- Pure, lightweight code

### Performance
- Minimal HTTP requests
- Optimized images (using Unsplash CDN)
- No render-blocking resources
- Fast load times

## 📄 License

This is a demo template. Feel free to use and modify for your projects.

## 🤝 Support

For questions or customization help, contact the developer.

---

**Built with ❤️ for educational institutions**

*This is a demo website. All content, images, and data are for demonstration purposes only.*