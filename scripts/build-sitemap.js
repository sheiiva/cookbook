#!/usr/bin/env node
/**
 * Generate sitemap.xml from data/source/recipes.json
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE_URL = process.env.COOKBOOK_SITE_URL || 'https://sheiiva.github.io/cookbook';
const recipes = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/source/recipes.json'), 'utf8'));

const urls = [`${SITE_URL}/`];
for (const recipe of recipes) {
    urls.push(`${SITE_URL}/recipes/${recipe.id}/`);
}

const body = urls.map((loc) => `  <url><loc>${loc}</loc></url>`).join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log(`✅ Wrote sitemap.xml (${urls.length} URLs)`);
