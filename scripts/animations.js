function switchLanguage(language) {
    const languageText = document.getElementById('selected-language');
    const flagIcon = document.querySelector('.dropbtn .flag-icon');

    // Cambiar el idioma y la bandera según la opción seleccionada
    if (language === 'es') {
        languageText.textContent = 'Español';
        flagIcon.src = 'assets/flags/es.png'; // Ruta de la bandera de España
        window.location.href = 'index.html';  // Redirige a la página en español
    } else if (language === 'en') {
        languageText.textContent = 'English';
        flagIcon.src = 'assets/flags/en.png'; // Ruta de la bandera del Reino Unido
        window.location.href = 'index-en.html';  // Redirige a la página en inglés
    }
}

window.addEventListener('scroll', function () {
    const topMenu = document.querySelector('.menu');
    if (window.scrollY > 50) {
        topMenu.classList.add('scrolled');
    } else {
        topMenu.classList.remove('scrolled');
    }
});

const textElement = document.querySelector('.typing-text'); // Seleccionamos el contenedor del texto
const texts = ["Hola, soy George", "Tengo 12 años de experiencia"]; // Los textos a mostrar
let currentTextIndex = 0; // Índice del texto actual
let currentCharIndex = 0; // Índice del carácter actual
let typingSpeed = 150; // Velocidad de la máquina de escribir (en milisegundos)
let deletingSpeed = 50; // Velocidad al borrar el texto
let isDeleting = false; // Para saber si estamos borrando o escribiendo

// Función que maneja la animación
function type() {
    const currentText = texts[currentTextIndex]; // Texto actual
    if (isDeleting) {
        // Borrar el texto
        textElement.textContent = currentText.substring(0, currentCharIndex - 1);
        currentCharIndex--;
    } else {
        // Escribir el texto
        textElement.textContent = currentText.substring(0, currentCharIndex + 1);
        currentCharIndex++;
    }

    // Controlar la velocidad de escritura y borrado
    if (!isDeleting && currentCharIndex === currentText.length) {
        setTimeout(() => {
            isDeleting = true;
        }, 1000); // Esperar un segundo antes de empezar a borrar
    } else if (isDeleting && currentCharIndex === 0) {
        // Cambiar al siguiente texto y empezar a escribir
        isDeleting = false;
        currentTextIndex = (currentTextIndex + 1) % texts.length;
    }

    // Llamar a la función nuevamente después de un tiempo
    const speed = isDeleting ? deletingSpeed : typingSpeed;
    setTimeout(type, speed);
}

// Iniciar la animación
type();