/**
 * Shared helpers for cookbook loader and recipe detail viewer.
 */
window.CookbookCommon = {
    getPathPrefix() {
        const dir = window.location.pathname.replace(/\/[^/]*$/, '') || '';
        return dir ? dir + '/' : '/';
    },

    async loadCookbookData(lang) {
        const filename = `data/cookbook-data-${lang}.json`;
        const absoluteUrl = window.location.origin + this.getPathPrefix() + filename;
        let response = await fetch(absoluteUrl);
        if (!response.ok) {
            response = await fetch(filename);
        }
        if (!response.ok) {
            throw new Error(`Could not load data (tried ${absoluteUrl}): ${response.status} ${response.statusText}`);
        }
        return response.json();
    },

    escapeHtml(str) {
        if (str == null) return '';
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    },

    safeImageSrc(path) {
        if (path == null || typeof path !== 'string') return '';
        const t = path.trim();
        if (/^\s*$/.test(t)) return '';
        if (/^(javascript|data|vbscript):/i.test(t)) return '';
        if (/^\/\//.test(t)) return '';
        return t;
    },

    setDocumentLang(lang) {
        document.documentElement.lang = lang || 'en';
    },

    updateLanguageButton(currentLanguage) {
        const languageNames = (window.CookbookI18n && window.CookbookI18n.languageNames)
            || { en: 'English', fr: 'Français', es: 'Español' };
        const currentLangSpan = document.querySelector('.current-lang');
        if (currentLangSpan) {
            currentLangSpan.textContent = languageNames[currentLanguage] || currentLanguage;
        }
    },

    persistLanguage(lang, options = {}) {
        if (!window.CookbookI18n) return;
        window.CookbookI18n.persistLanguage(lang);
        if (options.updateUrl) {
            window.CookbookI18n.updateLanguageInUrl(lang);
        }
    },

    recipeSearchText(recipe) {
        const parts = [recipe.title, recipe.description];
        if (recipe.ingredients) parts.push(...recipe.ingredients);
        if (recipe.ingredient_sections) {
            for (const section of Object.values(recipe.ingredient_sections)) {
                parts.push(...section);
            }
        }
        if (recipe.instructions) parts.push(...recipe.instructions);
        if (recipe.instruction_blocks) {
            for (const block of Object.values(recipe.instruction_blocks)) {
                if (block.title) parts.push(block.title);
                if (block.steps) parts.push(...block.steps);
            }
        }
        if (recipe.tips) parts.push(...recipe.tips);
        return parts.filter(Boolean).join(' ').toLowerCase();
    },

    setupLanguageMenu(context) {
        const { languageNames, languages } = window.CookbookI18n
            || { languageNames: { en: 'English', fr: 'Français', es: 'Español' }, languages: ['en', 'fr', 'es'] };
        const menu = document.getElementById('language-menu');
        const languageToggle = document.getElementById('language-toggle');

        if (menu) {
            menu.innerHTML = '';
            languages.forEach((code) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.textContent = languageNames[code];
                btn.setAttribute('data-lang', code);
                if (code === context.getLanguage()) btn.classList.add('active-lang');
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const lang = btn.getAttribute('data-lang');
                    if (lang === context.getLanguage()) {
                        menu.classList.remove('open');
                        return;
                    }
                    context.setLanguage(lang);
                    menu.querySelectorAll('button').forEach((b) => b.classList.remove('active-lang'));
                    btn.classList.add('active-lang');
                    this.updateLanguageButton(lang);
                    menu.classList.remove('open');
                    try {
                        await context.onLanguageChange(lang);
                    } catch (error) {
                        if (context.onLanguageError) {
                            context.onLanguageError(error);
                        } else {
                            console.error('Language change failed:', error);
                        }
                    }
                });
                menu.appendChild(btn);
            });
        }

        if (languageToggle) {
            languageToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                menu?.classList.toggle('open');
            });
        }

        document.addEventListener('click', () => menu?.classList.remove('open'));
    }
};
