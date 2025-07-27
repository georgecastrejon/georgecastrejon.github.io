export function initPortfolioFilters(containerElement) { // Acepta un contenedor para delegación
    // Lógica para los filtros del portafolio
    const filterButtons = containerElement.querySelectorAll('.filter-btn');
    const projectItems = containerElement.querySelectorAll('.project-item');

    if (filterButtons.length > 0 && projectItems.length > 0) {
        // Asumimos que solo un botón puede estar activo a la vez
        let activeButton = containerElement.querySelector('.filter-btn.active') || filterButtons[0]; // Por defecto, el primero o el activo

        const handleClick = (button) => {
            // Remover clase 'active' del botón previamente activo
            if (activeButton) {
                activeButton.classList.remove('active');
            }
            // Agregar clase 'active' al botón clickeado
            button.classList.add('active');
            activeButton = button; // Actualizar referencia

            const filter = button.getAttribute('data-filter');
            projectItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        };

        filterButtons.forEach(button => {
            // Asignar el manejador de clic directamente aquí
             button.addEventListener('click', () => handleClick(button));
        });

        // Opcional: Activar el filtro inicial si no hay ninguno activo
        if (!containerElement.querySelector('.filter-btn.active') && filterButtons[0]) {
             handleClick(filterButtons[0]);
        }
    }
}