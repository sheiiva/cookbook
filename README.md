# Cookbook

A static, multilingual recipe journal. Browse recipes by category, filter by dish type or dietary options, and switch between English, French, and Spanish.

## Run locally

The app is static HTML/CSS/JS with no build step. Use any local HTTP server so that `fetch()` can load the JSON data (opening `index.html` directly with `file://` may be blocked by the browser).

**Option 1 – Python:**
```bash
# Python 3
python3 -m http.server 8000
```
Then open http://localhost:8000

**Option 2 – Node (npx):**
```bash
npx serve .
```
Then open the URL shown in the terminal (e.g. http://localhost:3000).

**Option 3 – VS Code / Cursor:**  
Use the “Live Server” extension and “Go Live” from the status bar.

## Project structure

```
cookbook/
├── index.html              # Home: recipe list, search, filters, language switcher
├── recipe-template.html    # Recipe detail page (one template for all recipes)
├── test.html               # Dev: manual test for loading recipe JSON
├── css/
│   ├── main.css            # Layout, theme, recipe styles
│   └── button-styles.css   # Filter button focus (accessibility)
├── js/
│   ├── recipeLoader.js     # Loads data, renders list, handles filters & language
│   ├── recipeLoader.min.js
│   ├── recipeDetailViewer.min.js  # Renders a single recipe from ?id=...&lang=...
├── data/
│   ├── cookbook-data-en.json   # English UI strings + recipes
│   ├── cookbook-data-fr.json   # French
│   └── cookbook-data-es.json   # Spanish
├── images/                 # Recipe images (optional; see “Images” below)
│   └── optimized/         # WebP images used by the app (e.g. from deploy)
├── docs/
│   └── MULTILINGUAL.md     # Multilingual setup notes
└── .github/workflows/
    └── deploy.yml         # GitHub Pages deploy (e.g. image optimization)
```

Recipes are stored in the `data/cookbook-data-{en,fr,es}.json` files. Each file has the same structure: `ui` (labels, categories, filters) and `recipes` (array of recipe objects).

## How to add recipes

1. **Add the recipe in each language file**  
   Edit `data/cookbook-data-en.json`, `data/cookbook-data-fr.json`, and `data/cookbook-data-es.json`. Use the **same `id`** in all three so links and the detail page work.

2. **Recipe object shape**  
   Each recipe in the `recipes` array should look like this (minimal):

   ```json
   {
     "id": "my_recipe",
     "title": "My Recipe Name",
     "image": "optimized/my_recipe.webp",
     "description": "Short description.",
     "tags": ["main_courses", "vegan"],
     "ingredients": ["Ingredient 1", "Ingredient 2"],
     "instructions": ["Step 1.", "Step 2."]
   }
   ```

   - **id** – Unique slug (used in URLs, e.g. `recipe-template.html?id=my_recipe&lang=en`).
   - **tags** – At least one category from `ui.categories` (e.g. `main_courses`, `desserts`, `soups`) and optionally dietary tags from `ui.dietary_filters` (`vegan`, `gluten_free`).
   - **image** – Path under `images/` (e.g. `optimized/my_recipe.webp`). The deploy workflow can generate `images/optimized/` from source images in `images/`.

   For multi-part recipes (e.g. sauce + main), you can use:

   - **ingredient_sections** – `{ "Section name": ["ingredient1", "ingredient2"] }`
   - **instruction_blocks** – `{ "Block title": { "title": "Block title", "steps": ["Step 1.", "Step 2."] } }`

3. **Images**  
   Put source images in `images/` (e.g. `images/my_recipe.jpg`). The GitHub Actions deploy can convert them to `images/optimized/*.webp`. For local dev, you can put a `.webp` (or other image) in `images/optimized/` and set `"image": "optimized/my_recipe.webp"` in the JSON.

## License

See [LICENSE](LICENSE).
