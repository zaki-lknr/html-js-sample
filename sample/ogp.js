async function get_ogp() {
    console.log("start")

    const url = document.getElementById("sample_url").value;
    // console.log(url);
    // if (url == null) {
    //     console.log("null");
    // }
    // if (url.startsWith('http')) {
    //     console.log("start http");
    // }
    // console.log(url.length);
    const proxy_url = 'https://corsproxy.io/?' + encodeURIComponent(url);

    // const headers = new Headers();
    // headers.append('Access-Control-Allow-Origin', '*');

    // const res = await fetch(url, { method: "GET", headers: headers, mode: 'cors' });
    const res = await fetch(proxy_url);
    const t = await res.text();
    const d = new DOMParser().parseFromString(t, "text/html");

    console.log(d);
    // console.log(d.head);
    console.log(d.title);   // title
    for (const child of d.head.children) {
        if (child.tagName === 'META') {
            // console.log(child);
            if (child.getAttribute('property')?.startsWith('og:')) {
                console.log(child);
            }
        }
    }
}
