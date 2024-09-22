export class Person {
    name;
    age;

    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    hello() {
        console.log('hello, my name is ' + this.name + '.');
        alert('hello, my name is ' + this.name + '.');
    }
}
