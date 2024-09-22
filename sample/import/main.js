import { Person } from "./library.js";

const exec = () => {
    console.log("exec");

    const ayumu = new Person('ayumu', 17);
    ayumu.hello();
}

document.getElementById('button').addEventListener('click', ()=> {
    exec();
});
