export class NotificationSystem {
    constructor() {
        this.initNotificationSystem();
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

        this.elements = {
            overlay,
            popup,
            icon: document.getElementById('notificationIcon'),
            title: document.getElementById('notificationTitle'),
            message: document.getElementById('notificationMessage'),
            actionBtn: document.getElementById('notificationAction'),
            closeBtn: document.getElementById('closeNotification')
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.elements.closeBtn.addEventListener('click', () => this.hide());
        this.elements.overlay.addEventListener('click', (e) => {
            if (e.target === this.elements.overlay) this.hide();
        });
        this.elements.actionBtn.addEventListener('click', () => this.hide());
    }

    hide() {
        this.elements.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    show(type, title, message, actionText) {
        this.elements.popup.className = `notification-popup ${type}`;
        this.elements.icon.className = 'bi ' +
            (type === 'success' ? 'bi-check-circle-fill' :
                type === 'error' ? 'bi-exclamation-circle-fill' :
                    'bi-info-circle-fill');
        this.elements.title.textContent = title;
        this.elements.message.textContent = message;
        this.elements.actionBtn.textContent = actionText;

        this.elements.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}