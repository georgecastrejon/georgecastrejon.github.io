import { initPortfolioFilters } from '../modules/_portafolio-filter.js';
import { initializeDynamicBootstrapComponents } from '../modules/_bootstrap-helpers.js';

export class SPARouter {

    //Constructor - configura rutas y elementos del DOM
    constructor() {
        this.RECAPTCHA_SITE_KEY = '6LfiIpUrAAAAABhohXhcpvXNfVA6UL-KC9op2cit';
        this.routes = {
            '': { template: './views/home.html' },
            'servicios': { template: './views/services.html' },
            'portafolio': { template: './views/portfolio.html' },
            'contacto': { template: './views/contact.html' }
        };
        this.contentContainer = document.getElementById('spa-content');
        this.navLinks = document.querySelectorAll('a[data-route]');
        this.init();
    }

    //Inicializa el router, configura eventos y carga contenido inicial
    //Escucha cambios en el hash de la URL y actualiza el contenido
    //Configura los enlaces de navegación para manejar clics y cambios de hash
    init() {
        window.addEventListener('hashchange', () => this.handleLocationChange());
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigationClick(e));
        });
        this.handleLocationChange();
    }

    //Maneja los cambios en la ubicación (hash de la URL)
    //Carga y muestra el contenido correspondiente a la ruta actual
    //Actualiza la interfaz de usuario según la ruta
    async handleLocationChange() {
        const hash = window.location.hash.slice(1) || '';
        await this.loadAndDisplayContent(hash);
        this.updateUI(hash);
    }

    //Maneja los clics en los enlaces de navegación
    //Previene el comportamiento por defecto del enlace y actualiza el hash de la URL
    //Carga el contenido correspondiente a la ruta seleccionada
    handleNavigationClick(e) {
        e.preventDefault();
        const route = e.target.getAttribute('data-route');
        window.location.hash = route === 'home' ? '' : route;
    }

    //Carga y muestra el contenido correspondiente a la ruta especificada
    //Si la ruta no está definida, carga la página de inicio
    //Muestra un mensaje de carga mientras se obtiene el contenido
    //Maneja errores al cargar el contenido y muestra un mensaje de error
    async loadAndDisplayContent(path) {
        const routeConfig = this.routes[path];
        if (!routeConfig) {
            console.warn(`Ruta no encontrada: ${path}. Cargando página de inicio.`);
            await this.loadAndDisplayContent('');
            return;
        }
        const contentPath = routeConfig.template;
        if (!contentPath) {
            console.error(`No se encontró contenido para la ruta ${path}`);
            this.contentContainer.innerHTML = '<div class="container py-5"><h2>Error al cargar el contenido</h2><p>El contenido solicitado no está disponible.</p></div>';
            return;
        }
        this.contentContainer.innerHTML = '<div class="spa-loading"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        try {
            const response = await fetch(contentPath);
            if (!response.ok) {
                throw new Error(`Error al cargar ${contentPath}: ${response.status} ${response.statusText}`);
            }
            const htmlContent = await response.text();
            this.contentContainer.innerHTML = htmlContent;
            this.initializeBootstrapComponents();
            if (window.languageManager) {
                window.languageManager.translatePage();
            }
            if (path === 'contacto') {
                await this.handleRecaptchaRender();
                const contactForm = document.getElementById('contactForm');
                if (contactForm) {
                    contactForm.addEventListener('submit', async (e) => {
                        e.preventDefault();

                        if (!window.grecaptcha) {
                            alert("Error de seguridad. Recarga la página.");
                            return;
                        }

                        const token = grecaptcha.getResponse();
                        if (!token) {
                            alert("Por favor completa el reCAPTCHA");
                            return;
                        }
                        try {
                            const formData = new URLSearchParams();

                            formData.append('name', contactForm.name.value);
                            formData.append('email', contactForm.email.value);
                            formData.append('subject', contactForm.subject.value);
                            formData.append('service', contactForm.service.value);
                            formData.append('message', contactForm.message.value);
                            formData.append('privacy', contactForm.privacy.checked ? 'true' : 'false');
                            formData.append('g-recaptcha-response', token);

                            const response = await fetch(contactForm.action, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'Accept': 'application/json'
                                },
                                body: formData
                            });

                            if (response.ok) {
                                this.showSuccess();
                                contactForm.reset();
                                grecaptcha.reset();
                            } else {
                                const errorData = await response.json();
                                throw new Error(errorData.error || 'Error en el servidor');
                            }

                        } catch (error) {
                            this.showError(error.message);
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

    //Muestra un mensaje de éxito al enviar el formulario de contacto
    //Oculta el mensaje después de 5 segundos
    //Actualiza el texto del mensaje con la traducción correspondiente
    //Si no se encuentra la traducción, usa un mensaje por defecto
    showSuccess() {
        const successElement = document.getElementById('successMessage');
        successElement.style.display = 'block';
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 5000);
    }

    //Muestra un mensaje de error al enviar el formulario de contacto
    //Oculta el mensaje después de 5 segundos
    //Actualiza el texto del mensaje con la traducción correspondiente
    //Si no se encuentra la traducción, usa un mensaje por defecto
    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.style.display = 'block';
        console.debug(message)
        
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }

    //Inicializa los componentes de Bootstrap dinámicos
    initializeBootstrapComponents() {
        initializeDynamicBootstrapComponents(this.contentContainer);
        this.setupPortfolioFilters();
    }

    //Configura los filtros del portafolio
    setupPortfolioFilters() {
        initPortfolioFilters(this.contentContainer);
    }

    //Actualiza la interfaz de usuario según la ruta actual
    //Actualiza el título de la página y los enlaces de navegación
    //Resalta el enlace activo según la ruta actual
    //Si no se encuentra una ruta específica, usa 'home' como predeterminado
    updateUI(path) {
        let titleKey = 'navigation.home';
        switch (path) {
            case 'servicios': titleKey = 'navigation.services'; break;
            case 'portafolio': titleKey = 'navigation.portfolio'; break;
            case 'contacto': titleKey = 'navigation.contact'; break;
        }
        document.title = `QA Expert | ${window.languageManager?.getTranslation(titleKey) || 'QA Expert'}`;
        this.navLinks.forEach(link => {
            const route = link.getAttribute('data-route');
            let targetHash = '';
            switch (route) {
                case 'servicios': targetHash = 'servicios'; break;
                case 'portafolio': targetHash = 'portafolio'; break;
                case 'contacto': targetHash = 'contacto'; break;
                default: targetHash = ''; break;
            }
            link.classList.toggle('active', targetHash === path);
        });
    }

    //Maneja la renderización de reCAPTCHA
    async handleRecaptchaRender() {
        try {
            await this.waitForRecaptcha();
            const container = document.getElementById('recaptcha-container');
            if (!container || container.hasAttribute('data-widget-id')) return;

            const widgetId = grecaptcha.render(container, {
                sitekey: this.RECAPTCHA_SITE_KEY,
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

    //Espera a que reCAPTCHA esté disponible
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