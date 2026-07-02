document.addEventListener('DOMContentLoaded', function() {
    // Menu mobile
    const toggleButton = document.getElementById('toggleButton');
    const navbar = document.querySelector('.navbar');
    
    if(toggleButton && navbar) {
        toggleButton.addEventListener('click', function() {
            navbar.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

    // Efeito de digitação (Mantido conforme solicitado)
    const typingText = document.querySelector('.typing-text');
    if(typingText) {
        const text = typingText.textContent;
        typingText.textContent = '';
        
        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                typingText.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                // Mantém o cursor piscando estático no final
                typingText.style.borderRight = '3px solid var(--accent-pink)';
            }
        }
        
        typeWriter();
    }
});