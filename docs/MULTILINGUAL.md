# Multilingual Cookbook (JSON-based)

## Overview

The cookbook uses **3 languages** (English, French, Spanish) with **one JSON file per language**. There is no translation API: each language has its own `data/cookbook-data-{en,fr,es}.json` with full UI strings and recipes. The app loads the file for the current language and renders from it.

- **Language switching** – Header button cycles EN → FR → ES (see `recipeLoader.js`, `recipeDetailViewer.min.js`).
- **No runtime translation** – All text is pre-written in the JSON files.
- **Same structure in every file** – Each JSON has `ui` (labels, categories, filters) and `recipes` (array of recipe objects).

## Supported languages

| Code | Language  |
|------|-----------|
| `en` | English   |
| `fr` | Français  |
| `es` | Español   |

## File structure (actual)

```
cookbook/
├── index.html
├── recipe-template.html
├── js/
│   ├── recipeLoader.js       # Loads cookbook-data-{lang}.json, renders list, filters, language toggle
│   ├── recipeLoader.min.js
│   ├── recipeDetailViewer.min.js   # Loads cookbook-data-{lang}.json, renders one recipe from ?id=&lang=
├── data/
│   ├── cookbook-data-en.json   # English UI + recipes
│   ├── cookbook-data-fr.json   # French UI + recipes
│   └── cookbook-data-es.json   # Spanish UI + recipes
└── docs/
    └── MULTILINGUAL.md
```

All translatable content lives in the `data/cookbook-data-*.json` files.

## How it works

1. **Initial load** – The app loads `data/cookbook-data-en.json` (or the language from the URL on the recipe page).
2. **UI strings** – Labels (title, search placeholder, filter names, etc.) come from `recipesData.ui` and are applied to the page (e.g. in `recipeLoader.js` via `updatePageText()`).
3. **Recipes** – The list and detail views read from `recipesData.recipes`. Recipe links point to `recipe-template.html?id=<id>&lang=<lang>`.
4. **Language change** – The language button cycles `en` → `fr` → `es`. The app fetches the new `cookbook-data-{lang}.json` and re-renders.

## Adding a new language

1. Add a new file `data/cookbook-data-<code>.json` with the same structure as `cookbook-data-en.json` (e.g. `ui` and `recipes`).
2. In `recipeLoader.js` and in the recipe detail viewer script, add the new language code and label to the `languages` array and the `languageNames` object (or a shared config if you introduce one).
3. Ensure the language switcher UI includes the new option.

## Adding or editing content

- **UI strings** – Edit the `ui` object in each `data/cookbook-data-{en,fr,es}.json` (title, search placeholder, section headers, category names, dietary filter names).
- **Recipes** – Edit the `recipes` array in each language file. Use the same `id` in all three files so links and the detail page work. See the main [README](../README.md) for the recipe object shape and how to add recipes.

## Optional future improvements

- **More languages** – Add more `cookbook-data-<code>.json` files and extend the language switcher.
- **Single source + build** – e.g. one canonical JSON plus a build step that generates per-language files (not implemented today).
- **Translation API** – If you later integrate an API, you could keep the same JSON structure and generate the `cookbook-data-*.json` files from a build or external process.
