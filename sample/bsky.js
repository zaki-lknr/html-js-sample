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

    const url = "https://bsky.social/xrpc/com.atproto.repo.createRecord";
    const headers = new Headers();
    headers.append('Authorization', "Bearer " + session.accessJwt);
    headers.append('Content-Type', 'application/json');

    let message = document.getElementById("post_string").value;

    let body = {
        repo: configure.bsky_id,
        collection: "app.bsky.feed.post",
        record: {
            text: message,
            createdAt: new Date().toISOString()
        }
    };

    let result = search_url_pos(message);
    console.log('start: ' + result[0] + ", end: " + result[1] + ', url: ' + result[2]);
    if (result != null) {
        // リンクあり
        body.record.facets = [
            {
                index: {
                    byteStart: result[0],
                    byteEnd: result[1]
                },
                features: [{
                    $type: 'app.bsky.richtext.facet#link',
                    uri: result[2]
                }]
            }
        ]
    }


    const res = await fetch(url, { method: "POST", body: JSON.stringify(body), headers: headers });
    console.log(res.status);
    const response = await res.text();

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
    const match = message.match('https?://[a-zA-Z0-9/:%#\$&\?\(\)~\.=\+\-]+');
    // console.log(match);
    return [pos, (pos + match[0].length), match[0]];
}
