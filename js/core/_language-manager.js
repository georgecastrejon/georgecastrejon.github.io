export class LanguageManager {
    // Constructor - inicializa el gestor de idiomas, detecta el idioma inicial y configura el selector
    constructor() {
        this.currentLanguage = this.detectLanguage();
        this.translations = {};
        this.langSelector = document.getElementById('languageSelector');
        this.setupLanguageSelector();
    }

    //Configura el evento change del selector de idioma
    setupLanguageSelector() {
        if (!this.langSelector) return;
        this.langSelector.value = this.currentLanguage;
        this.langSelector.addEventListener('change', async (e) => {
            const newLanguage = e.target.value;
            if (newLanguage !== this.currentLanguage) {
                await this.changeLanguage(newLanguage);
            }
        });
    }

    //Detecta el idioma preferido del usuario
    detectLanguage() {
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) return savedLanguage;
        const path = window.location.pathname;
        if (path.startsWith('/en/')) return 'en';
        if (path.startsWith('/jp/')) return 'jp';
        if (path.startsWith('/cn/')) return 'cn';
        if (path.startsWith('/kr/')) return 'kr';
        const browserLanguage = navigator.language || navigator.userLanguage;
        if (browserLanguage && browserLanguage.startsWith('en')) return 'en';
        if (browserLanguage && browserLanguage.startsWith('jp')) return 'jp';
        if (browserLanguage && browserLanguage.startsWith('cn')) return 'cn';
        if (browserLanguage && browserLanguage.startsWith('kr')) return 'kr';
        return 'es';
    }

    //Carga las traducciones del idioma seleccionado
    //Si falla, intenta cargar el idioma por defecto (es)
    async loadTranslations(language) {
        try {
            const response = await fetch(`./lang/${language}.json`);
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

    //Obtiene la traducción de una clave específica
    //Si no se encuentra, devuelve la clave original
    getTranslation(key) {
        if (!key) return '';
        return key.split('.').reduce((obj, k) => obj && obj[k], this.translations) || key;
    }

    //Traduce todos los elementos de la página que tengan el atributo data-lang
    //Actualiza los atributos title de los elementos que tengan data-lang-title
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

    //Cambia el idioma actual y actualiza la página
    //Emite un evento 'languageChanged' para notificar a otros componentes
    //Si falla, intenta volver al idioma anterior
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

    //Actualiza el selector de idioma para reflejar el idioma actual
    //Si el selector no existe, no hace nada
    updateLanguageSelector() {
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) langSelector.value = this.currentLanguage;
    }

    //Devuelve el idioma actual
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    //Inicializa el gestor de idiomas, carga las traducciones y traduce la página
    //Actualiza el selector de idioma
    async init() {
        await this.loadTranslations(this.currentLanguage);
        this.translatePage();
        this.updateLanguageSelector();
    }
}

export const languageManager = new LanguageManager();