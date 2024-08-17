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

    const body = JSON.stringify({
        repo: configure.bsky_id,
        collection: "app.bsky.feed.post",
        record: {
            text: message,
            createdAt: new Date().toISOString()
        }
    });

    const res = await fetch(url, { method: "POST", body: body, headers: headers });
    console.log(res.status);
    const response = await res.text();

}
