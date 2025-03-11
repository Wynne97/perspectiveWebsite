/**
 * Perspective Website - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
    }
    
    // Sticky header
    const header = document.querySelector('.site-header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // FAQ accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', function() {
                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        });
    }
    
    // Testimonial carousel
    const testimonialDots = document.querySelectorAll('.nav-dot');
    const testimonials = document.querySelectorAll('.testimonial-card');
    
    if (testimonialDots.length > 0 && testimonials.length > 0) {
        // Hide all testimonials except the first one
        testimonials.forEach((testimonial, index) => {
            if (index !== 0) {
                testimonial.style.display = 'none';
            }
        });
        
        // Add click event to dots
        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                // Remove active class from all dots
                testimonialDots.forEach(d => d.classList.remove('active'));
                
                // Add active class to current dot
                this.classList.add('active');
                
                // Hide all testimonials
                testimonials.forEach(t => t.style.display = 'none');
                
                // Show current testimonial
                testimonials[index].style.display = 'block';
            });
        });
        
        // Auto-rotate testimonials
        let currentIndex = 0;
        setInterval(() => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            
            // Update dots
            testimonialDots.forEach(d => d.classList.remove('active'));
            testimonialDots[currentIndex].classList.add('active');
            
            // Update testimonials
            testimonials.forEach(t => t.style.display = 'none');
            testimonials[currentIndex].style.display = 'block';
        }, 5000);
    }
    
    // Animate elements when they come into view
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animateElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, { threshold: 0.1 });
        
        animateElements.forEach(element => {
            observer.observe(element);
        });
    }
    
    // Form validation
    const forms = document.querySelectorAll('form');
    
    if (forms.length > 0) {
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Simple validation
                let isValid = true;
                const requiredFields = form.querySelectorAll('[required]');
                
                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.classList.add('is-invalid');
                    } else {
                        field.classList.remove('is-invalid');
                    }
                });
                
                // If email field exists, validate email format
                const emailField = form.querySelector('input[type="email"]');
                if (emailField && emailField.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(emailField.value.trim())) {
                        isValid = false;
                        emailField.classList.add('is-invalid');
                    }
                }
                
                if (isValid) {
                    // Show success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'form-success';
                    successMessage.textContent = 'Thank you! Your submission has been received.';
                    
                    form.reset();
                    form.appendChild(successMessage);
                    
                    // Remove success message after 3 seconds
                    setTimeout(() => {
                        successMessage.remove();
                    }, 3000);
                }
            });
        });
    }
    
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    if (anchorLinks.length > 0) {
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without page reload
                    history.pushState(null, null, targetId);
                }
            });
        });
    }
    
    // Add active class to current page in navigation
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.main-nav a');
    
    if (navLinks.length > 0) {
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            
            if (currentPage === linkPage || (currentPage === '' && linkPage === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
});
