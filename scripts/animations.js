function switchLanguage(language) {
    const languageText = document.getElementById('selected-language');
    const flagIcon = document.querySelector('.dropbtn .flag-icon');

    // Cambiar el idioma y la bandera según la opción seleccionada
    if (language === 'es') {
        languageText.textContent = 'Español';
        flagIcon.src = 'assets/flags/es.svg'; // Ruta de la bandera de España
        window.location.href = 'index.html';  // Redirige a la página en español
    } else if (language === 'en') {
        languageText.textContent = 'English';
        flagIcon.src = 'assets/flags/en.svg'; // Ruta de la bandera del Reino Unido
        window.location.href = 'index-en.html';  // Redirige a la página en inglés
    }

}