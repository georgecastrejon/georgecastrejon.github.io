// js/main.js

class SPARouter {
    constructor() {
        // Definir rutas y sus archivos parciales correspondientes
        this.routes = {
            '': { es: 'es/partials/home.html', en: 'en/partials/home.html' },
            'servicios': { es: 'es/partials/services.html', en: 'en/partials/services.html' },
            'portafolio': { es: 'es/partials/portfolio.html', en: 'en/partials/portfolio.html' },
            'contacto': { es: 'es/partials/contact.html', en: 'en/partials/contact.html' }
        };
        
        this.contentContainer = document.getElementById('spa-content');
        this.navLinks = document.querySelectorAll('a[data-route]');
        this.langSelector = document.getElementById('languageSelector');
        
        this.currentLanguage = this.getInitialLanguage();
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
        // Determinar el idioma inicial basado en la URL
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
            await this.loadAndDisplayContent('/');
            return;
        }

        const contentPath = routeConfig[this.currentLanguage];
        
        if (!contentPath) {
            console.error(`No se encontró contenido para la ruta ${path} en el idioma ${this.currentLanguage}`);
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
            
            // Inicializar componentes de Bootstrap si es necesario
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
        // Re-inicializar componentes de Bootstrap que pueden haberse agregado dinámicamente
        // Esto es necesario porque algunos componentes requieren inicialización manual
        // cuando se agregan al DOM después de la carga inicial.
        
        // Ejemplo para tooltips (si los usas):
        const tooltipTriggerList = [].slice.call(this.contentContainer.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            // Evitar inicializar dos veces
            if (!tooltipTriggerEl.hasAttribute('data-bs-initialized')) {
                new bootstrap.Tooltip(tooltipTriggerEl);
                tooltipTriggerEl.setAttribute('data-bs-initialized', 'true');
            }
        });
        
        // Ejemplo para filtros de portafolio (si aplica):
        this.setupPortfolioFilters();
    }

    setupPortfolioFilters() {
        // Lógica para los filtros del portafolio, si es que se usa
        const filterButtons = this.contentContainer.querySelectorAll('.filter-btn');
        const projectItems = this.contentContainer.querySelectorAll('.project-item');

        if (filterButtons.length > 0 && projectItems.length > 0) {
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Remover clase 'active' de todos los botones
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    // Agregar clase 'active' al botón clickeado
                    button.classList.add('active');

                    const filter = button.getAttribute('data-filter');

                    projectItems.forEach(item => {
                        if (filter === 'all' || item.getAttribute('data-category') === filter) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                });
            });
        }
    }

    updateUI(path) {
        // Actualizar título de la página
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
            const route = link.getAttribute('data-route');
            let linkPath = '/';
            switch(route) {
                case 'services':
                    linkPath = '/servicios';
                    break;
                case 'portfolio':
                    linkPath = '/portafolio';
                    break;
                case 'contact':
                    linkPath = '/contacto';
                    break;
            }
            
            if (this.normalizePath(link.getAttribute('href')) === path) {
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

    handleNavigationClick(e) {
        e.preventDefault();
        const route = e.target.getAttribute('data-route');
        window.location.hash = route === 'home' ? '' : route;
    }

    async changeLanguage(newLanguage) {
        if (newLanguage === this.currentLanguage) return;

        this.currentLanguage = newLanguage;
        
        // Actualizar las traducciones
        if (window.languageManager) {
            await window.languageManager.changeLanguage(newLanguage);
        }
        
        // Recargar el contenido actual en el nuevo idioma
        const currentPath = this.normalizePath(window.location.pathname);
        await this.loadAndDisplayContent(currentPath);
        this.updateUI(currentPath);
        
        // Actualizar la URL para reflejar el nuevo idioma
        const newPath = `/${newLanguage}${currentPath === '/' ? '' : currentPath}`;
        history.replaceState(null, '', newPath);
    }
}

// Inicializar la SPA cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que languageManager esté disponible
    const checkLanguageManager = setInterval(() => {
        if (window.languageManager && window.languageManager.translations && Object.keys(window.languageManager.translations).length > 0) {
            clearInterval(checkLanguageManager);
            window.spaRouter = new SPARouter();
        }
    }, 100); // Revisar cada 100ms
});