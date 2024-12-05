document.addEventListener('DOMContentLoaded', () => {
    const text = [
        "La calidad no es un acto, es un hábito.",
        "Automatiza tus procesos, no tus valores.",
        "Las pruebas no son para encontrar errores, son para construir confianza."
    ];
    const animatedText = document.querySelector('.animated-text');
    let i = 0;

    function updateText() {
        animatedText.textContent = text[i];
        i = (i + 1) % text.length;
    }

    setInterval(updateText, 3000);
    updateText();
});
