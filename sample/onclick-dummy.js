/*
 * write your code
 */
const hello_world = () => {
    console.log("hello_world");

    const v = document.getElementById('view');
    v.innerHTML = 'hello <span onclick="press_here()">press here</span>';
}

const press_here = () => {
    console.log("pressed here.");
}
