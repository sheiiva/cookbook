# Cookbook

A static, multilingual recipe journal. Browse recipes by category, filter by dish type or dietary options, and switch between English, French, and Spanish.

## Run locally

The app is static HTML/CSS/JS with no build step. **Run the server from the cookbook directory** (so the site is served at the root). If you run from a parent folder (e.g. workspace root), the app will still work as long as you open the URL that includes `/cookbook/` (e.g. `http://127.0.0.1:5500/cookbook/`); the recipe page detects the base path and loads data from the correct location.

**Option 1 – Python (from cookbook folder):**
```bash
cd cookbook
python3 -m http.server 8000
```
Then open http://localhost:8000

**Option 2 – Node (from cookbook folder):**
```bash
cd cookbook
npx serve .
```
Then open the URL shown in the terminal (e.g. http://localhost:3000).

**Option 3 – VS Code / Cursor:**  
Use the “Live Server” extension. Right‑click `index.html` (inside the cookbook folder) and “Open with Live Server”, or set your workspace root to the **cookbook** folder before starting Live Server so the site is at the root (e.g. http://127.0.0.1:5500/). If Live Server runs from a parent folder, open http://127.0.0.1:5500/cookbook/ so data and assets load correctly.

## Project structure

```
cookbook/
├── index.html              # Home: recipe list, search, filters, language switcher
├── recipe-template.html    # Recipe detail page (one template for all recipes)
├── test.html               # Dev only: manual test for JSON loading (not deployed)
├── css/
│   ├── main.css            # Layout, theme, recipe styles
│   └── button-styles.css   # Filter button focus (accessibility)
├── js/
│   ├── recipeLoader.js     # **Source** for index (edit this); deploy builds .min
│   ├── recipeLoader.min.js # Built from recipeLoader.js on deploy (index loads this)
│   ├── recipeDetailViewer.js      # **Source** for recipe detail page (edit this)
│   ├── recipeDetailViewer.min.js  # Built from recipeDetailViewer.js on deploy (recipe-template loads this)
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

**Dev / test page:** `test.html` is a small manual test that fetches `data/cookbook-data-en.json` and lists recipe titles. Use it locally to verify data loads (e.g. when serving from a subpath). It is **excluded from the GitHub Pages deploy** so it is not published.

Recipes are stored in the `data/cookbook-data-{en,fr,es}.json` files. Each file has the same structure: `ui` (labels, categories, filters) and `recipes` (array of recipe objects).

## How to add recipes

1. **Edit source files** in `data/source/` (`recipes.json`, `ui.json`, `navigation.json`), then run:

   ```bash
   node scripts/build-data.js
   ```

   This regenerates `data/cookbook-data-{en,fr,es}.json`. Commit both source and generated files.

2. **Or add the recipe in each language file**  
   Edit `data/cookbook-data-en.json`, `data/cookbook-data-fr.json`, and `data/cookbook-data-es.json`. Use the **same `id`** in all three so links and the detail page work. Prefer editing `data/source/recipes.json` when possible.

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

## Deploy (GitHub Pages)

- The workflow (`.github/workflows/deploy.yml`) runs on push to `main` and deploys the site to GitHub Pages.
- **Images:** Source images must live in **`images/`** as `.jpg` or `.png`. The workflow creates `images/optimized/` and converts them to WebP. If `images/` is missing or has no images, the site still deploys but recipe images will be missing until you add source files and redeploy.
- The workflow builds `recipeDetailViewer.min.js` and `recipeLoader.min.js` from their sources and checks that `data/cookbook-data-{en,fr,es}.json` exist.

## Recipe detail viewer (recipe-template.html)

- **Source:** Edit `js/recipeDetailViewer.js`. The recipe detail page loads `js/recipeDetailViewer.min.js`.
- **Build:** On deploy, the workflow runs `npx terser js/recipeDetailViewer.js -o js/recipeDetailViewer.min.js` so the min file is always built from the current source.
- **Local:** After editing `recipeDetailViewer.js`, rebuild the min for local testing with:  
  `npx terser js/recipeDetailViewer.js -o js/recipeDetailViewer.min.js -c -m`

**Recipe loader (index):** Edit `js/recipeLoader.js`. The index loads `recipeLoader.min.js`; rebuild with  
`npx terser js/recipeLoader.js -o js/recipeLoader.min.js -c -m` for local testing.

## License

See [LICENSE](LICENSE).
