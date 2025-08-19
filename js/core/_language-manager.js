export class LanguageManager {
    constructor() {
        this.translationCache = new Map();
        this.availableLanguages = ['es', 'en'];
        this.currentLanguage = this.detectLanguage();
        this.flagMap = { 'es': 'es', 'en': 'us' };
        this.translations = {};

        this.setupLanguageSelector = this.setupLanguageSelector.bind(this);

        this.createLanguageDropdown();
    }

    async init() {
        await this.loadTranslations(this.currentLanguage);
        this.updateLanguageDropdownOptions();
        this.translatePage();
        this.updateLanguageSelector();
    }

    createLanguageDropdown() {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (!navbarCollapse) return;

        // Limpiar dropdown existente
        const existingDropdown = navbarCollapse.querySelector('.language-dropdown-container');
        if (existingDropdown) existingDropdown.remove();

        // Crear contenedor
        const container = document.createElement('div');
        container.className = 'd-flex align-items-center language-dropdown-container';

        // HTML optimizado para móviles
        container.innerHTML = `
        <div class="dropdown">
            <button id="languageDropdown" class="btn p-0 border-0 d-flex align-items-center" 
                    type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <span id="currentLanguageFlag" class="fi fi-${this.flagMap[this.currentLanguage]} rounded-circle"></span>
                <span id="currentLanguageText" class="ms-2">${this.currentLanguage.toUpperCase()}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="ms-1">
                    <path fill="none" fill-rule="evenodd" stroke="#FFF" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 1 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708Z"></path>
                </svg>
            </button>
            <ul class="dropdown-menu dropdown-menu-end"></ul>
        </div>
    `;

        navbarCollapse.appendChild(container);
    }

    updateLanguageDropdownOptions() {
        const dropdownMenu = document.querySelector('.dropdown-menu');
        if (!dropdownMenu || !this.translations.header) return;

        dropdownMenu.innerHTML = '';
        const { text, value } = this.translations.header.language_selector;

        Object.keys(value).forEach(langKey => {
            const langCode = value[langKey];
            const langName = text[langKey];
            const flagCode = this.flagMap[langCode] || langCode;

            const listItem = document.createElement('li');
            listItem.innerHTML = `
            <button class="dropdown-item d-flex align-items-center btn-flag" 
                    type="button" 
                    data-lang-code="header.language_selector.text.${langKey}">
                <span class="fi fi-${flagCode} rounded-circle me-2"></span>
                <span class="dropdown-text">${langName}</span>
            </button>
        `;
            dropdownMenu.appendChild(listItem);
        });

        // Aplicar estilos responsive a las opciones        
        this.setupLanguageSelector();
        this.applyResponsiveDropdownStyles();
    }

    applyResponsiveDropdownStyles() {
        if (window.innerWidth <= 768) {
            document.querySelectorAll('.dropdown-text').forEach(text => {
                text.classList.add('d-none');
            });
        } else {
            document.querySelectorAll('.dropdown-text').forEach(text => {
                text.classList.remove('d-none');
            });
        }
    }

    updateLanguageSelector() {
        const currentLangCode = this.currentLanguage;
        const currentFlag = document.getElementById('currentLanguageFlag');
        const currentText = document.getElementById('currentLanguageText');

        if (currentFlag) {
            const flagCode = this.flagMap[currentLangCode] || currentLangCode;
            currentFlag.className = `fi fi-${flagCode} rounded-circle`;
        }

        if (currentText) {
            const langKey = Object.keys(this.translations?.header?.language_selector?.value || {})
                .find(key => this.translations.header.language_selector.value[key] === currentLangCode);

            // Mostrar texto completo en desktop, abreviado en móvil
            const displayText = langKey
                ? this.getTranslation(`header.language_selector.value.${langKey}`).toUpperCase()
                : currentLangCode.toUpperCase();

            currentText.textContent = displayText;

            // Ajustar para móvil
            if (window.innerWidth <= 768) {
                currentText.style.maxWidth = '60px';
                currentText.style.overflow = 'hidden';
                currentText.style.textOverflow = 'ellipsis';
            } else {
                currentText.style.maxWidth = 'none';
            }
        }
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

    detectLanguage() {
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) return savedLanguage;
        return 'es';
    }

    async loadTranslations(language) {
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
    }

    getTranslation(key) {
        if (!key) return '';
        return key.split('.').reduce((obj, k) => obj && obj[k], this.translations) || key;
    }

    setupLanguageSelector() {
        const dropdownItems = document.querySelectorAll('.btn-flag[data-lang-code]');
        dropdownItems.forEach(item => {
            item.addEventListener('click', async (e) => {
                e.preventDefault();
                const translationKey = item.getAttribute('data-lang-code');
                const languageName = translationKey.split('.').pop();

                const langCode = this.getTranslation(`header.language_selector.value.${languageName}`);

                if (langCode && langCode !== this.currentLanguage) {
                    await this.changeLanguage(langCode);
                }
            });
        });
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

        document.querySelectorAll('[data-lang-code]').forEach(element => {
            const key = element.getAttribute('data-lang-code');
            const translation = this.getTranslation(key);
            if (translation && translation !== key) {
                element.value = translation;
                element.setAttribute('data-value', translation);
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
            this.updateLanguageDropdownOptions();
            this.translatePage();
            this.updateLanguageSelector();
            window.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { oldLanguage, newLanguage }
            }));
            this.applyResponsiveDropdownStyles();
        } catch (error) {
            console.error('Error changing language:', error);
            await this.loadTranslations(oldLanguage);
            this.updateLanguageSelector();
        }
    }

    updateLanguageSelector() {
        const currentLangCode = this.currentLanguage;

        // 1. Actualizar bandera del botón principal
        const currentFlag = document.getElementById('currentLanguageFlag');
        if (currentFlag) {
            const flagCode = this.flagMap[currentLangCode] || currentLangCode;
            currentFlag.className = `fi fi-${flagCode} rounded-circle me-2`;
        }

        // 2. Actualizar texto del botón principal (value en mayúsculas)
        const currentText = document.getElementById('currentLanguageText');
        if (currentText) {
            // Encuentra la clave del idioma actual (ej: "spanish" para "es")
            const langKey = Object.keys(this.translations?.header?.language_selector?.value || {})
                .find(key => this.translations.header.language_selector.value[key] === currentLangCode);

            currentText.textContent = langKey
                ? this.getTranslation(`header.language_selector.value.${langKey}`).toUpperCase()
                : currentLangCode.toUpperCase();
        }

        // 3. Actualizar opciones del dropdown
        document.querySelectorAll('.btn-flag').forEach(item => {
            const langKey = item.getAttribute('data-lang-code');
            if (!langKey) return;

            // Extraer el nombre del idioma (ej: "spanish" de "header.language_selector.text.spanish")
            const langName = langKey.split('.').pop();

            // Actualizar texto (header.language_selector.text)
            const textSpan = item.querySelector('span:not(.fi)');
            if (textSpan) {
                textSpan.textContent = this.getTranslation(langKey);
            }

            // Actualizar bandera
            const flagSpan = item.querySelector('.fi');
            if (flagSpan) {
                const langCode = this.getTranslation(`header.language_selector.value.${langName}`);
                if (langCode) {
                    const flagCode = this.flagMap[langCode] || langCode;
                    flagSpan.className = `fi fi-${flagCode} rounded-circle me-2`;
                }
            }
        });
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

export const languageManager = new LanguageManager();