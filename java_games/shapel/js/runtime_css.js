
let randomCol = Math.floor(Math.random() * 255);
let styles = `
    div {
        color: rgb(${randomCol}, 230, 222);
    }
`
let styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

alert(styleSheet.textContent);
styles = `
    .square {
        color: rgb(${randomCol}, 230, 222);
    }
`
styleSheet.textContent = styles;