# Portfólio — Kauã Francino

Portfólio pessoal em HTML, CSS e JavaScript puros. Sem build, sem dependências,
sem framework — é só abrir os arquivos ou publicar a pasta.

**Recursos:** tema claro/escuro, 3 idiomas (pt-BR / en / es) com detecção automática,
animações com respeito a `prefers-reduced-motion`, e todas as imagens em WebP.

---

## Estrutura

```
index.html      Home — hero, stack, projetos em destaque
projects.html   Grade completa de projetos, com filtros por categoria
about.html      Trajetória, formação e stack
contact.html    Formulário (Formspree) + canais de contato

css/main.css    Design system: tokens, tema, header, rodapé, componentes
css/pages.css   Estilos de cada seção/página

js/i18n.js      TODOS os textos do site, nos 3 idiomas
js/main.js      Tema, idioma, navegação, animações
js/contact.js   Validação e envio do formulário

pages/, static/ Jogo da Forca embutido (projeto à parte, não usa o design system)
```

---

## Como editar

### Trocar um texto

Todo o conteúdo vive em [`js/i18n.js`](js/i18n.js) — **não edite o texto no HTML**.
O HTML só marca onde cada chave entra:

```html
<h2 data-i18n="featured.title">Projetos em destaque</h2>
```

O texto que fica no HTML é apenas um fallback para o caso de o JavaScript
não carregar. Para mudar o que aparece, edite a chave nos três idiomas:

```js
featured: { title: 'Projetos em destaque' }   // pt-BR
featured: { title: 'Featured projects' }      // en
featured: { title: 'Proyectos destacados' }   // es
```

Variantes disponíveis no HTML:

| Atributo | O que traduz |
|---|---|
| `data-i18n` | texto do elemento |
| `data-i18n-ph` | `placeholder` |
| `data-i18n-aria` | `aria-label` |
| `data-i18n-title` | `<title>` da página ou atributo `title` |
| `data-i18n-content` | `content` (usado nas meta tags) |

### Adicionar um projeto

1. Adicione a descrição em `js/i18n.js`, dentro de `proj:`, nos 3 idiomas:
   ```js
   proj: { meuProjeto: 'Descrição curta do que o projeto faz.' }
   ```
2. Copie um bloco `<a class="project">` em `projects.html` e ajuste `href`,
   `src` da imagem, título e `data-i18n="proj.meuProjeto"`.
3. Escolha a categoria em `data-category`: `app`, `theme` ou `game`.
   Os contadores dos filtros se atualizam sozinhos.

Se a imagem for um logo ou ícone (e não um print), acrescente a classe
`project__img--contain` para ela respirar em vez de esticar.

### Mexer no cartão de código

No lugar de uma foto, o hero e a página Sobre mostram um cartão estilizado como
janela de editor, que se "digita" sozinho ao entrar na tela. Não há imagem
envolvida — é HTML, CSS e alguns tokens de sintaxe.

Cada linha é uma `<span class="cc-line">` com uma `<span class="cc-txt">` dentro
(a de fora segura o cursor, a de dentro é o que vai sendo revelado). Dentro dela
vão os tokens: `cc-kw`, `cc-prop`, `cc-str`, `cc-num`, `cc-fn`, `cc-punc`,
`cc-com`. A indentação são espaços de verdade — o CSS usa `white-space: pre`.

Para trocar uma linha, edite o HTML direto. Os textos que mudam de idioma
(cargo, foco, comentário) saem de `code:` no [`js/i18n.js`](js/i18n.js), e os
valores de string **já incluem as aspas** — o token inteiro é um span só.

A última linha leva também `cc-line--last`: é ela que fica com o cursor piscando
no fim. Se você adicionar linhas depois dela, mova a classe.

O ritmo da digitação está em `initCodeCards()` no [`js/main.js`](js/main.js):
`MS_PER_CHAR` e `LINE_GAP`. O JS só mede quantos caracteres cada linha tem e
escreve `--n`, `--dur` e `--d`; quem anima é o CSS.

### Adicionar um idioma

Em `js/i18n.js`, duplique um bloco de idioma inteiro e registre o código em
`window.I18N_LANGS`. O seletor do header e o `<select>` do menu mobile se
montam a partir dessa lista. Chaves faltando caem automaticamente no pt-BR.

### Mudar as cores

Tudo sai dos tokens no topo de `css/main.css`. Existem dois blocos de paleta
(claro e escuro) — mexa em `--accent` / `--accent-2` para trocar a cor de marca:

```css
--accent:   #da3b1f;   /* vermilion */
--accent-2: #e08327;   /* âmbar */
```

O bloco escuro aparece duas vezes de propósito: uma para `prefers-color-scheme`
(quem nunca clicou no botão) e outra para `[data-theme="dark"]` (escolha explícita).
Altere os dois.

---

## Notas de implementação

- **Sem flash de tema.** Um script inline no `<head>` de cada página lê o
  `localStorage` e aplica `data-theme` antes da primeira pintura.
- **Animações baratas.** Só `transform` e `opacity`. As revelações usam
  `IntersectionObserver` (dispara uma vez e desconecta), o scroll usa listener
  passivo com `requestAnimationFrame`, e a barra de progresso usa
  `animation-timeline: scroll()` onde houver suporte, sem JS.
- **`prefers-reduced-motion`** desliga tudo que se move.
- **Ponteiro fino.** O halo que segue o cursor nos cartões só é registrado em
  dispositivos com mouse — o celular não paga por ele.
- **Imagens.** Todas em WebP, com `loading="lazy"` fora da primeira dobra.
  As animadas foram redimensionadas para o tamanho real dos cartões.
- **Cartão de código.** A digitação é só `clip-path` e `transform`, com
  `steps()` para o efeito de caractere a caractere — nada de JS por frame.
  Em fonte monoespaçada `1ch` é exatamente um caractere, então a mesma variável
  `--n` serve de contagem de passos e de posição final do cursor. Sem JS o
  código simplesmente aparece inteiro; com `prefers-reduced-motion` também,
  com o cursor parado no fim.
- **`og:image`.** `images/og-card.png` (1200×630) é o cartão que aparece quando
  o link é colado no LinkedIn ou no WhatsApp.

## Publicar

É um site estático: sirva a pasta como está.

```bash
python -m http.server 8000     # teste local -> http://localhost:8000
```

No GitHub Pages, basta apontar para a branch — não há passo de build.

## Formulário de contato

Vai para o [Formspree](https://formspree.io) pelo endpoint em
`contact.html` (`action` do `<form>`). Para trocar a conta, mude essa URL.
