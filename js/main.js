import { languageManager } from './core/_language-manager.js';
import { SPARouter } from './core/_router.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await languageManager.preloadLanguages();
        window.languageManager = languageManager;
        await window.languageManager.init();
        window.spaRouter = new SPARouter();

        window.addEventListener('resize', () => {
            languageManager.applyResponsiveDropdownStyles();
            languageManager.updateLanguageSelector();
        });
        languageManager.applyResponsiveDropdownStyles();

    } catch (error) {
        console.error("Error al inicializar la aplicación:", error);
    }
});


