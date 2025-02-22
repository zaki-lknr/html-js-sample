/*
 * write your code
 */
function button_press() {
    console.log("start anchor");

    const a = document.createElement('a');
    a.href = 'https://lovelive-anime.jp/nijigasaki/story.php';
    a.textContent = '虹ヶ咲';
    a.target = '_blank';

    const div = document.getElementById('view');
    div.appendChild(a);

}
