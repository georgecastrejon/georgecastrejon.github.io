import { initPortfolioFilters } from '../modules/_portafolio-filter.js';
import { initializeDynamicBootstrapComponents } from '../modules/_bootstrap-helpers.js';

export class SPARouter {
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

        this.initNotificationSystem();
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
                    contactForm.removeEventListener('submit', this.handleFormSubmit);
                    this.handleFormSubmit = this.handleContactFormSubmit.bind(this);
                    contactForm.addEventListener('submit', this.handleFormSubmit);
                }
            }

        } catch (error) {
            console.error('Error al cargar el contenido de la página:', error);
            this.contentContainer.innerHTML = `<div class="container py-5"><h2>Error</h2><p>No se pudo cargar el contenido. Por favor, inténtalo de nuevo más tarde.</p><p>Detalles: ${error.message}</p></div>`;
        }
    }

    async handleContactFormSubmit(e) {
        e.preventDefault();
        const contactForm = e.target;

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        if (!window.grecaptcha) {
            this.showNotification(
                'error',
                'Error de seguridad',
                'Por favor recarga la página para habilitar la verificación de seguridad.',
                'Recargar'
            );
            this.notificationElements.actionBtn.onclick = () => {
                window.location.reload();
            };
            return;
        }

        const token = grecaptcha.getResponse();
        if (!token) {
            this.showNotification(
                'error',
                'Verificación requerida',
                'Por favor completa el reCAPTCHA para enviar el formulario.',
                'Entendido'
            );
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
                this.showNotification(
                    'success',
                    '¡Mensaje enviado!',
                    'Hemos recibido tu mensaje correctamente. Nos pondremos en contacto contigo pronto.',
                    'Cerrar'
                );
                contactForm.reset();
                grecaptcha.reset();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en el servidor');
            }
        } catch (error) {
            this.showNotification(
                'error',
                'Error al enviar',
                error.message || 'Hubo un problema al enviar tu mensaje. Por favor inténtalo de nuevo más tarde.',
                'Reintentar'
            );
            grecaptcha.reset();
        }
    }

    initNotificationSystem() {
        const overlay = document.createElement('div');
        overlay.id = 'notificationOverlay';
        overlay.className = 'notification-overlay';

        const popup = document.createElement('div');
        popup.id = 'notificationPopup';
        popup.className = 'notification-popup';

        popup.innerHTML = `
            <button class="close-btn" id="closeNotification">&times;</button>
            <div class="icon">
                <i id="notificationIcon"></i>
            </div>
            <h3 id="notificationTitle"></h3>
            <p id="notificationMessage"></p>
            <button id="notificationAction" class="btn btn-primary mt-3"></button>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        this.notificationElements = {
            overlay,
            popup,
            icon: document.getElementById('notificationIcon'),
            title: document.getElementById('notificationTitle'),
            message: document.getElementById('notificationMessage'),
            actionBtn: document.getElementById('notificationAction'),
            closeBtn: document.getElementById('closeNotification')
        };

        this.notificationElements.closeBtn.addEventListener('click', () => this.hideNotification());
        this.notificationElements.overlay.addEventListener('click', (e) => {
            if (e.target === this.notificationElements.overlay) this.hideNotification();
        });
        this.notificationElements.actionBtn.addEventListener('click', () => this.hideNotification());

    }

    hideNotification() {
        this.notificationElements.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }


    showNotification(type, title, message, actionText) {
        this.notificationElements.popup.className = `notification-popup ${type}`;
        this.notificationElements.icon.className = 'bi ' +
            (type === 'success' ? 'bi-check-circle-fill' :
                type === 'error' ? 'bi-exclamation-circle-fill' :
                    'bi-info-circle-fill');
        this.notificationElements.title.textContent = title;
        this.notificationElements.message.textContent = message;
        this.notificationElements.actionBtn.textContent = actionText;

        this.notificationElements.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }



    initializeBootstrapComponents() {
        initializeDynamicBootstrapComponents(this.contentContainer);
        this.setupPortfolioFilters();
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