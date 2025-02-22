
function get_image() {
    console.log("start")

    const file_path = document.getElementById("file").files[0];
    console.log(file_path);
    if (file_path == null) {
        console.log("null");
        return;
    }

    set_image_data(file_path);
}

function set_image_data(file_path) {
    const reader = new FileReader();
    console.log(reader);
    reader.readAsDataURL(file_path);

    reader.onload = function() {
        const r = reader.result;
        console.log(r);

        set_image_to_view(r);
        // return r;  // 非同期で動作してるのでget_image_data()の呼び出し元へは返らない
    }
}

function set_image_to_view(r) {
    const img = document.createElement("img");
    img.src = r;

    const div = document.getElementById('view');
    div.appendChild(img);
}
