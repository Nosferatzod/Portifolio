// temas.js

const temas = {
    tecnologia: {
        palavras: [
            "computador",
            "internet",
            "programacao"
        ],
        dicas: [
            "Dispositivo eletrônico para processamento de dados",
            "Rede mundial de computadores",
            "Processo de criação de software"
        ]
    },
    animais: {
        palavras: [
            "elefante",
            "girafa",
            "tigre"
        ],
        dicas: [
            "Grande mamífero com tromba",
            "Animal com pescoço longo",
            "Felino grande e feroz"
        ]
    },
    frutas: {
        palavras: [
            "banana",
            "maca",
            "laranja"
        ],
        dicas: [
            "Fruta amarela e curva",
            "Fruta vermelha e crocante",
            "Fruta cítrica e laranja"
        ]
    }
};

function escolherTema() {
    const selectTema = document.getElementById("tema");
    selectTema.addEventListener("change", function() {
        const temaSelecionado = this.value;
        atualizarTema(temaSelecionado);
    });

    // Inicializa o jogo com o tema padrão
    atualizarTema(selectTema.value);
}

function atualizarTema(tema) {
    if (temas[tema]) {
        palavras = temas[tema].palavras;
        dicas = temas[tema].dicas;
        iniciarJogo();
    }
}

// Inicializa a escolha de tema quando a página carrega
document.addEventListener("DOMContentLoaded", escolherTema);
