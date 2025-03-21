
async function get_image() {
    console.log("start")

    const file_path = document.getElementById("file").files[0];
    console.log(file_path);
    if (file_path == null) {
        console.log("null");
        return;
    }

    const r = await set_image_data(file_path);
    set_image_to_view(r);
}

function set_image_data(file_path) {

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        // console.log(reader);
        reader.onload = () => {
            const r = reader.result;
            console.log(r);
            resolve(r);
        };
        reader.onerror = (e) => reject(e);

        reader.readAsDataURL(file_path);
    })
}

function set_image_to_view(r) {
    const img = document.createElement("img");
    img.src = r;
    console.log(img.width);
    console.log(img.height);

    const div = document.getElementById('view');
    div.appendChild(img);
}
