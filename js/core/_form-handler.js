export class FormHandler {
    constructor(recaptchaSiteKey) {
        this.RECAPTCHA_SITE_KEY = recaptchaSiteKey;
    }

    async handleContactFormSubmit(e) {
        e.preventDefault();
        const contactForm = e.target;

        if (!window.grecaptcha) {
            throw new Error('reCAPTCHA no está disponible');
        }

        const token = grecaptcha.getResponse();
        if (!token) {
            throw new Error('Por favor completa el reCAPTCHA');
        }

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

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en el servidor');
        }

        return response;
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
            throw error;
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