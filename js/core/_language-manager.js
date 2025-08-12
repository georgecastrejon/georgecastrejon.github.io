export class LanguageManager {
    constructor() {
        this.translationCache = new Map();
        this.availableLanguages = ['es', 'en', 'ja', 'zh', 'ko'];
        this.currentLanguage = 'es'; 


        this.translations = {};
        this.langSelector = document.getElementById('languageDropdown');
        this.setupLanguageSelector();
    }

    async init() {
        await this.loadTranslations(this.currentLanguage);
        this.translatePage();
        this.updateLanguageSelector();
    }

    setupLanguageSelector() {
        const dropdownItems = document.querySelectorAll('.btn-flag[data-lang-code]');
        dropdownItems.forEach(item => {
            item.addEventListener('click', async (e) => {
                e.preventDefault();
                const translationKey = item.getAttribute('data-lang-code');
                const languageValue = this.getTranslation(translationKey);

                if (!languageValue) {
                    console.error(`No se encontró traducción para: ${translationKey}`);
                    return;
                }

                if (languageValue !== this.currentLanguage) {
                    await this.changeLanguage(languageValue);
                }
            });
        });
    }

    async preloadLanguages() {
        const loadingPromises = this.availableLanguages.map(async (lang) => {
            try {
                const response = await fetch(`./lang/${lang}.json`);
                if (!response.ok) throw new Error(`Failed to load ${lang}`);                
                this.translationCache.set(lang, await response.json());                
            } catch (error) {
                console.warn(`No se pudo precargar ${lang}:`, error);
            }
        });
        await Promise.all(loadingPromises);
    }

    //Detecta el idioma preferido del usuario
    detectLanguage() {
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) return savedLanguage;
        return 'es';
    }

    //Carga las traducciones del idioma seleccionado
    //Si falla, intenta cargar el idioma por defecto (es)
    async loadTranslations(language) {

        // 1. Verificar si ya está en caché
        if (this.translationCache.has(language)) {
            this.translations = this.translationCache.get(language);
            this.updateLanguageState(language);
            return;
        }

        
        try {
            alert('Cargando traducciones de forma tradicional');
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

    updateLanguageState(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);
        document.documentElement.lang = lang;
        // Puedes añadir aquí notificaciones a otros componentes
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

        // Procesar elementos con data-lang (texto visible)
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

        // Procesar elementos con data-lang-code (valores)
        document.querySelectorAll('[data-lang-code]').forEach(element => {
            const key = element.getAttribute('data-lang-code');
            const translation = this.getTranslation(key);
            if (translation && translation !== key) {
                element.value = translation;
                element.setAttribute('data-value', translation);
            }
        });

        // Procesar títulos
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
        // Selector tradicional
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) langSelector.value = this.currentLanguage;

        // Dropdown de Bootstrap
        const currentFlag = document.getElementById('currentLanguageFlag');
        const currentText = document.getElementById('currentLanguageText');

        if (currentFlag && currentText) {
            // Actualiza bandera
            currentFlag.className = `fi fi-${this.currentLanguage} rounded-circle me-2`;

            // Actualiza texto (se traducirá automáticamente por translatePage)
            currentText.setAttribute('data-lang', `header.language_selector.text.${this.currentLanguage}`);
        }

    }

    //Devuelve el idioma actual
    getCurrentLanguage() {
        return this.currentLanguage;
    }


}

export const languageManager = new LanguageManager();