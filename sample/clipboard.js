function clipboard() {
    const input_text = document.getElementById("input_text");
    console.log("input_text: " + input_text);

    if (navigator.clipboard) {
        navigator.clipboard.writeText(input_text.value);
    }
    else {
        // HTTP経由だとnavigator.clipboardが機能しない
        input_text.select();
        document.execCommand('copy');
    }
}
