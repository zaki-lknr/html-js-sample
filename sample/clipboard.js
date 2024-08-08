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
