document.addEventListener("DOMContentLoaded", () => {
        document.getElementById('copy').addEventListener('click', ()=> {
        copy_text();
    });
});

const copy_text = () => {
    const element = document.getElementById('copy');
    const text = element.textContent;
    console.log(text);

    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    setTimeout(() => {
        // Android版Chromeはインターバル入れると動作する
        selection.removeAllRanges();
        selection.addRange(range);    
    }, 10);
}
