// bonecos.js

function desenharBoneco() {
    const forca = document.getElementById("forca");
    forca.innerHTML = "";

    // Desenhar a estrutura da forca
    const palo = document.createElement("div");
    palo.style.position = "absolute";
    palo.style.bottom = "0px";
    palo.style.left = "83%";
    palo.style.transform = "translateX(-50%)";
    palo.style.width = "2px";
    palo.style.height = "100px";
    palo.style.backgroundColor = "#333";
    forca.appendChild(palo);

    const travessa = document.createElement("div");
    travessa.style.position = "absolute";
    travessa.style.top = "88px";
    travessa.style.left = "60%";
    travessa.style.transform = "translateX(-50%)";
    travessa.style.width = "70px";
    travessa.style.height = "2px";
    travessa.style.backgroundColor = "#333";
    forca.appendChild(travessa);

    const travessaSuperior = document.createElement("div");
    travessaSuperior.style.position = "absolute";
    travessaSuperior.style.bottom = "100px";
    travessaSuperior.style.left = "83%";
    travessaSuperior.style.transform = "translateX(-50%)";
    travessaSuperior.style.width = "2px";
    travessaSuperior.style.height = "60px";
    travessaSuperior.style.backgroundColor = "#333";
    forca.appendChild(travessaSuperior);

    // Desenhar o boneco conforme o número de tentativas restantes
    if (tentativasRestantes <= 5) {
        const cabeca = document.createElement("div");
        cabeca.style.position = "absolute";
        cabeca.style.bottom = "160px";
        cabeca.style.left = "50%";
        cabeca.style.transform = "translateX(-50%)";
        cabeca.style.width = "50px";
        cabeca.style.height = "50px";
        cabeca.style.border = "2px solid blue";
        cabeca.style.borderRadius = "50%";
        forca.appendChild(cabeca);
    }

    if (tentativasRestantes <= 4) {
        const corpo = document.createElement("div");
        corpo.style.position = "absolute";
        corpo.style.bottom = "100px";
        corpo.style.left = "50%";
        corpo.style.transform = "translateX(-50%)";
        corpo.style.width = "2px";
        corpo.style.height = "60px";
        corpo.style.backgroundColor = "blue";
        forca.appendChild(corpo);
    }

    if (tentativasRestantes <= 3) {
        const bracoEsquerdo = document.createElement("div");
        bracoEsquerdo.style.position = "absolute";
        bracoEsquerdo.style.bottom = "130px";
        bracoEsquerdo.style.left = "15%";
        bracoEsquerdo.style.transform = "translateY(-50%) rotate(-45deg)";
        bracoEsquerdo.style.width = "60px";
        bracoEsquerdo.style.height = "2px";
        bracoEsquerdo.style.backgroundColor = "blue";
        forca.appendChild(bracoEsquerdo);
    }

    if (tentativasRestantes <= 2) {
        const bracoDireito = document.createElement("div");
        bracoDireito.style.position = "absolute";
        bracoDireito.style.bottom = "131px";
        bracoDireito.style.right = "16%";
        bracoDireito.style.transform = "translateY(-50%) rotate(45deg)";
        bracoDireito.style.width = "60px";
        bracoDireito.style.height = "2px";
        bracoDireito.style.backgroundColor = "blue";
        forca.appendChild(bracoDireito);
    }

    if (tentativasRestantes <= 1) {
        const pernaEsquerda = document.createElement("div");
        pernaEsquerda.style.position = "absolute";
        pernaEsquerda.style.top = "170px";
        pernaEsquerda.style.left = "15%";
        pernaEsquerda.style.transform = "translateY(0%) rotate(-45deg)";
        pernaEsquerda.style.width = "60px";
        pernaEsquerda.style.height = "2px";
        pernaEsquerda.style.backgroundColor = "blue";
        forca.appendChild(pernaEsquerda);
    }

    if (tentativasRestantes <= 0) {
        const pernaDireita = document.createElement("div");
        pernaDireita.style.position = "absolute";
        pernaDireita.style.top = "169px";
        pernaDireita.style.right = "16%";
        pernaDireita.style.transform = "translateY(0%) rotate(45deg)";
        pernaDireita.style.width = "60px";
        pernaDireita.style.height = "2px";
        pernaDireita.style.backgroundColor = "blue";
        forca.appendChild(pernaDireita);
    }
}
