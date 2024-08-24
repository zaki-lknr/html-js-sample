function save_configure() {
    let bsky_id = document.getElementById("bsky_id").value;
    let bsky_pass = document.getElementById("bsky_pass").value;

    const zzz_configuration = {
        bsky_id: bsky_id,
        bsky_pass: bsky_pass
    }
    // save to local storage
    localStorage.setItem('zzz_configuration', JSON.stringify(zzz_configuration));
}

function load_configure() {
    // console.log("load_configure() begin");

    // load from local storage
    const zzz_configuration = localStorage.getItem('zzz_configuration');
    // console.log('configure: ' + swarm_configure);

    const configure = JSON.parse(zzz_configuration);
    // update page
    // console.log('token: '+ configure);

    document.getElementById("bsky_id").value = configure.bsky_id;
    document.getElementById("bsky_pass").value = configure.bsky_pass;

    return configure;
}

async function post() {
    console.log("start")

    // let message = document.getElementById("post_string").value;
    // // let message = 'YouTube https://www.youtube.com/ です。';
    // // let message = 'うまれたトキメキ';
    // let message = 'ユーチューブ https://www.youtube.com/ です';
    // let result = search_url_pos(message);
    // if (result != null) {
    //     console.log('start: ' + result[0]);
    //     console.log('end: ' + result[1]);
    //     console.log('str: ' + result[2]);
    // }
    const response = await get_session();
    post_message(response);
}

async function get_session() {
    const configure = load_configure();

    // create session
    const url = "https://bsky.social/xrpc/com.atproto.server.createSession";
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const body = JSON.stringify({
        identifier: configure.bsky_id,
        password: configure.bsky_pass
    });

    const res = await fetch(url, { method: "POST", body: body, headers: headers });

    const response = await res.json();
    return response;
}

async function post_message(session) {
    const configure = load_configure();

    const message = document.getElementById("post_string").value;

    // リンクを含むか確認
    const url_text = search_url_pos(message);

    // 添付画像URL
    const image_url = document.getElementById("image_url").value;
    let image_blob = null;
    let ogp = null;
    if (image_url.startsWith('http')) {
        image_blob = await post_image(session, image_url);
        // console.log(image_blob);
        // console.log(image_blob.mimeType);
    }
    else if (url_text != null) {
        // 添付画像はないけどURLがある場合
        ogp = await get_ogp(url_text[2]);
        console.log(ogp);
        image_blob = await post_image(session, ogp['og:image']);
    }

    const url = "https://bsky.social/xrpc/com.atproto.repo.createRecord";
    const headers = new Headers();
    headers.append('Authorization', "Bearer " + session.accessJwt);
    headers.append('Content-Type', 'application/json');

    let body = {
        repo: configure.bsky_id,
        collection: "app.bsky.feed.post",
        record: {
            text: message,
            createdAt: new Date().toISOString(),
            $type: "app.bsky.feed.post",
        }
    };

    if (image_blob != null) {
        // 画像指定あり
        body.record.embed = {
            $type: "app.bsky.embed.images",
            images: [
                {
                    image: image_blob,
                    alt: "sample image upload",
                },
            ]
        }
    }

    if (url_text != null) {
        console.log('start: ' + url_text[0] + ", end: " + url_text[1] + ', url: ' + url_text[2]);
        // リンクあり
        body.record.facets = [
            {
                index: {
                    byteStart: url_text[0],
                    byteEnd: url_text[1]
                },
                features: [{
                    $type: 'app.bsky.richtext.facet#link',
                    uri: url_text[2]
                }]
            }
        ]

        if (ogp != null) {
            // OGP情報があればその内容を表示
            body.record.embed = {
                $type: "app.bsky.embed.external",
                external: {
                    uri: url_text[2],
                    title: ogp['og:title'],
                    description: ogp['og:description'],
                    thumb: image_blob
                }
            }
        }
    }


    const res = await fetch(url, { method: "POST", body: JSON.stringify(body), headers: headers });
    console.log(res.status);
    const response = await res.text();

}

async function post_image(session, image_url) {
    // get image
    const res_img = await fetch(image_url);
    const image = await res_img.blob();
    console.log('size: ' + image.size);
    console.log('type: ' + image.type);
    const buffer = await image.arrayBuffer();
    const array = new Uint8Array(buffer);

    const url = "https://bsky.social/xrpc/com.atproto.repo.uploadBlob";
    const headers = new Headers();
    headers.append('Authorization', "Bearer " + session.accessJwt);
    headers.append('Content-Type', image.type);
    
    const res = await fetch(url, { method: "POST", body: array, headers: headers });
    const res_json = await res.json()
    console.log(res_json);
    return res_json.blob;
}

function search_url_pos(message) {
    // const start = message.indexOf('http');
    const start = message.search('https?://');
    // console.log(start);
    if (start < 0) {
        return null;
    }
    // バイトサイズの位置に変換
    const pos = new Blob([message.substring(0,start)]).size;
    // URL文字列長取得
    const match = message.match('https?://[a-zA-Z0-9/:%#\$&\?\(\)~\.=\+\-_]+');
    // console.log(match);
    return [pos, (pos + match[0].length), match[0]];
}

async function get_ogp(url) {
    const proxy_url = 'https://corsproxy.io/?' + encodeURIComponent(url);
    const res = await fetch(proxy_url);
    const t = await res.text();
    const d = new DOMParser().parseFromString(t, "text/html");
    const ogp = {};

    for (const child of d.head.children) {
        if (child.tagName === 'META') {
            switch (child.getAttribute('property')) {
                case 'og:description':
                case 'og:image':
                case 'og:title':
                    // console.log(child.getAttribute('property') + ': ' + child.getAttribute('content'));
                    ogp[child.getAttribute('property')] = child.getAttribute('content');
                    break;
            }
            // switch (child.getAttribute('name')) {
            //     case 'twitter:image':
            //     case 'twitter:title':
            //     case 'twitter:description':
            //         console.log(child.getAttribute('name') + ': ' + child.getAttribute('content'));
            //         break;
            // }
        }
    }
    return ogp;
}
