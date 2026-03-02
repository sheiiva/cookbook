// Recipe Loader - Dynamically loads recipes from JSON database
class RecipeLoader {
    constructor() {
        this.recipesData = null;
        this.dietaryFilterState = {
            vegan: false,
            gluten_free: false
        };
        this.currentDishType = 'all';
        this.currentLanguage = 'en';
        this.currentSearchTerm = '';
    }

    async init() {
        try {
            await this.loadRecipesForLanguage(this.currentLanguage);
            this.setupLanguageToggle();
            this.renderRecipes();
            this.setDocumentLang(this.currentLanguage);
        } catch (error) {
            this.renderFallback();
        }
    }

    async loadRecipesForLanguage(lang) {
        const filename = `data/cookbook-data-${lang}.json`;
        const response = await fetch(filename);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        this.recipesData = await response.json();
    }

    setupLanguageToggle() {
        const { languageNames, languages } = window.CookbookI18n || { languageNames: { en: 'English', fr: 'Français', es: 'Español' }, languages: ['en', 'fr', 'es'] };
        const menu = document.getElementById('language-menu');
        const languageToggle = document.getElementById('language-toggle');

        if (menu) {
            languages.forEach(code => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.textContent = languageNames[code];
                btn.setAttribute('data-lang', code);
                if (code === this.currentLanguage) btn.classList.add('active-lang');
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const lang = btn.getAttribute('data-lang');
                    if (lang === this.currentLanguage) { menu.classList.remove('open'); return; }
                    this.currentLanguage = lang;
                    menu.querySelectorAll('button').forEach(b => b.classList.remove('active-lang'));
                    btn.classList.add('active-lang');
                    const currentLangSpan = languageToggle?.querySelector('.current-lang');
                    if (currentLangSpan) currentLangSpan.textContent = languageNames[lang];
                    menu.classList.remove('open');
                    try {
                        await this.loadRecipesForLanguage(this.currentLanguage);
                        this.renderRecipes();
                        this.setDocumentLang(this.currentLanguage);
                    } catch (error) {
                        console.error('Language change failed:', error);
                        this.showLanguageError();
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

    setDocumentLang(lang) {
        document.documentElement.lang = lang || 'en';
    }

    showLanguageError() {
        const existing = document.getElementById('language-error-toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.id = 'language-error-toast';
        toast.setAttribute('role', 'alert');
        toast.textContent = 'Could not switch language. Try again.';
        toast.style.cssText = 'position:absolute;top:100%;right:0;margin-top:0.25rem;padding:0.5rem 0.75rem;background:#fef2f2;color:#991b1b;border-radius:8px;font-size:0.875rem;white-space:nowrap;z-index:20;';
        const switcher = document.querySelector('.language-switcher');
        if (switcher) {
            switcher.style.position = 'relative';
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
        
        // Update filter section headers
        const dishTypesHeader = document.querySelector('h3[data-i18n="dish_types"]');
        if (dishTypesHeader && this.recipesData.ui.section_headers.dish_types) {
            dishTypesHeader.textContent = this.recipesData.ui.section_headers.dish_types;
        }
        
        const dietaryOptionsHeader = document.querySelector('h3[data-i18n="dietary_options"]');
        if (dietaryOptionsHeader && this.recipesData.ui.section_headers.dietary_options) {
            dietaryOptionsHeader.textContent = this.recipesData.ui.section_headers.dietary_options;
        }
        
        // Update filter button texts
        Object.entries(this.recipesData.ui.categories).forEach(([categoryId, categoryName]) => {
            const button = document.querySelector(`.filter-btn[data-filter="${categoryId}"]`);
            if (button) {
                button.textContent = categoryName;
            }
        });
        
        Object.entries(this.recipesData.ui.dietary_filters).forEach(([filterId, filterName]) => {
            const button = document.querySelector(`.filter-btn[data-filter="${filterId}"]`);
            if (button) {
                button.textContent = filterName;
            }
        });
    }

    renderRecipes() {
        if (!this.recipesData) {
            return;
        }

        this.updatePageText();

        // Clear existing content after filter bar
        const filterBar = document.querySelector('.filter-bar');
        const header = document.querySelector('header');
        let startElement = filterBar || header;
        
        let nextElement = startElement.nextElementSibling;
        while (nextElement && !nextElement.classList.contains('filter-bar')) {
            const toRemove = nextElement;
            nextElement = nextElement.nextElementSibling;
            toRemove.remove();
        }

        // Create recipes container
        const recipesContainer = document.createElement('div');
        recipesContainer.className = 'recipes-container';
        recipesContainer.style.maxWidth = '1200px';
        recipesContainer.style.margin = '2rem auto';
        recipesContainer.style.padding = '0 2rem';

        // Add recipes container after filter bar
        const insertAfter = filterBar || header;
        insertAfter.after(recipesContainer);

        // Group recipes by tags
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

        // Render each category
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
            title.style.color = '#374151';
            title.style.marginBottom = '1rem';
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

        // Add filter event listeners and set "All" as active by default
        this.setupFilterListeners();
        const allBtn = document.querySelector('.filter-btn[data-filter="all"][data-type="dish"]');
        if (allBtn) allBtn.classList.add('active');
    }

    setupFilterListeners() {
        // Filter button listeners
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterType = btn.getAttribute('data-filter');
                const buttonType = btn.getAttribute('data-type');
                
                if (filterType === 'all' && buttonType === 'dish') {
                    // Clear all dish type filters
                    document.querySelectorAll('.filter-btn[data-type="dish"]').forEach(dishBtn => {
                        dishBtn.classList.remove('active');
                    });
                    // Activate the "All" button
                    btn.classList.add('active');
                } else if (buttonType === 'dish') {
                    // If clicking a specific dish type, deactivate "All" button
                    document.querySelector('.filter-btn[data-filter="all"]').classList.remove('active');
                    btn.classList.toggle('active');
                } else {
                    // For dietary filters, just toggle
                    btn.classList.toggle('active');
                }
                
                this.applyFilters();
            });
        });

        // Search bar listener
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
        
        // Track which sections have visible recipes
        const sectionVisibility = {};
        
        recipeLinks.forEach(link => {
            const recipeId = link.getAttribute('data-recipe-id');
            const recipe = this.recipesData.recipes.find(r => r.id === recipeId);
            const parentLi = link.parentElement;
            const parentBlock = parentLi.closest('.recipe-block');
            const sectionId = parentBlock ? parentBlock.id : null;
            
            if (recipe && recipe.tags) {
                let shouldShow = true;
                
                // Check search term (only recipe title/name)
                if (this.currentSearchTerm) {
                    const titleMatch = recipe.title.toLowerCase().includes(this.currentSearchTerm);
                    shouldShow = titleMatch;
                }
                
                // Check dish type filters
                if (shouldShow && !showAllDishes && activeDishFilters.length > 0) {
                    shouldShow = activeDishFilters.some(filter => recipe.tags.includes(filter));
                }
                
                // Check dietary filters (AND logic - must match ALL selected filters)
                if (shouldShow && activeDietaryFilters.length > 0) {
                    shouldShow = activeDietaryFilters.every(filter => recipe.tags.includes(filter));
                }
                
                // Show/hide the entire li element
                parentLi.style.display = shouldShow ? 'list-item' : 'none';
                
                // Track section visibility
                if (sectionId) {
                    if (!sectionVisibility[sectionId]) {
                        sectionVisibility[sectionId] = false;
                    }
                    if (shouldShow) {
                        sectionVisibility[sectionId] = true;
                    }
                }
            }
        });
        
        // Show/hide entire sections based on visibility
        Object.entries(sectionVisibility).forEach(([sectionId, hasVisibleRecipes]) => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = hasVisibleRecipes ? 'block' : 'none';
            }
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