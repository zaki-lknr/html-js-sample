function clipboard() {
    const input_text = document.getElementById("input_text");
    console.log("input_text: " + input_text);

    if (navigator.clipboard) {
        console.log("navigator write");
        navigator.clipboard.writeText(input_text.value);
    }
    else {
        // HTTP経由だとnavigator.clipboardが機能しない
        console.log("document write");
        input_text.select();
        document.execCommand('copy');
    }
}


function paste() {
    const input_text = document.getElementById("input_text");
    console.log("input_text: " + input_text);

    if (navigator.clipboard) {
        navigator.clipboard.readText().then((clipText) => {
            console.log(clipText);
            input_text.value = clipText;
        })
    }
    else {
        // HTTP経由だとnavigator.clipboardが機能しない
        console.log("document write");
        input_text.focus();
        document.execCommand("paste");
        // ただ、↑でも動かない
    }
}
