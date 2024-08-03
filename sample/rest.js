async function rest() {
    console.log("start")

    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    const users = await res.json();
    // console.log(users);

    // users.forEach(function(e) {
    //     console.log(e);
    // });

    // users.forEach(e => {
    //     console.log(e);
    // });

    // users.map(e => {
    //     // console.log(e);
    //     console.log(e.name);
    // })

    var list = document.getElementById("list");

    for (let e of users) {
        // console.log(e);
        // console.log(e.name);
        var item = document.createElement("li");
        item.textContent = e.name;
        list.appendChild(item);
    }
}
