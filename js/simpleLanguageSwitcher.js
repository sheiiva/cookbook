class SimpleLanguageSwitcher {
    constructor() {
        this.toggleButton = null;
        this.languageMenu = null;
        this.isMenuVisible = false;
    }

    init() {
        console.log('=== SIMPLE LANGUAGE SWITCHER INIT ===');
        
        this.toggleButton = document.getElementById('language-toggle');
        this.languageMenu = document.getElementById('language-menu');
        
        if (!this.toggleButton || !this.languageMenu) {
            console.error('Language switcher elements not found');
            return;
        }
        
        console.log('Language switcher elements found');
        
        // Add event listeners
        this.toggleButton.addEventListener('click', (e) => this.handleToggleClick(e));
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
        
        // Handle language option clicks
        this.languageMenu.addEventListener('click', (e) => this.handleLanguageOptionClick(e));
        
        console.log('Simple language switcher initialized');
    }

    handleToggleClick(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        
        console.log('=== LANGUAGE TOGGLE CLICKED ===');
        console.log('Event:', e);
        console.log('Target:', e.target);
        console.log('Menu visible before:', this.isMenuVisible);
        
        this.isMenuVisible = !this.isMenuVisible;
        
        if (this.isMenuVisible) {
            this.showMenu();
        } else {
            this.hideMenu();
        }
        
        console.log('Menu visible after:', this.isMenuVisible);
    }

    handleOutsideClick(e) {
        if (!this.languageMenu.contains(e.target) && !this.toggleButton.contains(e.target)) {
            this.hideMenu();
        }
    }

    handleLanguageOptionClick(e) {
        const langOption = e.target.closest('.lang-option');
        if (!langOption) return;
        
        e.preventDefault();
        e.stopImmediatePropagation();
        
        const languageCode = langOption.getAttribute('data-lang');
        console.log('=== LANGUAGE OPTION CLICKED ===');
        console.log('Option clicked:', langOption.textContent);
        console.log('Language code:', languageCode);
        console.log('Event:', e);
        
        if (languageCode) {
            this.changeLanguage(languageCode);
            this.hideMenu();
        }
    }

    showMenu() {
        console.log('Showing language menu...');
        this.languageMenu.classList.add('show');
        this.isMenuVisible = true;
        
        // Remove any problematic inline styles
        this.languageMenu.style.removeProperty('background');
        this.languageMenu.style.removeProperty('background-color');
        this.languageMenu.style.removeProperty('border');
        this.languageMenu.style.removeProperty('color');
        
        // Force menu visibility if needed
        console.log('Forcing menu visibility...');
        this.languageMenu.style.display = 'block';
        this.languageMenu.style.opacity = '1';
        this.languageMenu.style.visibility = 'visible';
        this.languageMenu.style.transform = 'translateY(0)';
        this.languageMenu.style.pointerEvents = 'auto';
        
        console.log('Menu forced visible');
        
        // Debug computed styles
        const computedStyles = window.getComputedStyle(this.languageMenu);
        console.log('Computed styles after forcing:');
        console.log('- opacity:', computedStyles.opacity);
        console.log('- visibility:', computedStyles.visibility);
        console.log('- display:', computedStyles.display);
        console.log('- position:', computedStyles.position);
        console.log('- top:', computedStyles.top);
        console.log('- right:', computedStyles.right);
        console.log('- z-index:', computedStyles.zIndex);
        console.log('- background:', computedStyles.background);
        
        // Check if menu is in viewport
        const rect = this.languageMenu.getBoundingClientRect();
        console.log('Menu bounding rect:', rect);
        console.log('Menu is in viewport:', rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth);
        
        // Check parent element
        const parent = this.languageMenu.parentElement;
        console.log('Parent element:', parent);
        if (parent) {
            const parentStyles = window.getComputedStyle(parent);
            console.log('Parent styles:', parentStyles);
        }
    }

    hideMenu() {
        console.log('Hiding language menu...');
        this.languageMenu.classList.remove('show');
        this.isMenuVisible = false;
    }

    changeLanguage(languageCode) {
        console.log('Language changed to:', languageCode);
        
        // Update language menu loader
        if (window.languageMenuLoader) {
            window.languageMenuLoader.setCurrentLanguage(languageCode);
        }
        
        // Save to localStorage
        localStorage.setItem('cookbook-language', languageCode);
        
        // Call scalable translator if available
        if (window.scalableTranslator) {
            console.log('Calling scalable translator...');
            window.scalableTranslator.changeLanguage(languageCode);
        } else if (window.dynamicTranslator) {
            console.log('Calling dynamic translator...');
            window.dynamicTranslator.changeLanguage(languageCode);
        } else {
            console.log('No translator available, reloading page...');
            window.location.reload();
        }
        
        console.log('Language preference saved to localStorage');
    }

    updateLanguageDisplay(languageCode) {
        const currentLangElement = document.querySelector('.current-lang');
        if (currentLangElement && window.languageMenuLoader) {
            const language = window.languageMenuLoader.getLanguageByCode(languageCode);
            if (language) {
                currentLangElement.textContent = language.native;
            }
        }
    }

    showLanguageChangeFeedback() {
        // Optional: Show a brief feedback message
        const feedback = document.createElement('div');
        feedback.textContent = 'Language changed!';
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 2000);
    }
}

// Initialize simple language switcher
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        window.simpleLanguageSwitcher = new SimpleLanguageSwitcher();
        window.simpleLanguageSwitcher.init();
    }, 100);
}); 