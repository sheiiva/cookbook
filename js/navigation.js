// Breadcrumbs functionality
function createBreadcrumbs() {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/').filter(part => part);
    
    if (pathParts.length === 0) return; // Home page
    
    const breadcrumbContainer = document.createElement('nav');
    breadcrumbContainer.className = 'breadcrumbs';
    breadcrumbContainer.setAttribute('aria-label', 'Breadcrumb navigation');
    
    let breadcrumbHTML = '<ol>';
    
    // Always add home
    breadcrumbHTML += '<li><a href="/">Home</a></li>';
    
    // Add path parts
    for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        const isLast = i === pathParts.length - 1;
        
        if (part === 'recipes') {
            breadcrumbHTML += '<li><a href="/recipes/">Recipes</a></li>';
        } else if (part.endsWith('.html')) {
            // Recipe page
            const recipeName = part.replace('.html', '').replace(/_/g, ' ');
            breadcrumbHTML += `<li><span aria-current="page">${recipeName}</span></li>`;
        } else {
            breadcrumbHTML += `<li><a href="/${pathParts.slice(0, i + 1).join('/')}/">${part}</a></li>`;
        }
    }
    
    breadcrumbHTML += '</ol>';
    breadcrumbContainer.innerHTML = breadcrumbHTML;
    
    // Insert after header
    const header = document.querySelector('header');
    if (header) {
        header.parentNode.insertBefore(breadcrumbContainer, header.nextSibling);
    }
}

// Category filters
function setupCategoryFilters() {
    const categories = {
        'all': 'All Recipes',
        'main-courses': 'Main Courses',
        'desserts': 'Desserts',
        'soups': 'Soups',
        'quick': 'Quick Recipes',
        'vegetarian': 'Vegetarian'
    };
    
    const filterContainer = document.createElement('div');
    filterContainer.className = 'category-filters';
    filterContainer.innerHTML = `
        <div class="filter-buttons">
            ${Object.entries(categories).map(([key, label]) => 
                `<button class="filter-btn ${key === 'all' ? 'active' : ''}" data-category="${key}">${label}</button>`
            ).join('')}
        </div>
    `;
    
    // Insert before main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.parentNode.insertBefore(filterContainer, mainContent);
    }
    
    // Add event listeners
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            filterRecipes(category);
            
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Enhanced recipe filtering
function filterRecipes(category = 'all') {
    // Get all recipe links
    const allRecipes = document.querySelectorAll('.recipe-list li a');
    
    allRecipes.forEach(recipeLink => {
        const recipeName = recipeLink.textContent.toLowerCase();
        const href = recipeLink.href;
        const recipeItem = recipeLink.parentElement;
        
        let showRecipe = false;
        
        switch(category) {
            case 'all':
                showRecipe = true;
                break;
            case 'main-courses':
                showRecipe = recipeName.includes('bourguignon') || 
                           recipeName.includes('moussaka') ||
                           href.includes('bourguignon') || 
                           href.includes('moussaka');
                break;
            case 'desserts':
                showRecipe = recipeName.includes('banana') || 
                           recipeName.includes('chocolate') || 
                           recipeName.includes('rice pudding') ||
                           href.includes('banana') || 
                           href.includes('chocolate') || 
                           href.includes('rice');
                break;
            case 'soups':
                showRecipe = recipeName.includes('lentils') || 
                           recipeName.includes('soup') ||
                           href.includes('lentils');
                break;
            case 'quick':
                showRecipe = recipeName.includes('banana bread') || 
                           recipeName.includes('rice pudding') ||
                           href.includes('banana') || 
                           href.includes('rice');
                break;
            case 'vegetarian':
                showRecipe = true;
                break;
        }
        
        recipeItem.style.display = showRecipe ? 'block' : 'none';
    });
    
    // Hide sections that have no visible recipes
    const recipeLists = document.querySelectorAll('.recipe-list');
    recipeLists.forEach(list => {
        const recipes = list.querySelectorAll('li');
        let hasVisibleRecipe = false;
        
        recipes.forEach(recipe => {
            if (recipe.style.display !== 'none') {
                hasVisibleRecipe = true;
            }
        });
        
        list.style.display = hasVisibleRecipe ? 'block' : 'none';
    });
}

// Enhanced search with categories
function enhancedSearch() {
    const input = document.getElementById('search-bar');
    if (!input) return;
    
    const searchTerm = input.value.toLowerCase();
    const recipeLists = document.querySelectorAll('.recipe-list');
    
    recipeLists.forEach(list => {
        const recipes = list.querySelectorAll('li');
        let hasVisibleRecipe = false;
        
        recipes.forEach(recipe => {
            const link = recipe.querySelector('a');
            const recipeName = link.textContent.toLowerCase();
            
            if (recipeName.includes(searchTerm)) {
                recipe.style.display = 'block';
                hasVisibleRecipe = true;
            } else {
                recipe.style.display = 'none';
            }
        });
        
        list.style.display = hasVisibleRecipe ? 'block' : 'none';
    });
    
    // Update active filter button
    if (searchTerm) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    }
}

// Initialize navigation features
document.addEventListener('DOMContentLoaded', function() {
    createBreadcrumbs();
    setupCategoryFilters();
    
    // Enhanced search
    const searchInput = document.getElementById('search-bar');
    if (searchInput) {
        // Remove old event listener
        searchInput.removeEventListener('keyup', searchRecipes);
        // Add new event listeners
        searchInput.addEventListener('input', enhancedSearch);
        searchInput.addEventListener('keyup', enhancedSearch);
    }
});

// Quick navigation menu
function createQuickNav() {
    const quickNav = document.createElement('div');
    quickNav.className = 'quick-nav';
    quickNav.innerHTML = `
        <button class="quick-nav-toggle" aria-label="Toggle quick navigation">
            <span></span>
            <span></span>
            <span></span>
        </button>
        <div class="quick-nav-menu">
            <a href="/">Home</a>
            <a href="#main-courses">Main Courses</a>
            <a href="#desserts">Desserts</a>
            <a href="#search">Search</a>
        </div>
    `;
    
    // Add to header
    const header = document.querySelector('header .container');
    if (header) {
        header.appendChild(quickNav);
    }
    
    // Toggle functionality
    const toggle = quickNav.querySelector('.quick-nav-toggle');
    const menu = quickNav.querySelector('.quick-nav-menu');
    
    toggle.addEventListener('click', function() {
        menu.classList.toggle('active');
        toggle.classList.toggle('active');
    });
}

// Initialize quick navigation
document.addEventListener('DOMContentLoaded', createQuickNav); 