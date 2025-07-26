// js/language.js

class LanguageManager {
    constructor() {
        this.currentLanguage = this.detectLanguage();
        this.translations = {};
        this.init();
    }

    detectLanguage() {
        // 1. Verificar localStorage
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) {
            return savedLanguage;
        }
        
        // 2. Verificar la ruta actual para una SPA con prefijos de idioma
        // Aunque el enrutador SPA maneja esto, es bueno tener un respaldo
        const path = window.location.pathname;
        if (path.startsWith('/en/')) {
            return 'en';
        }
        
        // 3. Verificar el navegador
        const browserLanguage = navigator.language || navigator.userLanguage;
        if (browserLanguage && browserLanguage.startsWith('en')) {
            return 'en';
        }
        
        // 4. Por defecto
        return 'es';
    }

    async loadTranslations(language) {
        try {
            const response = await fetch(`lang/${language}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.translations = await response.json();
            this.currentLanguage = language;
            localStorage.setItem('preferredLanguage', language);
            // Actualizar el atributo lang del HTML
            document.documentElement.lang = language;
            return this.translations;
        } catch (error) {
            console.error(`Error loading translations for ${language}:`, error);
            // Cargar idioma por defecto si falla
            if (language !== 'es') {
                console.log("Falling back to default language 'es'");
                return await this.loadTranslations('es');
            }
            return null;
        }
    }

    async init() {
        await this.loadTranslations(this.currentLanguage);
        this.translatePage();
        this.updateLanguageSelector();
    }

    getTranslation(key) {
        if (!key) return '';
        return key.split('.').reduce((obj, k) => obj && obj[k], this.translations) || key;
    }

    translatePage() {
        // Traducir elementos con data-lang
        const elementsToTranslate = document.querySelectorAll('[data-lang]');
        elementsToTranslate.forEach(element => {
            const key = element.getAttribute('data-lang');
            const translation = this.getTranslation(key);
            if (translation && translation !== key) {
                // Para inputs y textareas, usar placeholder
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } 
                // Para imágenes, usar alt
                else if (element.tagName === 'IMG') {
                    element.alt = translation;
                }
                // Para otros elementos, usar textContent
                else {
                    element.textContent = translation;
                }
            }
        });

        // Traducir atributos title
        const titleElements = document.querySelectorAll('[title][data-lang-title]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-lang-title');
            const translation = this.getTranslation(key);
            if (translation) {
                element.title = translation;
            }
        });
    }

    async changeLanguage(newLanguage) {
        if (newLanguage === this.currentLanguage) return;

        const oldLanguage = this.currentLanguage;
        try {
            await this.loadTranslations(newLanguage);
            this.currentLanguage = newLanguage;
            localStorage.setItem('preferredLanguage', newLanguage);
            this.translatePage();
            this.updateLanguageSelector();
            
            // Disparar un evento personalizado para que otros componentes puedan reaccionar
            window.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { oldLanguage, newLanguage }
            }));
            
        } catch (error) {
            console.error('Error changing language:', error);
            // Revertir en caso de error
            await this.loadTranslations(oldLanguage);
            this.updateLanguageSelector();
        }
    }

    updateLanguageSelector() {
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) {
            langSelector.value = this.currentLanguage;
        }
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.languageManager = new LanguageManager();
    
    // Configurar el listener para el selector de idioma
    const langSelector = document.getElementById('languageSelector');
    if (langSelector) {
        langSelector.addEventListener('change', function() {
            if (window.languageManager) {
                window.languageManager.changeLanguage(this.value);
            }
        });
    }
});