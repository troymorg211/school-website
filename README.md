<<<<<<< HEAD
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

## 📧 EmailJS Integration

The website includes built-in EmailJS integration for real email submissions from forms.

### Setting up EmailJS:

1. **Create an EmailJS Account**
   - Go to [emailjs.com](https://www.emailjs.com/) and sign up for a free account
   - The free plan includes 200 emails per month

2. **Create an Email Service**
   - In EmailJS dashboard, go to "Email Services"
   - Click "Add New Service"
   - Select your email provider (Gmail, Outlook, etc.)
   - Connect your account and save the Service ID

3. **Create Email Templates**
   - Go to "Email Templates" and create templates for each form:
   
   **Contact Form Template:**
   ```
   Subject: New Contact Form Submission from {{name}}
   
   Name: {{name}}
   Email: {{email}}
   Phone: {{phone}}
   Subject: {{subject}}
   
   Message:
   {{message}}
   
   ---
   Reply to: {{reply_to}}
   ```
   
   **Admission Inquiry Template:**
   ```
   Subject: New Admission Inquiry - {{student_name}}
   
   Parent Name: {{parent_name}}
   Email: {{email}}
   Phone: {{phone}}
   Student Name: {{student_name}}
   Grade Applying For: {{grade}}
   Academic Year: {{academic_year}}
   
   Message:
   {{message}}
   
   ---
   Reply to: {{reply_to}}
   ```

4. **Update Configuration in main.js**
   
   Open `js/main.js` and update the configuration:
   ```javascript
   const EMAILJS_CONFIG = {
       publicKey: 'YOUR_PUBLIC_KEY', // From EmailJS Account > API Keys
       serviceId: 'YOUR_SERVICE_ID', // From Email Services
       contactTemplateId: 'YOUR_CONTACT_TEMPLATE_ID',
       admissionTemplateId: 'YOUR_ADMISSION_TEMPLATE_ID',
       inquiryTemplateId: 'YOUR_INQUIRY_TEMPLATE_ID'
   };
   ```

5. **Update School Email**
   
   In `js/main.js`, update the `to_email` values in the form handlers to your actual school email addresses.

## 📱 WhatsApp Integration

The website includes enhanced WhatsApp functionality with dynamic messaging.

### Setting up WhatsApp:

1. **Update Phone Number**
   
   In `js/main.js`, update the WhatsApp configuration:
   ```javascript
   const WHATSAPP_CONFIG = {
       phoneNumber: '254700000000', // Your school's WhatsApp number with country code
       defaultMessage: 'Hello Bright Future Academy! I would like to inquire about:'
   };
   ```

2. **Features:**
   - Floating WhatsApp button on all pages
   - Dynamic messages that include the current page name and URL
   - Click-to-chat functionality that opens WhatsApp Web or the WhatsApp app
   - Pre-filled messages for easier communication

3. **WhatsApp Business API (Optional)**
   
   For more advanced features like automated responses, consider setting up WhatsApp Business API.
## 📝 Forms

The website includes EmailJS integration for real email submissions. See the "EmailJS Integration" section above for setup instructions.

Without EmailJS configured, forms will show success notifications in demo mode.

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

## � Development Notes

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
=======
# school-website
>>>>>>> 1857eaabf477845c941c3ddcf9a9d0dc2a1c2a9c
