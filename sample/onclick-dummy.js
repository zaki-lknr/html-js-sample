/*
 * write your code
 */

// import {Person} from "./onclick-dummy-library.js";

document.addEventListener("DOMContentLoaded", () => {
    const elm = document.createElement('script');
    elm.src = 'onclick-dummy-library.js';
    // elm.type = 'module';
    // console.log(elm);
    // console.log(document.body);
    document.body.appendChild(elm);
});

const hello_world = () => {
    console.log("hello_world");

    const v = document.getElementById('view');
    v.innerHTML = 'hello <span onclick="press_here()">press here</span>';
}

const press_here = () => {
    console.log("pressed here.");
    const p = new Person("aaa", 17);
    p.hello();

    const version = Person.getVersion();
    console.log('version: ' + version);
}
