class RecipeDetailViewer {
    constructor() {
        const urlLang = new URLSearchParams(window.location.search).get('lang');
        this.currentLanguage = (window.CookbookI18n && window.CookbookI18n.resolveLanguage(urlLang)) || 'en';
        this.recipesData = null;
        this.common = window.CookbookCommon;
    }

    updateURL() {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('lang', this.currentLanguage);
        const newURL = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, '', newURL);
    }

    async init() {
        try {
            this.common.persistLanguage(this.currentLanguage);
            await this.loadRecipesForLanguage(this.currentLanguage);
            this.updateBackToHomeLink();
            this.common.updateLanguageButton(this.currentLanguage);
            this.setupLanguageToggle();
            this.common.setDocumentLang(this.currentLanguage);
            this.displayRecipe();
        } catch (error) {
            console.error('Recipe viewer init failed:', error);
            const detail = error && error.message ? error.message : 'Failed to load recipe data.';
            this.showError(detail + ' Run the server from the cookbook folder: cd cookbook && python3 -m http.server 8000, then open http://localhost:8000');
        }
    }

    updateBackToHomeLink() {
        const backLink = document.getElementById('back-to-home');
        if (backLink) {
            backLink.href = `index.html?lang=${this.currentLanguage}`;
        }
    }

    updateMetaAndOg(recipe, siteName) {
        const desc = (recipe.description || recipe.title || '').slice(0, 160);
        const title = `${recipe.title} · ${siteName}`;
        const url = window.location.href;
        const safeImage = this.common.safeImageSrc(recipe.image);
        const imageUrl = safeImage
            ? `${window.location.origin}${this.common.getPathPrefix()}images/${safeImage}`
            : '';

        const setMeta = (attr, key, value) => {
            if (!value) return;
            let el = document.querySelector(`meta[${attr}="${key}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, key);
                document.head.appendChild(el);
            }
            el.setAttribute('content', value);
        };

        setMeta('name', 'description', desc);
        setMeta('property', 'og:title', title);
        setMeta('property', 'og:description', desc);
        setMeta('property', 'og:type', 'article');
        setMeta('property', 'og:url', url);
        if (imageUrl) setMeta('property', 'og:image', imageUrl);
    }

    renderBreadcrumb(recipeTitle) {
        const el = document.getElementById('recipe-breadcrumb');
        if (!el || !this.recipesData || !this.recipesData.navigation) return;
        const home = this.common.escapeHtml(this.recipesData.navigation.home || 'Home');
        const sep = this.common.escapeHtml((this.recipesData.navigation.breadcrumbs && this.recipesData.navigation.breadcrumbs.separator) || '›');
        const current = this.common.escapeHtml(recipeTitle || '');
        const homeUrl = `index.html?lang=${encodeURIComponent(this.currentLanguage)}`;
        el.innerHTML = `<a href="${homeUrl}">${home}</a><span class="breadcrumb-sep">${sep}</span><span class="breadcrumb-current">${current}</span>`;
    }

    async loadRecipesForLanguage(lang) {
        this.recipesData = await this.common.loadCookbookData(lang);
    }

    setupLanguageToggle() {
        this.common.setupLanguageMenu({
            getLanguage: () => this.currentLanguage,
            setLanguage: (lang) => { this.currentLanguage = lang; },
            onLanguageChange: async () => {
                await this.loadRecipesForLanguage(this.currentLanguage);
                this.common.persistLanguage(this.currentLanguage);
                this.updateBackToHomeLink();
                this.common.setDocumentLang(this.currentLanguage);
                this.displayRecipe();
                this.updateURL();
            }
        });
    }

    renderRecipeImage(safeImage, safeTitle) {
        if (!safeImage) return '';
        return `<img src="images/${safeImage}" alt="${safeTitle}" class="recipe-image" loading="lazy">`;
    }

    attachRecipeImageFallback(container) {
        const img = container.querySelector('.recipe-image');
        if (!img) return;
        img.addEventListener('error', () => img.remove(), { once: true });
    }

    displayRecipe() {
        const urlParams = new URLSearchParams(window.location.search);
        const recipeId = urlParams.get('id');

        if (!recipeId || !this.recipesData) {
            this.showError('Recipe not found');
            return;
        }

        const recipe = this.recipesData.recipes.find(r => r.id === recipeId);

        if (!recipe) {
            this.showError('Recipe not found');
            return;
        }

        const safeTitle = this.common.escapeHtml(recipe.title);
        const safeImage = this.common.safeImageSrc(recipe.image);
        const siteName = (this.recipesData.ui && this.recipesData.ui.title) ? this.recipesData.ui.title : 'My Recipe Journal';

        document.title = `${recipe.title} · ${siteName}`;

        this.updateMetaAndOg(recipe, siteName);
        this.common.injectRecipeJsonLd(recipe, { lang: this.currentLanguage });

        const titleElement = document.querySelector('h1[data-i18n="my_recipe_journal"]');
        if (titleElement) titleElement.textContent = recipe.title;

        this.renderBreadcrumb(recipe.title);

        const labels = (this.recipesData.ui && this.recipesData.ui.recipe_labels) ? this.recipesData.ui.recipe_labels : {};
        const ingredientsLabel = this.common.escapeHtml(labels.ingredients || 'Ingredients');
        const instructionsLabel = this.common.escapeHtml(labels.instructions || 'Instructions');
        const tipsLabel = this.common.escapeHtml(labels.tips || 'Tips');
        const recipeContent = document.getElementById('recipe-content');
        const imageHtml = this.renderRecipeImage(safeImage, safeTitle);
        const headerClass = imageHtml ? 'recipe-header' : 'recipe-header recipe-header--no-image';
        const metaHtml = this.renderMeta(recipe);
        const tipsHtml = this.renderTips(recipe, tipsLabel);
        recipeContent.innerHTML = `
            <div class="${headerClass}">
                <div class="recipe-info">
                    ${imageHtml}
                    ${metaHtml}
                    <p class="recipe-description">${this.common.escapeHtml(recipe.description)}</p>
                </div>
                <div class="recipe-ingredients-header">
                    <h3>${ingredientsLabel}</h3>
                    ${this.renderIngredients(recipe)}
                </div>
            </div>
            <div class="recipe-section recipe-instructions">
                <h2>${instructionsLabel}</h2>
                ${this.renderInstructions(recipe)}
            </div>
            ${tipsHtml}
        `;
        this.attachRecipeImageFallback(recipeContent);
    }

    renderMeta(recipe) {
        const parts = [];
        if (recipe.servings) parts.push(recipe.servings);
        if (recipe.prep_time) parts.push(recipe.prep_time);
        if (recipe.cook_time) parts.push(recipe.cook_time);
        if (parts.length === 0) return '';
        return `<p class="recipe-meta">${parts.map((p) => this.common.escapeHtml(p)).join(' · ')}</p>`;
    }

    renderTips(recipe, tipsLabel) {
        if (!recipe.tips || recipe.tips.length === 0) return '';
        return `
            <div class="recipe-section recipe-tips">
                <h2>${tipsLabel}</h2>
                <ul>
                    ${recipe.tips.map((tip) => `<li>${this.common.escapeHtml(tip)}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    renderInstructions(recipe) {
        if (recipe.instruction_blocks) {
            let html = '';
            for (const [, block] of Object.entries(recipe.instruction_blocks)) {
                html += `
                    <div class="instruction-block">
                        <h3>${this.common.escapeHtml(block.title)}</h3>
                        <ol>
                            ${(block.steps || []).map(step => `<li>${this.common.escapeHtml(step)}</li>`).join('')}
                        </ol>
                    </div>
                `;
            }
            return html;
        }
        if (recipe.instructions) {
            return `
                <ol>
                    ${recipe.instructions.map(instruction => `<li>${this.common.escapeHtml(instruction)}</li>`).join('')}
                </ol>
            `;
        }
        return '<p>No instructions available.</p>';
    }

    renderIngredients(recipe) {
        let html = '';
        if (recipe.ingredients && recipe.ingredients.length > 0) {
            html += '<ul>';
            html += recipe.ingredients.map(ingredient => `<li>${this.common.escapeHtml(ingredient)}</li>`).join('');
            html += '</ul>';
        }
        if (recipe.ingredient_sections) {
            for (const [sectionName, ingredients] of Object.entries(recipe.ingredient_sections)) {
                const safeName = this.common.escapeHtml(sectionName.charAt(0).toUpperCase() + sectionName.slice(1));
                html += `
                    <div class="ingredient-section">
                        <h4>${safeName}</h4>
                        <ul>
                            ${(ingredients || []).map(ingredient => `<li>${this.common.escapeHtml(ingredient)}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
        }
        return html || '<p>No ingredients available.</p>';
    }

    showError(message) {
        const breadcrumbEl = document.getElementById('recipe-breadcrumb');
        if (breadcrumbEl) breadcrumbEl.innerHTML = '';
        const recipeContent = document.getElementById('recipe-content');
        const homeUrl = `index.html?lang=${encodeURIComponent(this.currentLanguage)}`;
        recipeContent.innerHTML = `
            <div class="error">
                <h2>Error</h2>
                <p>${this.common.escapeHtml(message)}</p>
                <a href="${homeUrl}">← Back to Home</a>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const recipeViewer = new RecipeDetailViewer();
    recipeViewer.init();
});
