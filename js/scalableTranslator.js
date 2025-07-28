// Scalable Translation System
class ScalableTranslator {
    constructor() {
        this.currentLanguage = 'en';
        this.translatedContent = null;
        this.originalContent = null;
        this.translationCache = new Map();
        this.init();
    }

    async init() {
        console.log('=== SCALABLE TRANSLATOR INIT ===');
        
        // Load saved language preference
        this.currentLanguage = localStorage.getItem('cookbook-language') || 'en';
        console.log('Current language:', this.currentLanguage);
        
        // Load original content
        await this.loadOriginalContent();
        
        // Set default content to English
        this.translatedContent = this.originalContent;
        
        // Translate content if needed
        if (this.currentLanguage !== 'en') {
            await this.translateContent();
            // If translation failed, translatedContent is already set to originalContent
        }
        
        console.log('Scalable translator initialized');
    }

    async loadOriginalContent() {
        try {
            console.log('Loading original content from data/cookbook-data.json...');
            const response = await fetch('data/cookbook-data.json');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.originalContent = await response.json();
            console.log('Original content loaded successfully:', this.originalContent);
        } catch (error) {
            console.error('Failed to load original content:', error);
            // Create a fallback content structure
            this.originalContent = {
                ui: {
                    title: "My Recipe Journal",
                    search_placeholder: "Search recipes...",
                    categories: {
                        all: "All Recipes",
                        main_courses: "Main Courses",
                        desserts: "Desserts",
                        soups: "Soups",
                        quick: "Quick Recipes",
                        vegetarian: "Vegetarian"
                    }
                },
                navigation: {
                    home: "Home",
                    breadcrumbs: {
                        separator: "›"
                    }
                },
                categories: {
                    "main-courses": {
                        name: "Main Courses",
                        recipes: [
                            { id: "bourguignon", title: "Seitan Bourguignon", file: "bourguignon.html", image: "bourguignon.webp", description: "A hearty vegetarian version of the classic French dish" },
                            { id: "lentils_soup", title: "Lentils Soup", file: "lentils_soup.html", image: "lentils_soup.webp", description: "Warm and nutritious lentil soup" },
                            { id: "moussaka", title: "Moussaka", file: "moussaka.html", image: "moussaka.webp", description: "Layered eggplant and potato casserole" }
                        ]
                    },
                    desserts: {
                        name: "Desserts",
                        recipes: [
                            { id: "banana_bread", title: "Banana Bread", file: "banana_bread.html", image: "banana_bread.webp", description: "Moist and delicious banana bread" },
                            { id: "chocolate_truffles", title: "Chocolate Truffles", file: "chocolate_truffles.html", image: "chocolate_truffles.webp", description: "Rich and creamy chocolate truffles" },
                            { id: "rice_pudding", title: "Rice Pudding", file: "rice_pudding.html", image: "rice_pudding.webp", description: "Creamy and comforting rice pudding" }
                        ]
                    }
                }
            };
            console.log('Using fallback content structure');
        }
    }

    async translateContent() {
        if (!this.originalContent) {
            console.error('No original content to translate');
            return;
        }

        try {
            console.log('Translating entire content to:', this.currentLanguage);
            
            // Check cache first
            const cacheKey = `content_${this.currentLanguage}`;
            if (this.translationCache.has(cacheKey)) {
                this.translatedContent = this.translationCache.get(cacheKey);
                console.log('Using cached translation');
                return;
            }

            // Convert content to flat structure for translation
            const flatContent = this.flattenObject(this.originalContent);
            const textToTranslate = Object.values(flatContent).filter(text => typeof text === 'string');
            
            console.log('Texts to translate:', textToTranslate);

            // Translate all texts at once
            const translatedTexts = await this.translateTexts(textToTranslate);
            
            // Check if translation failed (API rate limit or error)
            if (translatedTexts === textToTranslate) {
                console.log('Translation failed or API rate limited, using original English content');
                this.translatedContent = this.originalContent;
                return;
            }
            
            // Reconstruct translated content
            this.translatedContent = this.reconstructTranslatedContent(flatContent, translatedTexts);
            
            // Cache the result
            this.translationCache.set(cacheKey, this.translatedContent);
            
            console.log('Content translation completed');
        } catch (error) {
            console.error('Translation failed:', error);
            console.log('Using original English content due to translation failure');
            this.translatedContent = this.originalContent;
        }
    }

    flattenObject(obj, prefix = '') {
        const flattened = {};
        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                Object.assign(flattened, this.flattenObject(obj[key], prefix + key + '.'));
            } else {
                flattened[prefix + key] = obj[key];
            }
        }
        return flattened;
    }

    async translateTexts(texts) {
        try {
            const response = await fetch('https://libretranslate.com/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: texts,
                    source: 'en',
                    target: this.currentLanguage,
                    format: 'text',
                    alternatives: 1,
                    api_key: ''
                })
            });

            const data = await response.json();

            if (data.error) {
                console.warn('Translation API error:', data.error);
                return texts; // Return original texts if translation fails
            }

            return data.translatedText || texts;
        } catch (error) {
            console.warn('Translation API failed:', error);
            return texts; // Return original texts if API fails
        }
    }

    reconstructTranslatedContent(flatContent, translatedTexts) {
        const translatedFlat = {};
        const originalValues = Object.values(flatContent);
        
        Object.keys(flatContent).forEach((key, index) => {
            if (typeof flatContent[key] === 'string') {
                translatedFlat[key] = translatedTexts[index] || flatContent[key];
            } else {
                translatedFlat[key] = flatContent[key];
            }
        });

        return this.unflattenObject(translatedFlat);
    }

    unflattenObject(flatObj) {
        const result = {};
        for (const key in flatObj) {
            const keys = key.split('.');
            let current = result;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = flatObj[key];
        }
        return result;
    }

    async changeLanguage(newLang) {
        if (newLang === this.currentLanguage) {
            return;
        }

        console.log(`Changing language from ${this.currentLanguage} to ${newLang}`);
        this.currentLanguage = newLang;
        localStorage.setItem('cookbook-language', newLang);

        // Clear cache for new language
        this.translationCache.clear();

        if (newLang === 'en') {
            this.translatedContent = this.originalContent;
            console.log('Using English content');
        } else {
            await this.translateContent();
            // If translation failed, we already set translatedContent to originalContent
        }

        // Update the page with new translations
        this.updatePageContent();
        
        console.log(`Language changed to: ${newLang}`);
    }

    updatePageContent() {
        if (!this.translatedContent) {
            console.error('No translated content available');
            return;
        }

        // Update UI elements
        this.updateUIElements();
        
        // Update recipe content
        this.updateRecipeContent();
    }

    updateUIElements() {
        // Update title
        const title = document.querySelector('h1[data-i18n="my_recipe_journal"]');
        if (title && this.translatedContent.ui.title) {
            title.textContent = this.translatedContent.ui.title;
        }

        // Update search placeholder
        const searchInput = document.querySelector('input[data-i18n="search_placeholder"]');
        if (searchInput && this.translatedContent.ui.search_placeholder) {
            searchInput.placeholder = this.translatedContent.ui.search_placeholder;
        }

        // Update category buttons
        const categoryButtons = document.querySelectorAll('.filter-btn');
        categoryButtons.forEach(button => {
            const category = button.getAttribute('data-category');
            if (category && this.translatedContent.ui.categories[category]) {
                button.textContent = this.translatedContent.ui.categories[category];
            }
        });
    }

    updateRecipeContent() {
        // Update recipe titles in the recipe loader
        if (window.recipeLoader && this.translatedContent.categories) {
            // Trigger recipe reload with translated content
            window.recipeLoader.updateWithTranslatedContent(this.translatedContent.categories);
        }
    }

    // Get translated text by key path
    getText(keyPath) {
        const content = this.translatedContent || this.originalContent;
        if (!content) return keyPath;

        const keys = keyPath.split('.');
        let result = content;
        
        for (const key of keys) {
            if (result && result[key]) {
                result = result[key];
            } else {
                return keyPath; // Return original if not found
            }
        }
        
        return result;
    }
}

// Initialize scalable translator
document.addEventListener('DOMContentLoaded', () => {
    window.scalableTranslator = new ScalableTranslator();
}); 