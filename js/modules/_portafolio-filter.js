export function initPortfolioFilters(containerElement) {
    const filterButtons = containerElement.querySelectorAll('.filter-btn');
    const projectItems = containerElement.querySelectorAll('.project-item');
    if (filterButtons.length > 0 && projectItems.length > 0) {
        let activeButton = containerElement.querySelector('.filter-btn.active') || filterButtons[0];
        const handleClick = (button) => {
            if (activeButton) {
                activeButton.classList.remove('active');
            }
            button.classList.add('active');
            activeButton = button;
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
             button.addEventListener('click', () => handleClick(button));
        });
        if (!containerElement.querySelector('.filter-btn.active') && filterButtons[0]) {
             handleClick(filterButtons[0]);
        }
    }
}