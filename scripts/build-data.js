#!/usr/bin/env node
/**
 * Build data/cookbook-data-{en,fr,es}.json from data/source/.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SOURCE = path.join(ROOT, 'data', 'source');
const LANGS = ['en', 'fr', 'es'];
const TRANSLATABLE = [
    'title', 'description', 'servings', 'prep_time', 'cook_time',
    'ingredients', 'instructions', 'tips', 'ingredient_sections', 'instruction_blocks'
];

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const uiByLang = readJson(path.join(SOURCE, 'ui.json'));
const navigationByLang = readJson(path.join(SOURCE, 'navigation.json'));
const recipesSource = readJson(path.join(SOURCE, 'recipes.json'));

for (const lang of LANGS) {
    const recipes = recipesSource.map((entry) => {
        const recipe = {
            id: entry.id,
            tags: entry.tags
        };
        if (entry.image) recipe.image = entry.image;
        const tr = entry.translations[lang];
        if (!tr) {
            throw new Error(`Missing ${lang} translation for recipe "${entry.id}"`);
        }
        for (const key of TRANSLATABLE) {
            if (tr[key] !== undefined) recipe[key] = tr[key];
        }
        return recipe;
    });

    const output = {
        ui: uiByLang[lang],
        navigation: navigationByLang[lang],
        recipes
    };

    const outPath = path.join(ROOT, 'data', `cookbook-data-${lang}.json`);
    fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');
    console.log(`✅ Wrote ${outPath}`);
}
