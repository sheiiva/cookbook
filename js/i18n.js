// Internationalization System with Translation API
class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.fallbackLanguage = 'en';
        this.translations = {};
        this.translationAPI = null;
        this.supportedLanguages = {
            'en': 'English',
            'fr': 'Français',
            'es': 'Español',
            'de': 'Deutsch',
            'it': 'Italiano',
            'pt': 'Português',
            'nl': 'Nederlands',
            'ru': 'Русский',
            'zh': '中文',
            'ja': '日本語',
            'ko': '한국어'
        };
        
        this.init();
    }

    async init() {
        // Load saved language preference
        this.currentLanguage = localStorage.getItem('cookbook-language') || 'en';
        
        // Initialize translation API
        this.initTranslationAPI();
        
        // Load base translations
        await this.loadTranslations();
        
        // Apply translations
        this.applyTranslations();
        
        // Setup language switcher
        this.setupLanguageSwitcher();
    }

    initTranslationAPI() {
        // LibreTranslate API (free, no API key required)
        this.translationAPI = {
            translate: async (text, targetLang) => {
                try {
                    const response = await fetch('https://libretranslate.com/translate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            q: text,
                            source: 'en',
                            target: targetLang,
                            format: 'text',
                            alternatives: 1,
                            api_key: ''
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.error) {
                        console.error('LibreTranslate error:', data.error);
                        return text; // Fallback to original text
                    }
                    
                    return data.translatedText || text;
                } catch (error) {
                    console.error('Translation API error:', error);
                    return text; // Fallback to original text
                }
            }
        };
    }

    async loadTranslations() {
        // Base translations (English)
        this.translations.en = {
            // Navigation
            'home': 'Home',
            'recipes': 'Recipes',
            'search_placeholder': 'Search recipes...',
            'back_to_recipes': '← Back to Recipes',
            
            // Categories
            'main_courses': 'Main Courses',
            'desserts': 'Desserts',
            'soups': 'Soups',
            'quick_recipes': 'Quick Recipes',
            'vegetarian': 'Vegetarian',
            'all_recipes': 'All Recipes',
            
            // Recipe details
            'ingredients': 'Ingredients',
            'instructions': 'Instructions',
            'prep_time': 'Prep Time',
            'cook_time': 'Cook Time',
            'total_time': 'Total Time',
            'servings': 'Servings',
            'difficulty': 'Difficulty',
            'easy': 'Easy',
            'medium': 'Medium',
            'hard': 'Hard',
            
            // Common words
            'minutes': 'minutes',
            'hours': 'hours',
            'serves': 'serves',
            'people': 'people',
            
            // Recipe names
            'seitan_bourguignon': 'Seitan Bourguignon',
            'lentils_soup': 'Lentils Soup',
            'moussaka': 'Moussaka',
            'banana_bread': 'Banana Bread',
            'chocolate_truffles': 'Chocolate Truffles',
            'rice_pudding': 'Rice Pudding',
            
            // Descriptions
            'bourguignon_desc': 'A hearty vegetarian version of the classic French dish',
            'lentils_desc': 'Warm and nutritious lentil soup',
            'moussaka_desc': 'Layered eggplant and potato casserole',
            'banana_bread_desc': 'Moist and delicious banana bread',
            'chocolate_truffles_desc': 'Rich and creamy chocolate truffles',
            'rice_pudding_desc': 'Creamy and comforting rice pudding'
        };

        // Load other languages from API or cache
        for (const lang of Object.keys(this.supportedLanguages)) {
            if (lang !== 'en') {
                await this.loadLanguageTranslations(lang);
            }
        }
    }

    async loadLanguageTranslations(targetLang) {
        try {
            // Check if we have cached translations
            const cached = localStorage.getItem(`translations_${targetLang}`);
            if (cached) {
                this.translations[targetLang] = JSON.parse(cached);
                return;
            }

            // Translate base English translations
            this.translations[targetLang] = {};
            for (const [key, value] of Object.entries(this.translations.en)) {
                const translated = await this.translationAPI.translate(value, targetLang);
                this.translations[targetLang][key] = translated;
            }

            // Cache translations
            localStorage.setItem(`translations_${targetLang}`, JSON.stringify(this.translations[targetLang]));
        } catch (error) {
            console.error(`Failed to load translations for ${targetLang}:`, error);
            // Fallback to English
            this.translations[targetLang] = this.translations.en;
        }
    }

    translate(key, lang = this.currentLanguage) {
        const translations = this.translations[lang] || this.translations[this.fallbackLanguage];
        return translations[key] || key;
    }

    async changeLanguage(newLang) {
        if (!this.supportedLanguages[newLang]) {
            console.error(`Unsupported language: ${newLang}`);
            return;
        }

        this.currentLanguage = newLang;
        localStorage.setItem('cookbook-language', newLang);
        
        // Load translations if not already loaded
        if (!this.translations[newLang]) {
            await this.loadLanguageTranslations(newLang);
        }
        
        // Apply translations
        this.applyTranslations();
        
        // Update recipe data if using dynamic loading
        if (window.recipeLoader) {
            await this.updateRecipeData();
        }
    }

    applyTranslations() {
        // Translate static content
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translated = this.translate(key);
            if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                element.placeholder = translated;
            } else {
                element.textContent = translated;
            }
        });

        // Update page title
        const title = document.querySelector('title');
        if (title) {
            title.textContent = this.translate('my_recipe_journal');
        }

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', this.translate('site_description'));
        }
    }

    async updateRecipeData() {
        // Update recipe data in JSON with translated names
        if (window.recipeLoader && window.recipeLoader.recipesData) {
            const updatedData = JSON.parse(JSON.stringify(window.recipeLoader.recipesData));
            
            Object.keys(updatedData.categories).forEach(categoryId => {
                updatedData.categories[categoryId].name = this.translate(categoryId);
                
                updatedData.categories[categoryId].recipes.forEach(recipe => {
                    const recipeKey = recipe.id;
                    recipe.title = this.translate(recipeKey);
                    recipe.description = this.translate(`${recipeKey}_desc`);
                });
            });
            
            window.recipeLoader.recipesData = updatedData;
            window.recipeLoader.renderRecipes();
        }
    }

    setupLanguageSwitcher() {
        // Create language switcher
        const header = document.querySelector('header .container');
        if (!header) {
            console.error('Header container not found');
            return;
        }

        // Remove existing language switcher if it exists
        const existingSwitcher = document.querySelector('.language-switcher');
        if (existingSwitcher) {
            existingSwitcher.remove();
        }

        const languageSwitcher = document.createElement('div');
        languageSwitcher.className = 'language-switcher';
        
        // Create a toggle button and language menu
        languageSwitcher.innerHTML = `
            <button id="language-toggle" class="language-toggle" aria-label="Change language">
                <span class="current-lang">${this.supportedLanguages[this.currentLanguage]}</span>
                <span class="toggle-icon">🌍</span>
            </button>
            <div id="language-menu" class="language-menu">
                ${Object.entries(this.supportedLanguages).map(([code, name]) => 
                    `<button class="lang-option ${code === this.currentLanguage ? 'active' : ''}" data-lang="${code}">
                        ${name}
                    </button>`
                ).join('')}
            </div>
        `;

        header.appendChild(languageSwitcher);
        console.log('Language switcher created successfully');

        // Add event listeners
        const toggle = document.getElementById('language-toggle');
        const menu = document.getElementById('language-menu');
        
        if (toggle && menu) {
            // Toggle menu visibility
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.toggle('show');
                console.log('Language menu toggled');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!languageSwitcher.contains(e.target)) {
                    menu.classList.remove('show');
                }
            });

            // Handle language selection
            const langOptions = menu.querySelectorAll('.lang-option');
            langOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const selectedLang = option.dataset.lang;
                    console.log('Language changed to:', selectedLang);
                    
                    // Update active state
                    langOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    
                    // Update toggle button text
                    const currentLangSpan = toggle.querySelector('.current-lang');
                    if (currentLangSpan) {
                        currentLangSpan.textContent = this.supportedLanguages[selectedLang];
                    }
                    
                    // Change language
                    this.changeLanguage(selectedLang);
                    
                    // Close menu
                    menu.classList.remove('show');
                });
            });
        } else {
            console.error('Language toggle or menu elements not found');
        }
    }

    // Utility method to translate dynamic content
    translateElement(element, key) {
        const translated = this.translate(key);
        if (element.tagName === 'INPUT' && element.type === 'placeholder') {
            element.placeholder = translated;
        } else {
            element.textContent = translated;
        }
    }
}

// Initialize i18n system
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing i18n system...');
    try {
        window.i18n = new I18nManager();
        console.log('i18n system initialized');
    } catch (error) {
        console.error('Failed to initialize i18n system:', error);
        // Fallback: create a simple language switcher
        createFallbackLanguageSwitcher();
    }
});

// Fallback language switcher if main system fails
function createFallbackLanguageSwitcher() {
    console.log('Creating fallback language switcher...');
    
    const header = document.querySelector('header .container');
    if (!header) {
        console.error('Header not found for fallback switcher');
        return;
    }
    
    const supportedLanguages = {
        'en': 'English',
        'fr': 'Français',
        'es': 'Español',
        'de': 'Deutsch',
        'it': 'Italiano',
        'pt': 'Português',
        'nl': 'Nederlands',
        'ru': 'Русский',
        'zh': '中文',
        'ja': '日本語',
        'ko': '한국어'
    };
    
    const currentLanguage = localStorage.getItem('cookbook-language') || 'en';
    
    const languageSwitcher = document.createElement('div');
    languageSwitcher.className = 'language-switcher';
    languageSwitcher.innerHTML = `
        <button id="language-toggle" class="language-toggle" aria-label="Change language">
            <span class="current-lang">${supportedLanguages[currentLanguage]}</span>
            <span class="toggle-icon">🌍</span>
        </button>
        <div id="language-menu" class="language-menu">
            ${Object.entries(supportedLanguages).map(([code, name]) => 
                `<button class="lang-option ${code === currentLanguage ? 'active' : ''}" data-lang="${code}">
                    ${name}
                </button>`
            ).join('')}
        </div>
    `;
    
    header.appendChild(languageSwitcher);
    console.log('Fallback language switcher created');
    
    // Add basic event listeners
    const toggle = document.getElementById('language-toggle');
    const menu = document.getElementById('language-menu');
    
    if (toggle && menu) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
        });
        
        document.addEventListener('click', (e) => {
            if (!languageSwitcher.contains(e.target)) {
                menu.classList.remove('show');
            }
        });
        
        const langOptions = menu.querySelectorAll('.lang-option');
        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const selectedLang = option.dataset.lang;
                console.log('Language selected (fallback):', selectedLang);
                
                // Update UI
                langOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                const currentLangSpan = toggle.querySelector('.current-lang');
                if (currentLangSpan) {
                    currentLangSpan.textContent = supportedLanguages[selectedLang];
                }
                
                // Save preference
                localStorage.setItem('cookbook-language', selectedLang);
                
                // Close menu
                menu.classList.remove('show');
                
                // Reload page to apply language change
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            });
        });
    }
} 