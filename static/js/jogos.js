// jogos.js

let dicaAtual;
let letrasAdivinhadas = [];
const tentativasMaximas = 6;
let tentativasRestantes;
let palavraAtual;
let palavras = [];
let dicas = [];

function iniciarJogo() {
    const temaSelecionado = document.getElementById('tema').value;
    carregarTema(temaSelecionado);

    if (palavras.length === 0) {
        alert('Nenhum tema selecionado ou tema inválido.');
        return;
    }

    const indiceAleatorio = Math.floor(Math.random() * palavras.length);
    palavraAtual = palavras[indiceAleatorio];
    dicaAtual = dicas[indiceAleatorio];
    letrasAdivinhadas = [];
    tentativasRestantes = tentativasMaximas;

    atualizarDisplayDoJogo();
    desenharBoneco();
}

function atualizarDisplayDoJogo() {
    let palavraExibida = "";
    for (let i = 0; i < palavraAtual.length; i++) {
        const letra = palavraAtual[i];
        if (letrasAdivinhadas.indexOf(letra) !== -1) {
            palavraExibida += letra;
        } else {
            palavraExibida += "_";
        }
    }

    document.getElementById("palavra").textContent = palavraExibida;
    document.getElementById("dica").textContent = `Dica: ${dicaAtual}`;
    document.getElementById("status").textContent = `Tentativas restantes: ${tentativasRestantes}`;
    document.getElementById("attempts").textContent = `Letras já tentadas: ${letrasAdivinhadas.join(", ")}`;
}

function adivinharLetra() {
    const entradaAdivinhacao = document.getElementById("guess");
    const letraAdivinhada = entradaAdivinhacao.value.toLowerCase();
    
    if (letraAdivinhada.length === 1 && /^[a-záéíóuãöç\s]+$/.test(letraAdivinhada)) {
        if (letrasAdivinhadas.indexOf(letraAdivinhada) === -1) {
            letrasAdivinhadas.push(letraAdivinhada);

            let letraNaoEncontrada = true;
            for (let i = 0; i < palavraAtual.length; i++) {
                if (palavraAtual[i] === letraAdivinhada) {
                    letraNaoEncontrada = false;
                    break;
                }
            }
            if (letraNaoEncontrada) {
                tentativasRestantes--;
            }

            atualizarDisplayDoJogo();
            desenharBoneco(); // Atualiza o boneco

            let palavraCompleta = true;
            for (let i = 0; i < palavraAtual.length; i++) {
                if (letrasAdivinhadas.indexOf(palavraAtual[i]) === -1 && palavraAtual[i] !== " ") {
                    palavraCompleta = false;
                    break;
                }
            }

            if (palavraCompleta) {
                document.getElementById("status").textContent = "Você venceu!";
            } else if (tentativasRestantes <= 0) {
                document.getElementById("status").textContent = `Você perdeu! A palavra era: ${palavraAtual}`;
            }
        }
        entradaAdivinhacao.value = "";
    }
}

function carregarTema(tema) {
    switch (tema) {
        case 'tecnologia':
            palavras = ["computador", "internet", "programação"];
            dicas = ["Dispositivo eletrônico para processamento de dados", "Rede mundial de computadores", "Processo de criação de software"];
            break;
        case 'animais':
            palavras = ["elefante", "tigre", "girafa"];
            dicas = ["O maior animal terrestre", "Um felino conhecido por suas listras", "Um animal com pescoço longo"];
            break;
        case 'frutas':
            palavras = ["maçã", "banana", "laranja"];
            dicas = ["Fruta vermelha e crocante", "Fruta amarela e rica em potássio", "Fruta cítrica rica em vitamina C"];
            break;
        default:
            palavras = [];
            dicas = [];
            break;
    }
}

// Inicie o jogo quando o documento estiver carregado e o tema for selecionado
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('tema').addEventListener('change', iniciarJogo);
    iniciarJogo(); // Inicia o jogo com o tema padrão ou o primeiro disponível
});
