function button_press() {
    console.log("datetime")

    const d = new Date();
    console.log(d);
    console.log(d.toISOString());
    console.log(d.toLocaleString());
    console.log(d.toUTCString());
    console.log(d.toTimeString());
    console.log(d.getTimezoneOffset());
    console.log(d.getTimezoneOffset() / 60);

    //// ブラウザで実行時の出力    
    // datetime.js:2 datetime
    // datetime.js:5 Tue Dec 24 2024 13:48:04 GMT+0900 (日本標準時)
    // datetime.js:6 2024-12-24T04:48:04.211Z
    // datetime.js:7 2024/12/24 13:48:04
    // datetime.js:8 Tue, 24 Dec 2024 04:48:04 GMT
    // datetime.js:9 13:48:04 GMT+0900 (日本標準時)
    // datetime.js:10 -540
    // datetime.js:11 -9
}
