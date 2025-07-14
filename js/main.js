

// Main JavaScript for VibelyCode

// DOM Elements
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const searchToggle = document.getElementById('search-toggle');
const searchBar = document.getElementById('search-bar');
const themeToggle = document.getElementById('theme-toggle');
const scrollToTopBtn = document.getElementById('scroll-to-top');
const slider = document.getElementById('slider');
const prevSlideBtn = document.getElementById('prev-slide');
const nextSlideBtn = document.getElementById('next-slide');
const categoryFilters = document.querySelectorAll('.category-filter');
const postCards = document.querySelectorAll('.post-card');

// Mobile Menu Toggle
mobileMenuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    // Close search bar if open
    if (!searchBar.classList.contains('hidden')) {
        searchBar.classList.add('hidden');
    }
});

// Search Toggle
searchToggle.addEventListener('click', () => {
    searchBar.classList.toggle('hidden');
    // Close mobile menu if open
    if (!mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
    }
});

// Theme Toggle (Dark/Light Mode)
themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    
    // Save preference to localStorage
    if (document.documentElement.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// Check for saved theme preference
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
} else {
    // Default to light mode
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
}

// Scroll to Top Button
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.remove('opacity-0', 'invisible');
        scrollToTopBtn.classList.add('opacity-100', 'visible');
    } else {
        scrollToTopBtn.classList.remove('opacity-100', 'visible');
        scrollToTopBtn.classList.add('opacity-0', 'invisible');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Featured Posts Slider
let currentSlide = 0;
const slideWidth = 100; // Percentage width of each slide
const totalSlides = slider.children.length;

// Initialize slider position
updateSliderPosition();

// Previous Slide Button
prevSlideBtn.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSliderPosition();
});

// Next Slide Button
nextSlideBtn.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSliderPosition();
});

// Auto slide every 5 seconds
let autoSlideInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSliderPosition();
}, 5000);

// Pause auto slide on mouse hover
slider.addEventListener('mouseenter', () => {
    clearInterval(autoSlideInterval);
});

// Resume auto slide when mouse leaves
slider.addEventListener('mouseleave', () => {
    autoSlideInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSliderPosition();
    }, 5000);
});

// Update slider position
function updateSliderPosition() {
    const offset = -currentSlide * slideWidth;
    slider.style.transform = `translateX(${offset}%)`;
}

// Category Filters
categoryFilters.forEach(filter => {
    filter.addEventListener('click', () => {
        // Remove active class from all filters
        categoryFilters.forEach(f => f.classList.remove('active', 'bg-primary', 'text-white'));
        categoryFilters.forEach(f => f.classList.add('bg-white', 'dark:bg-gray-700'));
        
        // Add active class to clicked filter
        filter.classList.add('active', 'bg-primary', 'text-white');
        filter.classList.remove('bg-white', 'dark:bg-gray-700');
        
        const category = filter.getAttribute('data-category');
        
        // Show/hide posts based on category
        postCards.forEach(card => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.classList.remove('hidden');
                // Add animation
                card.classList.add('fade-in');
                setTimeout(() => {
                    card.classList.remove('fade-in');
                }, 500);
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

// Copy Code Button Functionality
document.addEventListener('DOMContentLoaded', () => {
    const codeBlocks = document.querySelectorAll('.code-block');
    
    codeBlocks.forEach(block => {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-button';
        copyBtn.textContent = 'Copy';
        
        copyBtn.addEventListener('click', () => {
            const code = block.querySelector('pre').textContent;
            navigator.clipboard.writeText(code).then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
        
        block.appendChild(copyBtn);
    });
});

// Lazy Loading Images
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
        });
    }
});

// Search Functionality
const searchInput = document.querySelector('#search-bar input');
if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm.length > 2) {
                // In a real application, this would redirect to search results
                // For demo purposes, we'll just filter the visible posts
                postCards.forEach(card => {
                    const title = card.querySelector('h3').textContent.toLowerCase();
                    const description = card.querySelector('p').textContent.toLowerCase();
                    
                    if (title.includes(searchTerm) || description.includes(searchTerm)) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
                
                // Close search bar
                searchBar.classList.add('hidden');
            }
        }
    });
}

// Newsletter Form Submission
const newsletterForm = document.querySelector('form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const email = emailInput.value;
        
        if (email && email.includes('@')) {
            // In a real application, this would submit to a backend
            // For demo purposes, just show a success message
            const formContainer = newsletterForm.parentElement;
            formContainer.innerHTML = '<h2 class="text-3xl font-bold mb-4">Thank You!</h2><p class="text-gray-600 dark:text-gray-400">You have successfully subscribed to our newsletter.</p>';
        }
    });
}

// Add animation to elements when they come into view
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if ('IntersectionObserver' in window) {
        const elementObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('slide-up');
                    observer.unobserve(entry.target);
                }
            });
        });
        
        animatedElements.forEach(element => {
            elementObserver.observe(element);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        animatedElements.forEach(element => {
            element.classList.add('slide-up');
        });
    }
});

