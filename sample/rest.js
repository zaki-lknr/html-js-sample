function get_data() {
    const body = localStorage.getItem('rest_response');
    const users = JSON.parse(body);

    var list = document.getElementById("list");

    for (let e of users) {
        // console.log(e);
        // console.log(e.name);
        var item = document.createElement("li");
        item.textContent = e.name;
        list.appendChild(item);
    }
}

async function rest() {
    console.log("start")

    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    // console.log("response: " + res.status);
    // const users = await res.json();  // text()を両方実行は不可
    const body = await res.text();  // json()を両方実行は不可
    // console.log("body: " + body);
    // console.log(users);
    localStorage.setItem('rest_response', body);
    const users = JSON.parse(body);

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
