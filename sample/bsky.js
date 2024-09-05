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
    const local_image = document.getElementById("file").files[0];

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
    post_message(message, local_image, image_url, response, configure.bsky_id);
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

async function post_message(message, local_image, image_url, session, bsky_id) {
    // リンクを含むか確認
    const url_objs = search_url_pos(message);
    // console.log(url_objs);
    const update_msg = (url_objs != null)? url_objs[0].disp_message: message;

    // 添付画像URL
    let image_blob = null;
    let ogp = null;
    if (local_image != null) {
        image_blob = await post_image(session, local_image, null);
    }
    else if (image_url.startsWith('http')) {
        image_blob = await post_image(session, null, image_url);
        // console.log(image_blob);
        // console.log(image_blob.mimeType);
    }
    else if (url_objs != null) {
        // 添付画像はないけどURLがある場合
        ogp = await get_ogp(url_objs[0].url);
        if (ogp['og:image']) {
            image_blob = await post_image(session, null, ogp['og:image']);
        }
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

    if (url_objs != null) {
        // リンクあり
        body.record.facets = [];
        for (const item of url_objs) {
            const facet = {
                index: {
                    byteStart: item.start,
                    byteEnd: item.end,
                },
                features: [{
                    $type: 'app.bsky.richtext.facet#link',
                    uri: item.url
                }]
            }
            body.record.facets.push(facet);
        }

        if (ogp != null) {
            // OGP情報があればその内容を表示
            body.record.embed = {
                $type: "app.bsky.embed.external",
                external: {
                    uri: url_objs[0].url,
                    title: ogp['title'],
                    description: ogp['og:description'] || "",
                }
            }
            if (image_blob) {
                // 画像がある場合のみ追加 (無い場合は省略)
                body.record.embed.external.thumb = image_blob;
            }
        }
    }
    // console.log(body);
    // if (message.search('@3rdhakatadaruma')) {
    //     const f = get_url_facet(message, '@3rdhakatadaruma', 'https://x.com/3rdhakatadaruma');
    //     body.record.facets.push(f);
    // }

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
    console.log('posting... ' + res.status);
    if (!res.ok) {
        throw new Error(url + ': ' + await res.text());
    }
    const response = await res.text();

}

async function post_image(session, image_file, image_url) {
    let image_blob;
    let image_type;

    if (image_file != null) {
        image_blob = image_file;
        image_type = image_file.type;
    }
    else {
        // get image
        const res_img = await fetch('https://corsproxy.io/?' + encodeURIComponent(image_url));
        if (!res_img.ok) {
            throw new Error('https://corsproxy.io/?' + encodeURIComponent(image_url) + ': ' + await res_img.text());
        }
        const image = await res_img.blob();
        const buffer = await image.arrayBuffer();
        image_blob = new Uint8Array(buffer);
        image_type = image.type;
    }

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

function get_url_facet(message, substring, url) {
    const pos = message.search(substring);
    // バイトサイズの位置に変換
    const start_pos_b = new Blob([message.substring(0, pos)]).size;
    const end_pos_b = new Blob([substring]).size;

    const facet = {
        index: {
            byteStart: start_pos_b,
            byteEnd: start_pos_b + end_pos_b,
        },
        features: [{
            $type: 'app.bsky.richtext.facet#link',
            uri: url
        }]
    }
    return facet;
}

function search_url_pos(message, start_pos = 0) {
    // const url_pos = message.indexOf('http');
    const url_pos = message.search('https?://');
    if (url_pos < 0) {
        return null;
    }
    // バイトサイズの位置に変換
    const byte_pos = new Blob([message.substring(0,url_pos)]).size;
    // URL文字列長取得
    const match = message.match('https?://[a-zA-Z0-9/:%#\$&\?\(\)~\.=\+\-_]+');
    // console.log(match);

    // 長いURLを短縮
    const url_obj = new URL(match[0]);
    let disp_url = url_obj.href;

    // const short = {};
    if (url_obj.href.length - url_obj.origin.length > 15) {
        disp_url = url_obj.href.substring(0, url_obj.origin.length + 15) + '...';
    }

    const remain = message.substring(url_pos + url_obj.href.length);
    const next = search_url_pos(remain, byte_pos + disp_url.length + start_pos);
    const disp_message = message.substring(0, url_pos) + disp_url + ((next!=null)? next[0].disp_message: message.substring(url_pos + url_obj.href.length));

    const results = [{
        start: byte_pos + start_pos,
        end: byte_pos + disp_url.length + start_pos,
        url: url_obj.href,
        disp_url: disp_url,
        disp_message: disp_message,
    }]
    if (next != null) {
        results.push(...next);
    }
    return results;
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
    const ogp = {title: d.title};

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
