document.addEventListener('DOMContentLoaded', function() {
    // Menu mobile
    const toggleButton = document.getElementById('toggleButton');
    const navbar = document.querySelector('.navbar');
    
    toggleButton.addEventListener('click', function() {
        navbar.classList.toggle('active');
        this.classList.toggle('active');
    });

    // Efeito de digitação
    const typingText = document.querySelector('.typing-text');
    const text = typingText.textContent;
    typingText.textContent = '';
    
    let i = 0;
    function typeWriter() {
        if (i < text.length) {
            typingText.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        } else {
            // Mantém o cursor piscando
            typingText.style.borderRight = '3px solid var(--accent-pink)';
        }
    }
    
    typeWriter();

    // Animação do indicador de navegação
    const navLinks = document.querySelectorAll('.nav-link');
    const navIndicator = document.querySelector('.nav-indicator');
    
    function moveIndicator(el) {
        navIndicator.style.width = `${el.offsetWidth}px`;
        navIndicator.style.left = `${el.offsetLeft}px`;
    }
    
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            moveIndicator(link);
        });
        
        if (link.classList.contains('active')) {
            moveIndicator(link);
        }
    });

    // Efeito de transição entre páginas
    const pageLinks = document.querySelectorAll('a[data-transition]');
    const transitionLine = document.querySelector('.transition-line');
    
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.href && this.href !== '#' && !this.href.includes('javascript')) {
                e.preventDefault();
                
                // Animação de saída
                transitionLine.style.width = '100%';
                transitionLine.style.height = '100%';
                transitionLine.style.borderRadius = '0';
                transitionLine.style.background = 'linear-gradient(135deg, var(--accent-red), var(--accent-blue))';
                
                setTimeout(() => {
                    window.location.href = this.href;
                }, 800);
            }
        });
    });
    
    // Verifica se é uma transição de entrada
    if (performance.navigation.type === 1 || performance.navigation.type === 0) {
        transitionLine.style.width = '100%';
        transitionLine.style.height = '100%';
        transitionLine.style.borderRadius = '0';
        transitionLine.style.background = 'linear-gradient(135deg, var(--accent-red), var(--accent-blue))';
        
        setTimeout(() => {
            transitionLine.style.width = '0';
            transitionLine.style.height = '4px';
            transitionLine.style.borderRadius = '0';
        }, 800);
    }
    
    // Efeito parallax suave
    window.addEventListener('scroll', function() {
        const scrollPosition = window.pageYOffset;
        const avatar = document.querySelector('.avatar');
        const heroContent = document.querySelector('.hero-content');
        
        if (avatar) {
            avatar.style.transform = `translateY(${scrollPosition * 0.2}px)`;
        }
        
        if (heroContent) {
            heroContent.style.transform = `translateY(${scrollPosition * 0.1}px)`;
        }
    });
});