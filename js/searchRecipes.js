function searchRecipes() {
    const input = document.getElementById('search-bar').value.toLowerCase();
    const recipes = document.getElementById('recipe-list').getElementsByTagName('li');

    Array.from(recipes).forEach((recipe) => {
        const recipeName = recipe.textContent.toLowerCase();
        if (recipeName.includes(input)) {
            recipe.style.display = '';
        } else {
            recipe.style.display = 'none';
        }
    });
}
