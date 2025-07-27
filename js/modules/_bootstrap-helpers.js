/**
 * Inicializa componentes de Bootstrap que pueden haberse agregado dinámicamente al DOM.
 * @param {HTMLElement} containerElement - El elemento contenedor donde buscar componentes.
 */
export function initializeDynamicBootstrapComponents(containerElement) {
    // Verificar que Bootstrap esté disponible globalmente
    if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip) {
        console.warn('Bootstrap no está disponible. No se pueden inicializar componentes dinámicos.');
        return;
    }

    // --- Inicializar Tooltips ---
    const tooltipTriggerList = [].slice.call(
        containerElement.querySelectorAll('[data-bs-toggle="tooltip"]:not([data-bs-initialized])')
    );
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
        // Marcar como inicializado para evitar reinicializaciones
        tooltipTriggerEl.setAttribute('data-bs-initialized', 'true');
    });

    // --- Aquí podrías añadir la inicialización de otros componentes de Bootstrap ---
    // Por ejemplo, Popovers:
    /*
    const popoverTriggerList = [].slice.call(
        containerElement.querySelectorAll('[data-bs-toggle="popover"]:not([data-bs-initialized])')
    );
    popoverTriggerList.forEach(popoverTriggerEl => {
        new bootstrap.Popover(popoverTriggerEl);
        popoverTriggerEl.setAttribute('data-bs-initialized', 'true');
    });
    */
}