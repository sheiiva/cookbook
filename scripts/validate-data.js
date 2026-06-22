#!/usr/bin/env node
/**
 * Validates cookbook-data-{en,fr,es}.json share the same recipe IDs and field shapes.
 * Exits 1 on mismatch (for CI).
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const LANGS = ['en', 'fr', 'es'];

const RECIPE_SCALAR_KEYS = ['id', 'title', 'image', 'description'];
const RECIPE_ARRAY_KEYS = ['tags', 'ingredients', 'instructions'];
const RECIPE_OBJECT_KEYS = ['ingredient_sections', 'instruction_blocks'];
const RECIPE_OPTIONAL_KEYS = ['tips', 'servings', 'prep_time', 'cook_time'];

function load(lang) {
  const file = path.join(DATA_DIR, `cookbook-data-${lang}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${file}`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function recipeShape(recipe) {
  const keys = new Set(Object.keys(recipe));
  const shape = {
    scalars: RECIPE_SCALAR_KEYS.filter((k) => keys.has(k)),
    arrays: RECIPE_ARRAY_KEYS.filter((k) => keys.has(k)),
    objects: RECIPE_OBJECT_KEYS.filter((k) => keys.has(k)),
    optional: RECIPE_OPTIONAL_KEYS.filter((k) => keys.has(k))
  };
  return JSON.stringify(shape);
}

function tagSet(recipe) {
  return [...(recipe.tags || [])].sort().join(',');
}

let failed = false;

const byLang = {};
for (const lang of LANGS) {
  byLang[lang] = load(lang);
}

const recipesByLang = {};
for (const lang of LANGS) {
  recipesByLang[lang] = new Map(byLang[lang].recipes.map((r) => [r.id, r]));
}

const enIds = [...recipesByLang.en.keys()].sort();

for (const lang of ['fr', 'es']) {
  const ids = [...recipesByLang[lang].keys()].sort();
  const enSet = new Set(enIds);
  const langSet = new Set(ids);

  for (const id of enIds) {
    if (!langSet.has(id)) {
      console.error(`❌ Recipe "${id}" in en but missing in ${lang}`);
      failed = true;
    }
  }
  for (const id of ids) {
    if (!enSet.has(id)) {
      console.error(`❌ Recipe "${id}" in ${lang} but missing in en`);
      failed = true;
    }
  }
}

for (const id of enIds) {
  const enRecipe = recipesByLang.en.get(id);
  const enShape = recipeShape(enRecipe);
  const enTags = tagSet(enRecipe);

  for (const lang of ['fr', 'es']) {
    const recipe = recipesByLang[lang].get(id);
    if (!recipe) continue;

    const shape = recipeShape(recipe);
    if (shape !== enShape) {
      console.error(`❌ Field shape mismatch for "${id}" (en vs ${lang}):`);
      console.error(`   en: ${enShape}`);
      console.error(`   ${lang}: ${shape}`);
      failed = true;
    }

    const tags = tagSet(recipe);
    if (tags !== enTags) {
      console.error(`❌ Tag mismatch for "${id}" (en vs ${lang}):`);
      console.error(`   en: [${enTags}]`);
      console.error(`   ${lang}: [${tags}]`);
      failed = true;
    }
  }
}

if (failed) {
  console.error('\nData validation failed.');
  process.exit(1);
}

console.log(`✅ Validated ${enIds.length} recipes across ${LANGS.join(', ')}`);
