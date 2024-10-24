function searchRecipes() {
    const input = document.getElementById('search-bar').value.toLowerCase();
    
    // Get both recipe lists and section divs
    const mainCoursesList = document.getElementById('main-courses-list').getElementsByTagName('li');
    const dessertsList = document.getElementById('dessert-list').getElementsByTagName('li');
    
    // Get section containers (divs) that hold the recipes and headers
    const mainCoursesDiv = document.querySelector('#main-courses-list').parentElement;
    const dessertsDiv = document.querySelector('#dessert-list').parentElement;

    // Function to filter and display relevant section
    function filterRecipes(list, sectionDiv) {
        let hasVisibleRecipe = false;

        Array.from(list).forEach((recipe) => {
            const recipeName = recipe.textContent.toLowerCase();
            if (recipeName.includes(input)) {
                recipe.style.display = '';
                hasVisibleRecipe = true;
            } else {
                recipe.style.display = 'none';
            }
        });

        // Show or hide the entire section (div) based on whether any recipes are visible
        sectionDiv.style.display = hasVisibleRecipe ? '' : 'none';
    }

    // Apply filtering to both sections
    filterRecipes(mainCoursesList, mainCoursesDiv);
    filterRecipes(dessertsList, dessertsDiv);
}
