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
    const local_images = document.getElementById("file").files;

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
    // const response = await get_session(configure.bsky_id, configure.bsky_pass);
    // post_message(message, local_image, image_url, response, configure.bsky_id);

    const {JpzBskyClient} = await import("./bsky-client.js");

    const bsky = new JpzBskyClient(configure.bsky_id, configure.bsky_pass);
    if (local_images) {
        bsky.setImageFiles(local_images);
    }
    if (image_url) {
        bsky.setImageUrl(image_url);
    }
    bsky.post(message);
}
