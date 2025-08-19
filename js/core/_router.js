import { initPortfolioFilters } from '../modules/_portafolio-filter.js';
import { initializeDynamicBootstrapComponents } from '../modules/_bootstrap-helpers.js';
import { NotificationSystem } from './_notification-system.js';
import { FormHandler } from './_form-handler.js';

export class SPARouter {
    constructor() {
        this.routes = {
            '': { template: './views/home.html' },
            'servicios': { template: './views/services.html' },
            'portafolio': { template: './views/portfolio.html' },
            'contacto': { template: './views/contact.html' }
        };
        this.contentContainer = document.getElementById('spa-content');
        this.navLinks = document.querySelectorAll('a[data-route]');

        this.notificationSystem = new NotificationSystem();
        this.formHandler = new FormHandler('6LfiIpUrAAAAABhohXhcpvXNfVA6UL-KC9op2cit');
        this.init();
    }

    async init() {
        window.addEventListener('hashchange', () => this.handleLocationChange());
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigationClick(e));
        });
        await this.handleLocationChange();
    }

    async handleLocationChange() {
        const hash = window.location.hash.slice(1) || '';
        try {
            await this.loadAndDisplayContent(hash);
            this.updateUI(hash);
        } catch (error) {
            console.error('Error en handleLocationChange:', error);
            this.showErrorView();
        }
    }

    handleNavigationClick(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const route = e.target.getAttribute('data-route');
        window.location.hash = route === 'home' ? '' : route;
    }

    async loadAndDisplayContent(path) {
        const routeConfig = this.routes[path] || this.routes[''];
        if (!routeConfig) {
            console.warn(`Ruta no encontrada: ${path}. Cargando página de inicio.`);
            await this.loadAndDisplayContent('');
            return;
        }

        this.contentContainer.innerHTML = '<div class="spa-loading"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';

        try {
            const response = await fetch(routeConfig.template);
            if (!response.ok) throw new Error(`Error al cargar ${routeConfig.template}: ${response.status}`);

            this.contentContainer.innerHTML = await response.text();
            this.initializePageComponents(path);

            if (window.languageManager) {
                window.languageManager.translatePage();
            }
        } catch (error) {
            console.error('Error al cargar el contenido:', error);
            this.contentContainer.innerHTML = `<div class="container py-5"><h2>Error</h2><p>${error.message}</p></div>`;
        }
    }

    initializePageComponents(path) {
        initializeDynamicBootstrapComponents(this.contentContainer);
        this.setupPortfolioFilters();

        if (path === 'contacto') {
            this.setupContactForm();
        }
    }

    setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        contactForm.removeEventListener('submit', this.handleFormSubmit);
        this.handleFormSubmit = this.handleContactForm.bind(this);
        contactForm.addEventListener('submit', this.handleFormSubmit);

        this.formHandler.handleRecaptchaRender().catch(error => {
            console.error("Error inicializando reCAPTCHA:", error);
        });
    }

    async handleContactForm(e) {
        try {
            await this.formHandler.handleContactFormSubmit(e);

            this.notificationSystem.show(
                'success',
                '¡Mensaje enviado!',
                'Hemos recibido tu mensaje correctamente.',
                'Cerrar'
            );

            e.target.reset();
            grecaptcha.reset();

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } catch (error) {
            this.notificationSystem.show(
                'error',
                'Error al enviar',
                error.message,
                error.message.includes('reCAPTCHA') ? 'Recargar' : 'Reintentar'
            );

            if (error.message.includes('reCAPTCHA')) {
                this.notificationSystem.elements.actionBtn.onclick = () => {
                    e.target.reset();
                    grecaptcha.reset();
                };
            }

            grecaptcha.reset();

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }

    setupPortfolioFilters() {
        initPortfolioFilters(this.contentContainer);
    }

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
            const targetHash = route === 'home' ? '' : route;
            link.classList.toggle('active', targetHash === path);
        });
    }

    showErrorView() {
        this.contentContainer.innerHTML = '<div class="container py-5"><h2>Error</h2><p>No se pudo cargar el contenido.</p></div>';
    }
}