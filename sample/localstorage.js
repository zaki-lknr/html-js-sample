function save() {
    console.log("save() begin");
    // get form data
    let input_text = document.getElementById("input_text").value;
    console.log("input_text: " + input_text);

    // save to local storage
    localStorage.setItem('local_storage_sample', input_text);
}

function load() {
    console.log("load() begin");

    // load from local storage
    let saved_text = localStorage.getItem('local_storage_sample');
    console.log('save_text: ' + saved_text);

    // update page
    document.getElementById("saved_text").textContent = saved_text;
}
