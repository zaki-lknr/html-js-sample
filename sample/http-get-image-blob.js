async function get_image() {
    console.log("start")

    // const url = 'https://fastly.4sqi.net/img/general/1080x811/49473397_7WHN31gt3C_FQwr_lgpdzTv6-aP4TIx1cDuLELQ-KeA.jpg'
    // const url = 'https://pbs.twimg.com/media/GVGp6c2aEAAWlpD?format=jpg&name=large';
    // const url = 'https://pbs.twimg.com/media/FHdqsUNaAAgEJb4.jpg';
    const url = document.getElementById("image_url").value;
    console.log(url);
    if (url == null) {
        console.log("null");
        return;
    }
    if (url.startsWith('http')) {
        console.log("start http");
    }

    const res = await fetch(url);
    console.log(res);
    const image = await res.blob();

    console.log('size: ' + image.size);
    console.log('type: ' + image.type);
    console.log(image);

    // // URL.createObjectURLを使った画像表示
    let img = document.createElement("img");
    img.src = URL.createObjectURL(image);

    const div = document.getElementById('view');
    div.appendChild(img);

    // blobオブジェクトじゃなくデータが必要な場合はバイト配列に変換
    const buffer = await image.arrayBuffer();
    const array = new Uint8Array(buffer);
    console.log(array);

    //// await res.blob()を実行してるので以下は使えない
    // const ab = await res.arrayBuffer();
    // console.log(ab);
}
