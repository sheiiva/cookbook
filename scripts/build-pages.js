#!/usr/bin/env node
/**
 * Generate static recipe pages at recipes/{id}/index.html
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const recipes = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/source/recipes.json'), 'utf8'));
const template = fs.readFileSync(path.join(ROOT, 'recipe-template.html'), 'utf8');
const recipesRoot = path.join(ROOT, 'recipes');

fs.rmSync(recipesRoot, { recursive: true, force: true });

for (const recipe of recipes) {
    const dir = path.join(recipesRoot, recipe.id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), template);
}

console.log(`✅ Generated ${recipes.length} recipe pages under recipes/`);
