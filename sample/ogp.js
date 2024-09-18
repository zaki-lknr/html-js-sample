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

    const ogp = {};
    console.log(d);
    // console.log(d.head);
    console.log(d.title);   // title
    for (const child of d.head.children) {
        if (child.tagName === 'META') {
            // console.log(child);
            // if (child.getAttribute('property')?.startsWith('og:')) {
            //     console.log(child.getAttribute('property'));
            //     console.log(child.getAttribute('content'));
            // }
            switch (child.getAttribute('property')) {
                case 'og:description':
                case 'og:image':
                case 'og:title':
                    console.log(child.getAttribute('property') + ': ' + child.getAttribute('content'));
                    ogp[child.getAttribute('property')] = child.getAttribute('content');
                    break;
            }
            switch (child.getAttribute('name')) {
                case 'twitter:image':
                case 'twitter:title':
                case 'twitter:description':
                    console.log(child.getAttribute('name') + ': ' + child.getAttribute('content'));
                    break;
            }
        }
    }
    console.log(ogp);
}
