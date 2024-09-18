async function exec() {
    console.log("start");

    console.log(window.location.search);
    if (window.location.search.length > 0) {
        const param = new URLSearchParams(window.location.search);
        console.log(param);
        // console.log(param.keys());
        for (const key of param.keys()) {
            console.log(key);
            console.log(param.get(key));
        }
        for (const [key, val] of param) {
            console.log(key);
            console.log(val);
        }
    }
}
