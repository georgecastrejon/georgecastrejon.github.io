import { languageManager } from './core/_language-manager.js';
import { SPARouter } from './core/_router.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {

        window.languageManager = languageManager;

        await window.languageManager.init();
        // 1. Inicializar gestor de idiomas (espera a que cargue lang)
        
        // 2. Configurar cambio de idioma en el selector
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) {
            langSelector.addEventListener('change', async (e) => {
                await languageManager.changeLanguage(e.target.value);
            });
        }

        // 3. Inicializar el enrutador SPA
        window.spaRouter = new SPARouter();

    } catch (error) {
        console.error("Error al inicializar la aplicación:", error);
        const fallback = `<div class="container py-5"><h2>Error</h2><p>La aplicación no se pudo inicializar. Por favor, recargue la página.</p></div>`;
        document.getElementById('spa-content').innerHTML = fallback;
    }
});
