export class LanguageManager {
    constructor() {
        this.currentLanguage = this.detectLanguage();
        this.translations = {};
    }

    detectLanguage() {
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) return savedLanguage;

        const path = window.location.pathname;
        if (path.startsWith('/en/')) return 'en';

        const browserLanguage = navigator.language || navigator.userLanguage;
        if (browserLanguage && browserLanguage.startsWith('en')) return 'en';

        return 'es';
    }

    async loadTranslations(language) {
        try {
            const response = await fetch(`/lang/${language}.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.translations = await response.json();
            this.currentLanguage = language;
            localStorage.setItem('preferredLanguage', language);
            document.documentElement.lang = language;
        } catch (error) {
            console.error(`Error loading translations for ${language}:`, error);
            if (language !== 'es') return await this.loadTranslations('es');
        }
    }

    getTranslation(key) {
        if (!key) return '';
        return key.split('.').reduce((obj, k) => obj && obj[k], this.translations) || key;
    }

    translatePage() {
        const elementsToTranslate = document.querySelectorAll('[data-lang]');
        elementsToTranslate.forEach(element => {
            const key = element.getAttribute('data-lang');
            const translation = this.getTranslation(key);
            if (translation && translation !== key) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else if (element.tagName === 'IMG') {
                    element.alt = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        const titleElements = document.querySelectorAll('[title][data-lang-title]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-lang-title');
            const translation = this.getTranslation(key);
            if (translation) element.title = translation;
        });
    }

    async changeLanguage(newLanguage) {
        if (newLanguage === this.currentLanguage) return;

        const oldLanguage = this.currentLanguage;
        try {
            await this.loadTranslations(newLanguage);
            this.translatePage();
            this.updateLanguageSelector();
            window.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { oldLanguage, newLanguage }
            }));
        } catch (error) {
            console.error('Error changing language:', error);
            await this.loadTranslations(oldLanguage);
            this.updateLanguageSelector();
        }
    }

    updateLanguageSelector() {
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) langSelector.value = this.currentLanguage;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    async init() {
        await this.loadTranslations(this.currentLanguage);
        this.translatePage();
        this.updateLanguageSelector();
    }
}

// Exportar una instancia lista para usar
export const languageManager = new LanguageManager();
