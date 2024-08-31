function save_configure() {
    const bsky_id = document.getElementById("bsky_id").value;
    const bsky_pass = document.getElementById("bsky_pass").value;

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
    // console.log("start")
    const configure = load_configure();
    const message = document.getElementById("post_string").value;
    const image_url = document.getElementById("image_url").value;

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
    const response = await get_session(configure.bsky_id, configure.bsky_pass);
    post_message(message, image_url, response, configure.bsky_id);
}

async function get_session(bsky_id, bsky_pass) {

    // create session
    const url = "https://bsky.social/xrpc/com.atproto.server.createSession";
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const body = JSON.stringify({
        identifier: bsky_id,
        password: bsky_pass
    });

    const res = await fetch(url, { method: "POST", body: body, headers: headers });
    if (!res.ok) {
        throw new Error('com.atproto.server.createSession failed: ' + await res.text());
    }

    const response = await res.json();
    return response;
}

async function post_message(message, image_url, session, bsky_id) {
    // リンクを含むか確認
    const url_obj = search_url_pos(message);
    const update_msg = (url_obj != null && 'short' in url_obj)? url_obj.short.message: message;

    // 添付画像URL
    let image_blob = null;
    let ogp = null;
    if (image_url.startsWith('http')) {
        image_blob = await post_image(session, null, image_url);
        // console.log(image_blob);
        // console.log(image_blob.mimeType);
    }
    else if (url_obj != null) {
        // 添付画像はないけどURLがある場合
        ogp = await get_ogp(url_obj.url);
        // console.log(ogp);
        image_blob = await post_image(session, null, ogp['og:image']);
    }

    const url = "https://bsky.social/xrpc/com.atproto.repo.createRecord";
    const headers = new Headers();
    headers.append('Authorization', "Bearer " + session.accessJwt);
    headers.append('Content-Type', 'application/json');

    const body = {
        repo: bsky_id,
        collection: "app.bsky.feed.post",
        record: {
            text: update_msg,
            createdAt: new Date().toISOString(),
            $type: "app.bsky.feed.post",
            facets: [],
            via: 'NJGK'
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

    if (url_obj != null) {
        // console.log('start: ' + url_obj.start + ", end: " + url_obj.end + ', url: ' + url_obj.url);
        // リンクあり
        body.record.facets = [
            {
                index: {
                    byteStart: url_obj.start,
                    byteEnd: ('short' in url_obj)? url_obj.start + url_obj.short.len: url_obj.end,
                },
                features: [{
                    $type: 'app.bsky.richtext.facet#link',
                    uri: url_obj.url
                }]
            }
        ]

        if (ogp != null) {
            // OGP情報があればその内容を表示
            body.record.embed = {
                $type: "app.bsky.embed.external",
                external: {
                    uri: url_obj.url,
                    title: ogp['og:title'],
                    description: ogp['og:description'],
                    thumb: image_blob
                }
            }
        }
    }
    // console.log(body);

    const tags = search_tag_pos(update_msg);
    if (tags != null) {
        for (const tag of tags) {
            // hashtagがある場合
            body.record.facets.push({
                index: {
                    byteStart: tag.start,
                    byteEnd: tag.end
                },
                features: [{
                    $type: 'app.bsky.richtext.facet#tag',
                    tag: tag.tag.replace(/^#/, ''),
                }]
            });
        }
    }


    const res = await fetch(url, { method: "POST", body: JSON.stringify(body), headers: headers });
    if (!res.ok) {
        throw new Error(url + ': ' + await res.text());
    }
    const response = await res.text();

}

async function post_image(session, image_file, image_url) {
    let image_blob;
    let image_type;

    if (image_file != null) {
    }
    else {
        // get image
        const res_img = await fetch('https://corsproxy.io/?' + encodeURIComponent(image_url));
        if (!res_img.ok) {
            throw new Error('https://corsproxy.io/?' + encodeURIComponent(image_url) + ': ' + await res_img.text());
        }
        const image = await res_img.blob();
        // console.log('size: ' + image.size);
        // console.log('type: ' + image.type);
        const buffer = await image.arrayBuffer();
        image_blob = new Uint8Array(buffer);
        image_type = image.type;
    }

    // const inputfile = document.getElementById("file").files[0];
    // console.log(inputfile);

    const url = "https://bsky.social/xrpc/com.atproto.repo.uploadBlob";
    const headers = new Headers();
    headers.append('Authorization', "Bearer " + session.accessJwt);
    headers.append('Content-Type', image_type);
    
    const res = await fetch(url, { method: "POST", body: image_blob, headers: headers });
    if (!res.ok) {
        throw new Error('https://bsky.social/xrpc/com.atproto.repo.uploadBlob: ' + await res.text());
    }
    const res_json = await res.json()
    // console.log(res_json);
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
    // 長いURLを短縮
    const url_obj = new URL(match[0]);
    const short = {};
    if (match[0].length - url_obj.origin.length > 15) {
        const short_url = match[0].substring(0, url_obj.origin.length + 15) + '...';
        short.url = short_url;
        short.len = short_url.length;
        short.message = message.substring(0, start) + short_url + message.substring(start + match[0].length);
    }

    const result = {
        start: pos,
        end: pos + match[0].length,
        url: match[0],
    }
    if (Object.keys(short).length != 0) {
        result.short = short;
    }
    return result;
}

function search_tag_pos(message) {
    const result = [];
    const regex = RegExp(/\#\S+/, 'g');
    let e;
    while (e = regex.exec(message)) {
        const tag = message.substring(e.index, e.index + e[0].length);
        const start = new Blob([message.substring(0, e.index)]).size;
        const end = start + new Blob([tag]).size;
        const item = {
            start: start,
            end: end,
            tag: tag,
        }
        result.push(item);
    }
    return result;
}

async function get_ogp(url) {
    const proxy_url = 'https://corsproxy.io/?' + encodeURIComponent(url);
    const res = await fetch(proxy_url);
    if (!res.ok) {
        throw new Error('https://corsproxy.io/?' + encodeURIComponent(url) + ': ' + await res.text());
    }
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
