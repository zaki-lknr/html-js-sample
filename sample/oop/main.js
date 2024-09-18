async function method() {
    console.log("method");

    const {Person} = await import("./class.js");

    const ayumu = new Person('ayumu', 17);
    ayumu.hello();

}
