// Dynamic HTML Content Translator
class DynamicTranslator {
    constructor() {
        this.currentLanguage = 'en';
        this.translationAPI = null;
        this.translationCache = new Map();
        this.observer = null;
        this.translationDatabase = this.createTranslationDatabase();
        this.init();
    }

    createTranslationDatabase() {
        // Scalable translation database
        return {
            'fr': {
                'My Recipe Journal': 'Mon Journal de Recettes',
                'Search recipes...': 'Rechercher des recettes...',
                'Main Courses': 'Plats Principaux',
                'Desserts': 'Desserts',
                'Soups': 'Soupes',
                'Quick Recipes': 'Recettes Rapides',
                'Vegetarian': 'Végétarien',
                'All Recipes': 'Toutes les Recettes',
                'Seitan Bourguignon': 'Seitan Bourguignon',
                'Lentils Soup': 'Soupe aux Lentilles',
                'Moussaka': 'Moussaka',
                'Banana Bread': 'Pain aux Bananes',
                'Chocolate Truffles': 'Truffes au Chocolat',
                'Rice Pudding': 'Pudding au Riz'
            },
            'es': {
                'My Recipe Journal': 'Mi Diario de Recetas',
                'Search recipes...': 'Buscar recetas...',
                'Main Courses': 'Platos Principales',
                'Desserts': 'Postres',
                'Soups': 'Sopas',
                'Quick Recipes': 'Recetas Rápidas',
                'Vegetarian': 'Vegetariano',
                'All Recipes': 'Todas las Recetas',
                'Seitan Bourguignon': 'Seitan Bourguignon',
                'Lentils Soup': 'Sopa de Lentejas',
                'Moussaka': 'Moussaka',
                'Banana Bread': 'Pan de Plátano',
                'Chocolate Truffles': 'Trufas de Chocolate',
                'Rice Pudding': 'Pudín de Arroz'
            },
            'de': {
                'My Recipe Journal': 'Mein Rezeptjournal',
                'Search recipes...': 'Rezepte suchen...',
                'Main Courses': 'Hauptgerichte',
                'Desserts': 'Desserts',
                'Soups': 'Suppen',
                'Quick Recipes': 'Schnelle Rezepte',
                'Vegetarian': 'Vegetarisch',
                'All Recipes': 'Alle Rezepte',
                'Seitan Bourguignon': 'Seitan Bourguignon',
                'Lentils Soup': 'Linsensuppe',
                'Moussaka': 'Moussaka',
                'Banana Bread': 'Bananenbrot',
                'Chocolate Truffles': 'Schokoladentrüffel',
                'Rice Pudding': 'Reispudding'
            },
            'it': {
                'My Recipe Journal': 'Il Mio Diario di Ricette',
                'Search recipes...': 'Cerca ricette...',
                'Main Courses': 'Piatti Principali',
                'Desserts': 'Dolci',
                'Soups': 'Zuppe',
                'Quick Recipes': 'Ricette Veloci',
                'Vegetarian': 'Vegetariano',
                'All Recipes': 'Tutte le Ricette',
                'Seitan Bourguignon': 'Seitan Bourguignon',
                'Lentils Soup': 'Zuppa di Lenticchie',
                'Moussaka': 'Moussaka',
                'Banana Bread': 'Pane alle Banane',
                'Chocolate Truffles': 'Tartufi al Cioccolato',
                'Rice Pudding': 'Budino di Riso'
            },
            'pt': {
                'My Recipe Journal': 'Meu Diário de Receitas',
                'Search recipes...': 'Pesquisar receitas...',
                'Main Courses': 'Pratos Principais',
                'Desserts': 'Sobremesas',
                'Soups': 'Sopas',
                'Quick Recipes': 'Receitas Rápidas',
                'Vegetarian': 'Vegetariano',
                'All Recipes': 'Todas as Receitas'
            },
            'nl': {
                'My Recipe Journal': 'Mijn Recepten Dagboek',
                'Search recipes...': 'Recepten zoeken...',
                'Main Courses': 'Hoofdgerechten',
                'Desserts': 'Desserts',
                'Soups': 'Soepen',
                'Quick Recipes': 'Snelle Recepten',
                'Vegetarian': 'Vegetarisch',
                'All Recipes': 'Alle Recepten'
            }
        };
    }

    async init() {
        // Load saved language preference
        this.currentLanguage = localStorage.getItem('cookbook-language') || 'en';
        
        // Load translation database
        await this.loadTranslationDatabase();
        
        // Initialize translation API
        this.initTranslationAPI();
        
        // Start observing DOM changes
        this.startObserving();
        
        // Translate existing content
        await this.translatePageContent();
        
        console.log('Dynamic translator initialized');
    }

    async loadTranslationDatabase() {
        try {
            const response = await fetch('data/translations.json');
            this.translationDatabase = await response.json();
            console.log('Translation database loaded successfully');
        } catch (error) {
            console.warn('Failed to load translation database, using fallback:', error);
            // Fallback to embedded translations
            this.translationDatabase = this.createTranslationDatabase();
        }
    }

    initTranslationAPI() {
        this.translationAPI = {
            translate: async (text, targetLang) => {
                try {
                    // Skip translation if it's already English
                    if (targetLang === 'en') {
                        return text;
                    }

                    // Check cache first
                    const cacheKey = `${text}_${targetLang}`;
                    if (this.translationCache.has(cacheKey)) {
                        return this.translationCache.get(cacheKey);
                    }

                    // Try database translation first
                    if (this.translationDatabase[targetLang] && this.translationDatabase[targetLang][text]) {
                        const dbTranslation = this.translationDatabase[targetLang][text];
                        this.translationCache.set(cacheKey, dbTranslation);
                        return dbTranslation;
                    }

                    // Try API translation as fallback (with rate limiting)
                    const translatedText = await this.translateWithAPI(text, targetLang);
                    
                    // Cache the translation
                    this.translationCache.set(cacheKey, translatedText);
                    
                    return translatedText;
                } catch (error) {
                    console.warn('Translation error:', error);
                    return text;
                }
            }
        };
    }

    async translateWithAPI(text, targetLang) {
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
                // Handle rate limiting gracefully
                if (data.error.includes('rate') || data.error.includes('Slowdown') || data.error.includes('Too many')) {
                    console.log('API rate limited, using original text');
                    return text;
                }
                console.warn('Translation API error:', data.error);
                return text;
            }

            return data.translatedText || text;
        } catch (error) {
            console.warn('API translation failed:', error);
            return text;
        }
    }

    startObserving() {
        // Observe DOM changes to translate new content
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.translateElement(node);
                        }
                    });
                }
            });
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    async translatePageContent() {
        // Translate all text content on the page
        const textElements = this.getTranslatableElements();
        
        for (const element of textElements) {
            await this.translateElement(element);
        }
    }

    getTranslatableElements() {
        // Get all elements that should be translated
        const selectors = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'span', 'div', 'li', 'a',
            'input[placeholder]', 'textarea[placeholder]',
            'button', 'label'
        ];

        const elements = [];
        selectors.forEach(selector => {
            const found = document.querySelectorAll(selector);
            found.forEach(el => {
                if (this.shouldTranslateElement(el)) {
                    elements.push(el);
                }
            });
        });

        return elements;
    }

    shouldTranslateElement(element) {
        // Skip elements that shouldn't be translated
        const skipSelectors = [
            '.language-switcher',
            '.language-menu',
            '.lang-option',
            '.language-toggle',
            '.current-lang',
            '.toggle-icon',
            'script',
            'style',
            'code',
            'pre',
            '#language-toggle',
            '#language-menu'
        ];

        // Check if element or its parent is in skip list
        for (const selector of skipSelectors) {
            if (element.matches(selector) || element.closest(selector)) {
                return false;
            }
        }

        // Skip if already translated
        if (element.hasAttribute('data-translated')) {
            return false;
        }

        // Skip if no text content
        const text = this.getTextContent(element);
        if (!text || text.trim().length === 0) {
            return false;
        }

        // Skip if it's just whitespace or special characters
        if (/^[\s\W]+$/.test(text)) {
            return false;
        }

        // Skip if it's a language code or short text
        if (text.length <= 3 && /^[a-z]{2,3}$/i.test(text)) {
            return false;
        }

        return true;
    }

    getTextContent(element) {
        // Get text content, handling different element types
        if (element.tagName === 'INPUT' && element.type === 'placeholder') {
            return element.placeholder;
        }
        
        return element.textContent || element.innerText || '';
    }

    async translateElement(element) {
        if (!this.shouldTranslateElement(element)) {
            return;
        }

        const originalText = this.getTextContent(element);
        if (!originalText || originalText.trim().length === 0) {
            return;
        }

        try {
            console.log('Translating element:', element.tagName, 'Text:', originalText);
            const translatedText = await this.translationAPI.translate(originalText, this.currentLanguage);
            
            if (translatedText && translatedText !== originalText) {
                console.log('Translation result:', originalText, '→', translatedText);
                this.updateElementText(element, translatedText);
                element.setAttribute('data-translated', 'true');
                element.setAttribute('data-original-text', originalText);
            } else {
                console.log('No translation needed or available for:', originalText);
            }
        } catch (error) {
            console.error('Failed to translate element:', error);
        }
    }

    updateElementText(element, translatedText) {
        if (element.tagName === 'INPUT' && element.type === 'placeholder') {
            element.placeholder = translatedText;
        } else {
            element.textContent = translatedText;
        }
    }

    async changeLanguage(newLang) {
        if (newLang === this.currentLanguage) {
            return;
        }

        this.currentLanguage = newLang;
        localStorage.setItem('cookbook-language', newLang);

        // Clear translation cache for new language
        this.translationCache.clear();

        // Remove translated attributes to allow re-translation
        document.querySelectorAll('[data-translated]').forEach(el => {
            el.removeAttribute('data-translated');
        });

        // Re-translate all content
        await this.translatePageContent();

        console.log(`Language changed to: ${newLang}`);
    }

    // Utility method to translate specific text
    async translateText(text, targetLang = this.currentLanguage) {
        if (targetLang === 'en') {
            return text;
        }

        return await this.translationAPI.translate(text, targetLang);
    }

    // Method to handle dynamic content (like recipe data)
    async translateRecipeData(recipeData) {
        const translatedData = { ...recipeData };

        // Translate recipe titles and descriptions
        if (translatedData.title) {
            translatedData.title = await this.translateText(translatedData.title);
        }

        if (translatedData.description) {
            translatedData.description = await this.translateText(translatedData.description);
        }

        // Translate ingredients and instructions if they exist
        if (translatedData.ingredients) {
            translatedData.ingredients = await Promise.all(
                translatedData.ingredients.map(async (ingredient) => {
                    if (typeof ingredient === 'string') {
                        return await this.translateText(ingredient);
                    }
                    return ingredient;
                })
            );
        }

        if (translatedData.instructions) {
            translatedData.instructions = await Promise.all(
                translatedData.instructions.map(async (instruction) => {
                    if (typeof instruction === 'string') {
                        return await this.translateText(instruction);
                    }
                    return instruction;
                })
            );
        }

        return translatedData;
    }
}

// Initialize dynamic translator
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== DYNAMIC TRANSLATOR INITIALIZATION ===');
    try {
        window.dynamicTranslator = new DynamicTranslator();
        console.log('Dynamic translator created successfully');
        console.log('window.dynamicTranslator:', window.dynamicTranslator);
    } catch (error) {
        console.error('Error creating dynamic translator:', error);
    }
}); 