import { languageManager } from './core/_language-manager.js';
import { SPARouter } from './core/_router.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        window.languageManager = languageManager;
        await window.languageManager.init();
        
        /*const langSelector = document.getElementById('languageSelector');
        if (langSelector) {
            langSelector.addEventListener('change', async (e) => {
                await languageManager.changeLanguage(e.target.value);
            });
        }*/
        window.spaRouter = new SPARouter();
    } catch (error) {
        console.error("Error al inicializar la aplicación:", error);
        const fallback = `<div class="container py-5"><h2>Error</h2><p>La aplicación no se pudo inicializar. Por favor, recargue la página.</p></div>`;
        document.getElementById('spa-content').innerHTML = fallback;
    }
});
