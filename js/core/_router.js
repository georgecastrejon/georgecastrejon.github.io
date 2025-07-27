// js/core/_router.js
// Asumimos que los módulos están en la misma carpeta 'core' o ajusta la ruta según tu estructura real
import { initPortfolioFilters } from '../modules/_portafolio-filter.js';
import { initializeDynamicBootstrapComponents } from '../modules/_bootstrap-helpers.js';

export class SPARouter {
    constructor() {
        // Definir rutas apuntando a la nueva carpeta 'views/'
        this.routes = {
            '': { template: 'views/home.html' },
            'servicios': { template: 'views/services.html' },
            'portafolio': { template: 'views/portfolio.html' },
            'contacto': { template: 'views/contact.html' }
        };
        this.contentContainer = document.getElementById('spa-content');
        this.navLinks = document.querySelectorAll('a[data-route]');
        this.langSelector = document.getElementById('languageSelector');
        // Usar el idioma del LanguageManager o un fallback
        this.currentLanguage = window.languageManager ? window.languageManager.getCurrentLanguage() : 'es';
        this.init();
    }

    init() {
        // Escuchar cambios en el hash de la URL (botones atrás/adelante)
        window.addEventListener('hashchange', () => this.handleLocationChange());
        // Escuchar clics en enlaces de navegación
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigationClick(e));
        });
        // Escuchar cambios en el selector de idioma
        if (this.langSelector) {
            this.langSelector.addEventListener('change', (e) => this.changeLanguage(e.target.value));
        }
        // Cargar la ruta inicial
        this.handleLocationChange();
    }

    getInitialLanguage() {
         // Preferir el idioma del LanguageManager si ya está disponible
        if (window.languageManager) {
            return window.languageManager.getCurrentLanguage();
        }
        // Fallback: Determinar el idioma inicial basado en la URL o preferencias
        const path = window.location.pathname;
        if (path.startsWith('/en/')) {
            return 'en';
        }
        return 'es'; // Por defecto español
    }

    async handleLocationChange() {
        const hash = window.location.hash.slice(1) || '';
        // Cargar y mostrar el contenido
        await this.loadAndDisplayContent(hash);
        // Actualizar UI (navbar, título)
        this.updateUI(hash);
    }

    handleNavigationClick(e) {
        e.preventDefault();
        const route = e.target.getAttribute('data-route');
        window.location.hash = route === 'home' ? '' : route;
    }

    async loadAndDisplayContent(path) {
        const routeConfig = this.routes[path];
        if (!routeConfig) {
            // Ruta no encontrada, cargar página de inicio
            console.warn(`Ruta no encontrada: ${path}. Cargando página de inicio.`);
            await this.loadAndDisplayContent('');
            return;
        }
        
        // Usar siempre routeConfig.template, ya que ahora es independiente del idioma
        const contentPath = routeConfig.template;
        
        if (!contentPath) {
            console.error(`No se encontró contenido para la ruta ${path}`);
            this.contentContainer.innerHTML = '<div class="container py-5"><h2>Error al cargar el contenido</h2><p>El contenido solicitado no está disponible.</p></div>';
            return;
        }
        // Mostrar indicador de carga
        this.contentContainer.innerHTML = '<div class="spa-loading"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        try {
            const response = await fetch(contentPath);
            if (!response.ok) {
                throw new Error(`Error al cargar ${contentPath}: ${response.status} ${response.statusText}`);
            }
            const htmlContent = await response.text();
            this.contentContainer.innerHTML = htmlContent;
            // Inicializar componentes de Bootstrap usando el módulo importado
            this.initializeBootstrapComponents();
            // Aplicar traducciones al nuevo contenido
            if (window.languageManager) {
                window.languageManager.translatePage();
            }
        } catch (error) {
            console.error('Error al cargar el contenido de la página:', error);
            this.contentContainer.innerHTML = `<div class="container py-5"><h2>Error</h2><p>No se pudo cargar el contenido. Por favor, inténtalo de nuevo más tarde.</p><p>Detalles: ${error.message}</p></div>`;
        }
    }

    initializeBootstrapComponents() {
        // Re-inicializar componentes de Bootstrap usando el módulo importado
        initializeDynamicBootstrapComponents(this.contentContainer);
        // Inicializar filtros de portafolio usando el módulo importado
        this.setupPortfolioFilters();
    }

    setupPortfolioFilters() {
        // Lógica para los filtros del portafolio delegada al módulo
        // Pasamos el contenedor donde se encuentran los elementos
        initPortfolioFilters(this.contentContainer);
    }

    updateUI(path) {
        // Actualizar título de la página usando las claves de traducción
        let titleKey = 'navigation.home';
        switch(path) {
            case 'servicios':
                titleKey = 'navigation.services';
                break;
            case 'portafolio':
                titleKey = 'navigation.portfolio';
                break;
            case 'contacto':
                titleKey = 'navigation.contact';
                break;
        }
        const pageTitle = window.languageManager ? window.languageManager.getTranslation(titleKey) : 'QA Expert';
        document.title = `QA Expert | ${pageTitle}`;
        
        // Actualizar clase 'active' en el navbar
        this.navLinks.forEach(link => {
            // Comparar el hash de la URL con el data-route del enlace
            const route = link.getAttribute('data-route');
            let targetHash = '';
            switch(route) {
                case 'servicios':
                    targetHash = 'servicios';
                    break;
                case 'portafolio':
                    targetHash = 'portafolio';
                    break;
                case 'contacto':
                    targetHash = 'contacto';
                    break;
                case 'home':
                default:
                    targetHash = '';
                    break;
            }
            
            if (targetHash === path) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Actualizar selector de idioma
        if (this.langSelector) {
            this.langSelector.value = this.currentLanguage;
        }
    }

    async changeLanguage(newLanguage) {
        if (newLanguage === this.currentLanguage) return;
        const oldLanguage = this.currentLanguage;
        this.currentLanguage = newLanguage;
        
        try {
            // Actualizar las traducciones usando LanguageManager
            if (window.languageManager) {
                await window.languageManager.changeLanguage(newLanguage);
            }
            
            // Recargar el contenido actual para aplicar las nuevas traducciones
            const hash = window.location.hash.slice(1) || '';
            await this.loadAndDisplayContent(hash);
            this.updateUI(hash);
            
            // Nota: En una SPA pura con hash, no necesitamos cambiar la ruta base
            // La URL con hash se mantiene, y el contenido se traduce.
            // Si quisieras cambiar el idioma en la URL base, se podría hacer,
            // pero sería más complejo con el enfoque de hash actual.
            
        } catch (error) {
            console.error('Error changing language in SPARouter:', error);
            // Revertir el idioma en caso de error
            this.currentLanguage = oldLanguage;
            if (this.langSelector) {
                this.langSelector.value = oldLanguage;
            }
        }
    }
    
    // Método auxiliar para normalizar rutas si es necesario
    // En este caso con hash, puede ser más simple
    normalizePath(path) {
        // Para rutas basadas en hash, normalmente trabajamos con el hash
        // Este método podría no ser necesario o muy simple
        return path; // O tal vez window.location.hash.slice(1) || '';
    }
}