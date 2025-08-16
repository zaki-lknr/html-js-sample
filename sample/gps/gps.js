/*
 * write your code
 */
function button_press() {
    console.log("start gps");
    test();
}

function test() {
    navigator.geolocation.getCurrentPosition(test2);
}

function test2(position) {

    var geo_text = "緯度:" + position.coords.latitude + "\n";
    geo_text += "経度:" + position.coords.longitude + "\n";
    geo_text += "高度:" + position.coords.altitude + "\n";
    geo_text += "位置精度:" + position.coords.accuracy + "\n";
    geo_text += "高度精度:" + position.coords.altitudeAccuracy  + "\n";
    geo_text += "移動方向:" + position.coords.heading + "\n";
    geo_text += "速度:" + position.coords.speed + "\n";

    var date = new Date(position.timestamp);

    geo_text += "取得時刻:" + date.toLocaleString() + "\n";

    console.log("緯度:" + position.coords.latitude);
    console.log("経度:" + position.coords.longitude);
    console.log("位置精度:" + position.coords.accuracy);

    alert(geo_text);
}
