export function initializeDynamicBootstrapComponents(containerElement) {
    if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip) {
        console.warn('Bootstrap no está disponible. No se pueden inicializar componentes dinámicos.');
        return;
    }
    const tooltipTriggerList = [].slice.call(
        containerElement.querySelectorAll('[data-bs-toggle="tooltip"]:not([data-bs-initialized])')
    );
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
        tooltipTriggerEl.setAttribute('data-bs-initialized', 'true');
    });

}