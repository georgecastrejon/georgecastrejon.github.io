// js/core/_router.js
// Asumimos que los módulos están en la misma carpeta 'core' o ajusta la ruta según tu estructura real
import { initPortfolioFilters } from '../modules/_portafolio-filter.js';
import { initializeDynamicBootstrapComponents } from '../modules/_bootstrap-helpers.js';

export class SPARouter {
    constructor() {
        this.RECAPTCHA_SITE_KEY = '6LfiIpUrAAAAABhohXhcpvXNfVA6UL-KC9op2cit';
        // Definir rutas apuntando a la nueva carpeta 'views/'
        this.routes = {
            '': { template: './views/home.html' },
            'servicios': { template: './views/services.html' },
            'portafolio': { template: './views/portfolio.html' },
            'contacto': { template: './views/contact.html' }
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

            if (path === 'contacto') {
                await this.handleRecaptchaRender();

                const contactForm = document.getElementById('contactForm');
                if (contactForm) {
                    contactForm.addEventListener('submit', async (e) => {  // ¡Ahora es async!
                        e.preventDefault(); // Siempre prevenir el envío primero

                        // Verifica si reCAPTCHA está listo
                        if (!window.grecaptcha) {
                            alert("Error de seguridad. Recarga la página.");
                            return;
                        }

                        const token = grecaptcha.getResponse();
                        if (!token) {
                            alert("Por favor completa el reCAPTCHA");
                            return;
                        }

                        // Convertir FormData a objeto y asegurar el token
                        const formData = new FormData(contactForm);

                        //console.log("Datos a enviar:", Object.fromEntries(formData.entries()));

                        // Envío manual con fetch para mayor control
                        try {
                            // Convertir FormData a URLSearchParams (formato que Formspree espera)
                            const formData = new URLSearchParams();

                            // Añadir manualmente cada campo necesario
                            formData.append('name', contactForm.name.value);
                            formData.append('email', contactForm.email.value);
                            formData.append('subject', contactForm.subject.value);
                            formData.append('service', contactForm.service.value);
                            formData.append('message', contactForm.message.value);
                            formData.append('privacy', contactForm.privacy.checked ? 'true' : 'false');
                            formData.append('g-recaptcha-response', token); // Solo una vez

                            //console.log("Datos finales:", formData.toString());

                            const response = await fetch(contactForm.action, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'Accept': 'application/json'
                                },
                                body: formData
                            });

                            if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(errorData.error || 'Error en el servidor');
                            }

                            contactForm.reset();
                            grecaptcha.reset();

                        } catch (error) {
                            console.error("Error al enviar:", error);
                            alert(`Error: ${error.message}`);
                            grecaptcha.reset();
                        }
                    });
                }
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
        switch (path) {
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
            switch (route) {
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

    async handleRecaptchaRender() {
        try {
            await this.waitForRecaptcha();
            const container = document.getElementById('recaptcha-container');
            if (!container || container.hasAttribute('data-widget-id')) return;

            const widgetId = grecaptcha.render(container, {
                sitekey: this.RECAPTCHA_SITE_KEY,
                /*callback: (token) => {
                    console.log("Token activo:", token);
                },*/
                'expired-callback': () => {
                    console.warn("Token expirado");
                    grecaptcha.reset();
                }
            });
            container.setAttribute('data-widget-id', widgetId);
        } catch (error) {
            console.error("Error al renderizar reCAPTCHA:", error);
        }

    }

    waitForRecaptcha(attempts = 0) {
        return new Promise((resolve, reject) => {
            if (window.grecaptcha && grecaptcha.render) {
                grecaptcha.ready(resolve);
            } else if (attempts < 10) {
                setTimeout(() => this.waitForRecaptcha(attempts + 1).then(resolve), 300);
            } else {
                reject(new Error('reCAPTCHA no cargado después de 3 segundos'));
            }
        });
    }
}