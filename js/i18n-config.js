/**
 * Shared language configuration for the cookbook (loader and recipe detail viewer).
 * Load this script before recipeLoader.js and recipeDetailViewer.min.js.
 */
window.CookbookI18n = {
    languages: ['en', 'fr', 'es'],
    languageNames: {
        en: 'English',
        fr: 'Français',
        es: 'Español'
    },
    storageKey: 'cookbook-lang',

    resolveLanguage(urlLang) {
        if (urlLang && this.languages.includes(urlLang)) {
            return urlLang;
        }
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored && this.languages.includes(stored)) {
                return stored;
            }
        } catch (e) {
            // localStorage unavailable (private browsing, etc.)
        }
        return 'en';
    },

    persistLanguage(lang) {
        if (!this.languages.includes(lang)) return;
        try {
            localStorage.setItem(this.storageKey, lang);
        } catch (e) {
            // ignore
        }
    },

    updateLanguageInUrl(lang) {
        if (!this.languages.includes(lang)) return;
        const params = new URLSearchParams(window.location.search);
        params.set('lang', lang);
        const query = params.toString();
        const newUrl = query
            ? `${window.location.pathname}?${query}`
            : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    }
};
