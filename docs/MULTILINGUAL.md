# 🌍 Multilingual Cookbook System

## Overview

This cookbook website now supports **11 languages** with automatic translation using translation APIs. The system provides:

- **Dynamic language switching** with a dropdown in the header
- **Automatic translation** of all content using translation APIs
- **Local caching** to improve performance
- **Fallback system** to English if translation fails
- **Persistent language preference** stored in browser

## 🚀 Supported Languages

| Language | Code | Native Name |
|----------|------|-------------|
| English | `en` | English |
| French | `fr` | Français |
| Spanish | `es` | Español |
| German | `de` | Deutsch |
| Italian | `it` | Italiano |
| Portuguese | `pt` | Português |
| Dutch | `nl` | Nederlands |
| Russian | `ru` | Русский |
| Chinese | `zh` | 中文 |
| Japanese | `ja` | 日本語 |
| Korean | `ko` | 한국어 |

## 🔧 Translation API

### LibreTranslate (Free)
- **Cost**: Free
- **Quality**: Good
- **Setup**: No API key required
- **Rate Limits**: None (public instance)

```javascript
// Current implementation in js/i18n.js
const response = await fetch('https://libretranslate.com/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetLang,
        format: 'text',
        alternatives: 1,
        api_key: ''
    })
});
```

## 📁 File Structure

```
cookbook/
├── js/
│   ├── i18n.js              # Main i18n system
│   ├── i18n.min.js          # Minified version
│   └── recipeLoader.js      # Dynamic recipe loading
├── data/
│   ├── recipes.json         # Recipe database
│   └── translation.json     # Translation config
├── config/
│   └── translation.json     # API configuration
└── docs/
    └── MULTILINGUAL.md      # This documentation
```

## 🎯 How to Use

### 1. Setup Translation API

**LibreTranslate (Free):**
- ✅ **No setup required!** The system is already configured to use LibreTranslate
- ✅ **No API key needed** - using the public instance
- ✅ **No rate limits** - completely free to use
- ✅ **Ready to use** - just load the page and select a language

### 2. Add New Content

**For static content:**
```html
<h1 data-i18n="my_recipe_journal">My Recipe Journal</h1>
<input placeholder="Search recipes..." data-i18n="search_placeholder">
```

**For dynamic content:**
```javascript
// In your JavaScript
const translated = window.i18n.translate('recipe_title');
element.textContent = translated;
```

### 3. Add New Recipes

1. **Add to JSON database:**
```json
{
  "id": "new_recipe",
  "title": "New Recipe",
  "file": "new_recipe.html",
  "description": "A delicious new recipe"
}
```

2. **Add translation keys:**
```javascript
// In js/i18n.js, add to translations.en
'new_recipe': 'New Recipe',
'new_recipe_desc': 'A delicious new recipe'
```

3. **Create recipe HTML file** in `recipes/`

### 4. Add New Languages

1. **Add to supported languages:**
```javascript
// In js/i18n.js
this.supportedLanguages = {
    'en': 'English',
    'fr': 'Français',
    'new_lang': 'New Language Name'
};
```

2. **Translations will be automatically generated** via API

## 🔄 How It Works

### 1. Initialization
```javascript
// System loads saved language preference
const savedLang = localStorage.getItem('cookbook-language') || 'en';

// Loads base English translations
await this.loadTranslations();

// Applies translations to all elements with data-i18n
this.applyTranslations();

// Creates language switcher in header
this.setupLanguageSwitcher();
```

### 2. Translation Process
```javascript
// When user changes language
async changeLanguage(newLang) {
    // 1. Check if translations are cached
    const cached = localStorage.getItem(`translations_${newLang}`);
    
    if (!cached) {
        // 2. Call translation API for all English text
        for (const [key, value] of Object.entries(this.translations.en)) {
            const translated = await this.translationAPI.translate(value, newLang);
            this.translations[newLang][key] = translated;
        }
        
        // 3. Cache translations
        localStorage.setItem(`translations_${newLang}`, JSON.stringify(this.translations[newLang]));
    }
    
    // 4. Apply translations
    this.applyTranslations();
}
```

### 3. Caching System
- **First visit**: API call to translate all content
- **Subsequent visits**: Load from localStorage cache
- **Cache duration**: 24 hours (configurable)
- **Fallback**: English if API fails

## 🎨 UI Components

### Language Switcher
```html
<div class="language-switcher">
    <select id="language-select">
        <option value="en">English</option>
        <option value="fr">Français</option>
        <!-- ... more languages -->
    </select>
</div>
```

### CSS Styling
```css
.language-switcher {
    margin-left: auto;
    margin-right: 20px;
}

.language-switcher select {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px 12px;
    /* ... more styles */
}
```

## 🚀 Performance Optimizations

### 1. Caching
- **LocalStorage**: Caches translations for 24 hours
- **Reduced API calls**: Only translates new content
- **Fallback system**: English if API unavailable

### 2. Lazy Loading
- **On-demand translation**: Only when language changes
- **Background processing**: Non-blocking UI updates
- **Progressive enhancement**: Works without JavaScript

### 3. Minification
- **Production builds**: All JS files minified
- **GitHub Actions**: Automatic minification on deploy
- **CDN ready**: Optimized for fast loading

## 🔧 Configuration

### Translation API Settings
```json
{
  "api": {
    "libre_translate": {
      "enabled": true,
      "endpoint": "https://libretranslate.com/translate",
      "api_key": "",
      "format": "text",
      "alternatives": 1
    }
  }
}
```

### Language Settings
```json
{
  "languages": {
    "default": "en",
    "supported": ["en", "fr", "es", "de", "it", "pt", "nl", "ru", "zh", "ja", "ko"]
  }
}
```

## 🐛 Troubleshooting

### Common Issues

**1. Translations not loading:**
- Check API key (Google Translate)
- Verify internet connection
- Check browser console for errors

**2. Language switcher not appearing:**
- Ensure `js/i18n.min.js` is loaded
- Check CSS for `.language-switcher` styles
- Verify header structure

**3. Cached translations outdated:**
- Clear localStorage: `localStorage.clear()`
- Or clear specific language: `localStorage.removeItem('translations_fr')`

**4. API rate limits:**
- Google Translate: 500,000 characters/day free
- LibreTranslate: No limits (public instance)

## 📈 Analytics & Monitoring

### Translation Usage
```javascript
// Track translation requests
const trackTranslation = (fromLang, toLang, textLength) => {
    // Send to analytics service
    console.log(`Translation: ${fromLang} → ${toLang}, ${textLength} chars`);
};
```

### Error Monitoring
```javascript
// Monitor API failures
catch (error) {
    console.error('Translation API error:', error);
    // Send to error tracking service
    return text; // Fallback to original
}
```

## 🎯 Best Practices

### 1. Content Management
- **Use translation keys**: `data-i18n="key_name"`
- **Keep keys descriptive**: `recipe_title` not `title`
- **Group related keys**: `recipe_ingredients`, `recipe_instructions`

### 2. Performance
- **Cache aggressively**: Store translations locally
- **Batch API calls**: Translate multiple strings at once
- **Lazy load**: Only translate visible content

### 3. User Experience
- **Show loading state**: While translating
- **Preserve user choice**: Remember language preference
- **Graceful fallback**: Always show English if translation fails

### 4. SEO
- **Add language meta tags**:
```html
<meta name="language" content="en">
<link rel="alternate" hreflang="fr" href="/fr/">
```

## 🔮 Future Enhancements

### Planned Features
- **Machine learning**: Improve translation quality
- **User corrections**: Allow users to fix translations
- **Community translations**: Crowdsourced improvements
- **Voice translation**: Speech-to-text for recipes
- **Image translation**: Translate recipe images

### Advanced Features
- **Regional variants**: French (Canada) vs French (France)
- **Formal/informal**: Respect cultural language norms
- **Recipe units**: Automatic unit conversion (metric/imperial)
- **Dietary restrictions**: Translate based on dietary needs

---

**🎉 Your cookbook is now truly global!** Users from around the world can enjoy your recipes in their native language. 