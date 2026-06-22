// Recipe Loader - Dynamically loads recipes from JSON database
class RecipeLoader {
    constructor() {
        this.recipesData = null;
        this.dietaryFilterState = {
            vegan: false,
            gluten_free: false
        };
        this.currentDishType = 'all';
        const urlLang = new URLSearchParams(window.location.search).get('lang');
        this.currentLanguage = (window.CookbookI18n && window.CookbookI18n.resolveLanguage(urlLang)) || 'en';
        this.currentSearchTerm = '';
        this.common = window.CookbookCommon;
    }

    async init() {
        try {
            this.common.persistLanguage(this.currentLanguage, { updateUrl: true });
            await this.loadRecipesForLanguage(this.currentLanguage);
            this.setupLanguageToggle();
            this.common.updateLanguageButton(this.currentLanguage);
            this.renderRecipes();
            this.common.setDocumentLang(this.currentLanguage);
        } catch (error) {
            this.renderFallback();
        }
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
                this.common.persistLanguage(this.currentLanguage, { updateUrl: true });
                this.renderRecipes();
                this.common.setDocumentLang(this.currentLanguage);
            },
            onLanguageError: () => this.showLanguageError()
        });
    }

    showLanguageError() {
        const existing = document.getElementById('language-error-toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.id = 'language-error-toast';
        toast.className = 'language-error-toast';
        toast.setAttribute('role', 'alert');
        toast.textContent = 'Could not switch language. Try again.';
        const switcher = document.querySelector('.language-switcher');
        if (switcher) {
            switcher.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    }

    updatePageText() {
        const titleElement = document.querySelector('h1[data-i18n="my_recipe_journal"]');
        if (titleElement && this.recipesData.ui.title) {
            titleElement.textContent = this.recipesData.ui.title;
        }

        const searchInput = document.getElementById('search-bar');
        if (searchInput && this.recipesData.ui.search_placeholder) {
            searchInput.placeholder = this.recipesData.ui.search_placeholder;
        }
    }

    buildFilterBar() {
        const container = document.getElementById('filter-content');
        if (!container || !this.recipesData?.ui) return;
        const { section_headers, categories, dietary_filters } = this.recipesData.ui;

        container.innerHTML = '';

        const dishSection = document.createElement('div');
        dishSection.className = 'filter-section';
        const dishH3 = document.createElement('h3');
        dishH3.setAttribute('data-i18n', 'dish_types');
        dishH3.textContent = section_headers?.dish_types || 'Dish Types';
        dishSection.appendChild(dishH3);
        const dishBtns = document.createElement('div');
        dishBtns.className = 'filter-buttons';
        Object.entries(categories || {}).forEach(([id, label]) => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.setAttribute('data-filter', id);
            btn.setAttribute('data-type', 'dish');
            btn.textContent = label;
            dishBtns.appendChild(btn);
        });
        dishSection.appendChild(dishBtns);
        container.appendChild(dishSection);

        const dietarySection = document.createElement('div');
        dietarySection.className = 'filter-section';
        const dietaryH3 = document.createElement('h3');
        dietaryH3.setAttribute('data-i18n', 'dietary_options');
        dietaryH3.textContent = section_headers?.dietary_options || 'Dietary Options';
        dietarySection.appendChild(dietaryH3);
        const dietaryBtns = document.createElement('div');
        dietaryBtns.className = 'filter-buttons';
        Object.entries(dietary_filters || {}).forEach(([id, label]) => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.setAttribute('data-filter', id);
            btn.textContent = label;
            dietaryBtns.appendChild(btn);
        });
        dietarySection.appendChild(dietaryBtns);
        container.appendChild(dietarySection);
    }

    renderRecipes() {
        if (!this.recipesData) return;

        this.buildFilterBar();
        this.updatePageText();

        const filterBar = document.querySelector('.filter-bar');
        const header = document.querySelector('header');
        let startElement = filterBar || header;

        let nextElement = startElement.nextElementSibling;
        while (nextElement && !nextElement.classList.contains('filter-bar')) {
            const toRemove = nextElement;
            nextElement = nextElement.nextElementSibling;
            toRemove.remove();
        }

        const recipesContainer = document.createElement('div');
        recipesContainer.className = 'recipes-container';

        const insertAfter = filterBar || header;
        insertAfter.after(recipesContainer);

        const recipesByCategory = {};

        this.recipesData.recipes.forEach(recipe => {
            if (recipe.tags) {
                recipe.tags.forEach(tag => {
                    if (!recipesByCategory[tag]) {
                        recipesByCategory[tag] = [];
                    }
                    recipesByCategory[tag].push(recipe);
                });
            }
        });

        Object.entries(this.recipesData.ui.categories).forEach(([categoryId, categoryName]) => {
            const recipesInCategory = recipesByCategory[categoryId] || [];
            if (recipesInCategory.length === 0) {
                return;
            }

            const recipeBlock = document.createElement('div');
            recipeBlock.className = 'recipe-block';
            recipeBlock.id = `${categoryId}-block`;

            const title = document.createElement('h2');
            title.textContent = categoryName;
            recipeBlock.appendChild(title);

            const ul = document.createElement('ul');
            ul.id = `${categoryId}-list`;

            recipesInCategory.forEach(recipe => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `recipe-template.html?id=${recipe.id}&lang=${this.currentLanguage}`;
                a.textContent = recipe.title;
                a.setAttribute('data-category', categoryId);
                a.setAttribute('data-recipe-id', recipe.id);
                li.appendChild(a);
                ul.appendChild(li);
            });

            recipeBlock.appendChild(ul);
            recipesContainer.appendChild(recipeBlock);
        });

        this.setupFilterListeners();
        const allBtn = document.querySelector('.filter-btn[data-filter="all"][data-type="dish"]');
        if (allBtn) allBtn.classList.add('active');
    }

    setupFilterListeners() {
        const filterButtons = document.querySelectorAll('.filter-btn');

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterType = btn.getAttribute('data-filter');
                const buttonType = btn.getAttribute('data-type');

                if (filterType === 'all' && buttonType === 'dish') {
                    document.querySelectorAll('.filter-btn[data-type="dish"]').forEach(dishBtn => {
                        dishBtn.classList.remove('active');
                    });
                    btn.classList.add('active');
                } else if (buttonType === 'dish') {
                    document.querySelector('.filter-btn[data-filter="all"]').classList.remove('active');
                    btn.classList.toggle('active');
                } else {
                    btn.classList.toggle('active');
                }

                this.applyFilters();
            });
        });

        const searchBar = document.getElementById('search-bar');
        if (searchBar) {
            searchBar.addEventListener('input', (e) => {
                this.currentSearchTerm = e.target.value.toLowerCase().trim();
                this.applyFilters();
            });
        }
    }

    applyFilters() {
        const allActiveFilters = Array.from(document.querySelectorAll('.filter-btn.active'));
        const activeDishFilters = allActiveFilters
            .filter(btn => btn.getAttribute('data-type') === 'dish' && btn.getAttribute('data-filter') !== 'all')
            .map(btn => btn.getAttribute('data-filter'));
        const activeDietaryFilters = allActiveFilters
            .filter(btn => btn.getAttribute('data-type') !== 'dish')
            .map(btn => btn.getAttribute('data-filter'));
        const showAllDishes = allActiveFilters.some(btn => btn.getAttribute('data-filter') === 'all');

        const recipeLinks = document.querySelectorAll('a[data-recipe-id]');
        const sectionVisibility = {};

        recipeLinks.forEach(link => {
            const recipeId = link.getAttribute('data-recipe-id');
            const recipe = this.recipesData.recipes.find(r => r.id === recipeId);
            const parentLi = link.parentElement;
            const parentBlock = parentLi.closest('.recipe-block');
            const sectionId = parentBlock ? parentBlock.id : null;

            if (recipe && recipe.tags) {
                let shouldShow = true;

                if (this.currentSearchTerm) {
                    const searchText = this.common.recipeSearchText(recipe);
                    shouldShow = searchText.includes(this.currentSearchTerm);
                }

                if (shouldShow && !showAllDishes && activeDishFilters.length > 0) {
                    shouldShow = activeDishFilters.some(filter => recipe.tags.includes(filter));
                }

                if (shouldShow && activeDietaryFilters.length > 0) {
                    shouldShow = activeDietaryFilters.every(filter => recipe.tags.includes(filter));
                }

                parentLi.classList.toggle('recipe-item-filtered-out', !shouldShow);

                if (sectionId) {
                    if (!sectionVisibility[sectionId]) sectionVisibility[sectionId] = false;
                    if (shouldShow) sectionVisibility[sectionId] = true;
                }
            }
        });

        Object.entries(sectionVisibility).forEach(([sectionId, hasVisibleRecipes]) => {
            const section = document.getElementById(sectionId);
            if (section) section.classList.toggle('recipe-block-hidden', !hasVisibleRecipes);
        });
    }

    renderFallback() {
        const header = document.querySelector('header');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'recipe-block';
        errorDiv.innerHTML = `
            <h2>Recipe Loading Error</h2>
            <p>Unable to load recipes. Please check your internet connection and try again.</p>
        `;
        header.after(errorDiv);
    }
}
