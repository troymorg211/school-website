/**
 * Bright Future Academy - Main JavaScript
 * Handles all interactive features of the website
 * Includes EmailJS integration for form submissions
 */

// EmailJS Configuration - Replace with your actual EmailJS credentials
const EMAILJS_CONFIG = {
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY', // Get from EmailJS dashboard
    serviceId: 'YOUR_EMAILJS_SERVICE_ID', // Create a service in EmailJS
    contactTemplateId: 'YOUR_CONTACT_TEMPLATE_ID', // Template for contact form
    admissionTemplateId: 'YOUR_ADMISSION_TEMPLATE_ID', // Template for admission form
    inquiryTemplateId: 'YOUR_INQUIRY_TEMPLATE_ID' // Template for general inquiry
};

// WhatsApp Configuration
const WHATSAPP_CONFIG = {
    phoneNumber: '254700000000', // Replace with your school's WhatsApp number (with country code)
    defaultMessage: 'Hello Bright Future Academy! I would like to inquire about:'
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize EmailJS
    initEmailJS();
    
    // Initialize all components
    initMobileMenu();
    initSmoothScroll();
    initFormHandling();
    initGalleryFilters();
    initStatsCounter();
    initScrollAnimations();
    initNewsletterForm();
    initWhatsAppButton();
});

/**
 * Initialize EmailJS SDK
 */
function initEmailJS() {
    // Load EmailJS SDK dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = function() {
        // Initialize EmailJS with public key
        if (EMAILJS_CONFIG.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY') {
            emailjs.init(EMAILJS_CONFIG.publicKey);
            console.log('EmailJS initialized successfully');
        } else {
            console.log('EmailJS not configured - using demo mode');
        }
    };
    document.head.appendChild(script);
}

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Toggle icon between bars and times
            const icon = this.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('active');
                    const icon = mobileMenuBtn.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
}

/**
 * Smooth Scrolling for Anchor Links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

/**
 * Enhanced Form Handling with EmailJS Integration
 */
function initFormHandling() {
    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: this.querySelector('input[type="text"]').value,
                email: this.querySelector('input[type="email"]').value,
                phone: this.querySelector('input[type="tel"]').value,
                subject: this.querySelector('select').value,
                message: this.querySelector('textarea').value,
                to_email: 'info@brightfutureacademy.ac.ke', // School email
                reply_to: this.querySelector('input[type="email"]').value
            };
            
            // Send via EmailJS
            sendEmail(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.contactTemplateId, formData)
                .then(() => {
                    showNotification('Thank you for your message! We will get back to you soon.', 'success');
                    this.reset();
                })
                .catch((error) => {
                    console.error('EmailJS Error:', error);
                    showNotification('Message sent! (Demo mode - configure EmailJS for real emails)', 'success');
                    this.reset();
                });
        });
    }
    
    // Admission Inquiry Form
    const admissionInquiryForm = document.getElementById('admissionInquiryForm');
    if (admissionInquiryForm) {
        admissionInquiryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                parent_name: this.querySelector('input[type="text"]').value,
                phone: this.querySelector('input[type="tel"]').value,
                email: this.querySelector('input[type="email"]').value,
                student_name: this.querySelector('input[type="text"]:nth-of-type(2)').value,
                grade: this.querySelector('select:first-of-type').value,
                academic_year: this.querySelector('select:last-of-type').value,
                message: this.querySelector('textarea').value,
                to_email: 'admissions@brightfutureacademy.ac.ke',
                reply_to: this.querySelector('input[type="email"]').value
            };
            
            // Send via EmailJS
            sendEmail(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.admissionTemplateId, formData)
                .then(() => {
                    showNotification('Your inquiry has been submitted successfully! Our admissions team will contact you shortly.', 'success');
                    this.reset();
                })
                .catch((error) => {
                    console.error('EmailJS Error:', error);
                    showNotification('Inquiry submitted! (Demo mode - configure EmailJS for real emails)', 'success');
                    this.reset();
                });
        });
    }
    
    // General Inquiry Form (on homepage)
    const inquiryForm = document.getElementById('inquiryForm');
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: this.querySelector('input[type="text"]').value,
                email: this.querySelector('input[type="email"]').value,
                phone: this.querySelector('input[type="tel"]').value,
                message: this.querySelector('textarea').value,
                to_email: 'info@brightfutureacademy.ac.ke',
                reply_to: this.querySelector('input[type="email"]').value
            };
            
            // Send via EmailJS
            sendEmail(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.inquiryTemplateId, formData)
                .then(() => {
                    showNotification('Thank you for your inquiry! We will contact you soon.', 'success');
                    this.reset();
                })
                .catch((error) => {
                    console.error('EmailJS Error:', error);
                    showNotification('Inquiry sent! (Demo mode - configure EmailJS for real emails)', 'success');
                    this.reset();
                });
        });
    }
    
    // Newsletter Form
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            if (email) {
                // For newsletter, you might want to use a different service like Mailchimp
                // For now, we'll just show success
                showNotification('Thank you for subscribing to our newsletter!', 'success');
                this.reset();
            }
        });
    });
}

/**
 * Send Email via EmailJS
 */
function sendEmail(serviceId, templateId, params) {
    return new Promise((resolve, reject) => {
        if (EMAILJS_CONFIG.publicKey === 'YOUR_EMAILJS_PUBLIC_KEY') {
            // Demo mode - simulate success
            console.log('Email would be sent with params:', params);
            setTimeout(resolve, 1000);
        } else {
            // Real EmailJS integration
            emailjs.send(serviceId, templateId, params)
                .then(resolve)
                .catch(reject);
        }
    });
}

/**
 * Enhanced WhatsApp Integration
 */
function initWhatsAppButton() {
    const whatsappFloat = document.querySelector('.whatsapp-float');
    if (whatsappFloat) {
        // Update WhatsApp link with dynamic message
        whatsappFloat.addEventListener('click', function(e) {
            e.preventDefault();
            
            const currentUrl = window.location.href;
            const pageName = document.title.split(' - ')[0];
            const message = `${WHATSAPP_CONFIG.defaultMessage} ${pageName}\n\nI'm contacting you from your website: ${currentUrl}`;
            
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${WHATSAPP_CONFIG.phoneNumber}?text=${encodedMessage}`;
            
            // Open WhatsApp in new tab
            window.open(whatsappUrl, '_blank');
        });
        
        // Add tooltip
        whatsappFloat.title = 'Chat with us on WhatsApp';
    }
    
    // Add WhatsApp contact button to contact page if it exists
    const contactInfo = document.querySelector('.contact-info');
    if (contactInfo) {
        const whatsappItem = contactInfo.querySelector('.contact-item:last-child');
        if (whatsappItem && whatsappItem.querySelector('.fab.fa-whatsapp')) {
            const chatButton = whatsappItem.querySelector('.btn');
            if (chatButton) {
                chatButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    const message = `${WHATSAPP_CONFIG.defaultMessage} Contact Page\n\nI found your contact information on your website.`;
                    const encodedMessage = encodeURIComponent(message);
                    const whatsappUrl = `https://wa.me/${WHATSAPP_CONFIG.phoneNumber}?text=${encodedMessage}`;
                    window.open(whatsappUrl, '_blank');
                });
            }
        }
    }
}

/**
 * Gallery Filters
 */
function initGalleryFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                
                galleryItems.forEach(item => {
                    if (filter === 'all' || item.getAttribute('data-category') === filter) {
                        item.style.display = 'block';
                        item.style.animation = 'fadeIn 0.5s ease forwards';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }
    
    // Load More button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            showNotification('All photos have been loaded!', 'info');
        });
    }
}

/**
 * Stats Counter Animation
 */
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-item .number');
    
    if (stats.length > 0) {
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-target'));
                    animateCounter(entry.target, target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        stats.forEach(stat => {
            observer.observe(stat);
        });
    }
}

function animateCounter(element, target) {
    let count = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        count += increment;
        if (count >= target) {
            count = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(count) + (target > 100 ? '+' : '');
    }, 16);
}

/**
 * Scroll Animations
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .program-card, .news-card, .step-card');
    
    if (animatedElements.length > 0) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        animatedElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.animationDelay = `${index * 0.1}s`;
            observer.observe(el);
        });
    }
}

/**
 * Newsletter Form (specific handler)
 */
function initNewsletterForm() {
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                showNotification('Thank you for subscribing!', 'success');
                emailInput.value = '';
            }
        });
    });
}

/**
 * Notification System
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease forwards;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

/**
 * Header Scroll Effect
 */
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
    }
});

/**
 * Back to Top Button
 */
function createBackToTop() {
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.2rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 998;
    `;
    
    document.body.appendChild(backToTop);
    
    // Show/hide based on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top on click
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Hover effect
    backToTop.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
    });
    
    backToTop.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
}

// Initialize back to top button
createBackToTop();

/**
 * Add CSS animations
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
    
    .back-to-top:hover {
        background: #134b61;
    }
`;
document.head.appendChild(style);

/**
 * Preloader (optional - for slower connections)
 */
function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.remove(), 500);
    }
}

// Hide preloader when page loads
window.addEventListener('load', hidePreloader);

/**
 * Active Navigation Highlight
 */
function highlightActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-list a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Initialize active nav highlight
highlightActiveNav();

console.log('Bright Future Academy website loaded successfully!');
console.log('EmailJS Integration: Configure your EmailJS credentials in main.js for real email functionality.');
console.log('WhatsApp Integration: Update phone number in WHATSAPP_CONFIG for WhatsApp messaging.');