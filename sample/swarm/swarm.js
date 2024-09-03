function save_configure() {
    // console.log("save_configure() begin");
    // get form data
    const input_token = document.getElementById("oauth_token").value;
    const input_apikey = document.getElementById("api_key").value;
    // console.log("oauth_token: " + input_token);

    const swarm_configure = {
        oauth_token: input_token,
        api_key: input_apikey
    }
    // save to local storage
    localStorage.setItem('configure', JSON.stringify(swarm_configure));
}

function load_configure() {
    // console.log("load_configure() begin");

    // load from local storage
    const swarm_configure = localStorage.getItem('configure');
    // console.log('configure: ' + swarm_configure);

    const configure = JSON.parse(swarm_configure);
    // update page
    // console.log('token: '+ configure.oauth_token);
    document.getElementById("oauth_token").value = configure.oauth_token;
    document.getElementById("api_key").value = configure.api_key;

    return configure;
}

async function reload_data() {
    const configure = load_configure();
    const url = 'https://api.foursquare.com/v2/users/self/checkins?v=20231010&limit=30&offset=0&oauth_token=' + configure.oauth_token;
    // console.log('url: ' + url);
    const headers = new Headers();
    headers.append('accept', 'application/json');

    const res = await fetch(url, { headers: headers });

    const body = await res.text();
    // console.log('body: ' + body);

    localStorage.setItem('rest_response', body);

    clear_data();
    load_data();
}

function get_image_url(disp_width, count, photo) {
    let w = disp_width * 0.95;
    let h = photo.height * w / photo.height;
    if (count != 1) {
        // さらに半分
        w = w / 2;
        h = h / 2;
    }
    return photo.prefix + Math.round(w) + 'x' + Math.round(h) + photo.suffix;
}

function load_data() {
    // title version
    document.getElementById('title').textContent = 'swarm c2c ver.0904';

    const checkins = localStorage.getItem('rest_response');
    // console.log('checkins: ' + checkins);
    if (checkins === null) {
        console.log('no data');
        // button文言の更新
        let button = document.getElementById("reload_button");
        button.textContent = 'get checkin data';
    }
    else {
        const checkin_data = JSON.parse(checkins);
        // console.log('checkin_data: ' + checkin_data);
        let view_image = document.getElementById("view_image");

        let display = document.getElementById("checkin_list");
        let index = 0;
        for (let checkin of checkin_data.response.checkins.items) {
            // console.log("checkin: " + checkin.venue.name);
            // console.log("createdAt: " + checkin.venue.createdAt);

            let component = document.createElement("div");

            let venue_name = document.createElement("div");
            venue_name.id = checkin.id + '_comment';

            venue_name.textContent = create_share_string(checkin);

            let form_part = document.createElement("div");
            let url_input = document.createElement("input");
            url_input.type = 'text';
            url_input.id = checkin.id;
            if ('checkinShortUrl' in checkin) {
                url_input.value = checkin.checkinShortUrl;
            }
            form_part.appendChild(url_input);
            // form_part.appendChild(rest_button);

            let header_part = document.createElement("div");

            let checkin_datetime = document.createElement("div");
            let datetime = new Date(checkin.createdAt * 1000);
            checkin_datetime.textContent = '['+ (++index) + '] ' + datetime.toLocaleDateString() + ' ' + datetime.toLocaleTimeString();

            header_part.appendChild(checkin_datetime);
            let rest_button = document.createElement("button");
            rest_button.textContent = "get url";
            // rest_button.onclick = 'get_shortcut_url()'; // 効かない
            rest_button.addEventListener('click', ()=> {
                get_shortcut_url(checkin.id);
            });
            header_part.appendChild(rest_button);

            let photo_count = checkin.photos.count;
            // console.log("photo count: " + photo_count);
            let photo_view = document.createElement("div");
            if (photo_count > 0) {
                for (let photos of checkin.photos.items) {
                    let photo_item = document.createElement("img");
                    let photo_url = get_image_url(display.clientWidth, photo_count, photos);
                    photo_item.src = photo_url;
                    if (view_image.checked) {
                        photo_view.appendChild(photo_item);
                    }
                }
            }

            var item_hr = document.createElement("hr");
            // component.appendChild(comment_view);
            component.appendChild(header_part);
            component.appendChild(venue_name);
            component.appendChild(form_part);
            component.appendChild(photo_view);
            component.appendChild(item_hr);
            display.appendChild(component);
        }
    }
}

function create_share_string(checkin) {
    let location_str = '';
    let return_string;
    // formattedAddressが無いヴェニューもある
    if ('formattedAddress' in checkin.venue.location) {
        const location = ('address' in checkin.venue.location)? 1: 0;
        location_str = ' in ' + checkin.venue.location.formattedAddress[location];
    }

    if ('shout' in checkin) {
        return_string = checkin.shout + ' (@ ' + checkin.venue.name + location_str + ')';
    }
    else {
        return_string = "I'm at " + checkin.venue.name + location_str;
    }

    return return_string;
}

function clear_data() {
    console.log('clear_data() begin');
    let display = document.getElementById("checkin_list");
    // display.removeChild(display.firstChild);
    // for(let child of display.children) {  // ループ中にリストが変化するのでNG
        // display.removeChild(child);
    while(display.firstChild) {
        // console.log(display);
        display.removeChild(display.firstChild);
    }
}

async function get_shortcut_url(checkin_id) {
    // console.log("get_shortcut_url() begin: " + checkin_id);

    let url = await get_url(checkin_id);
    document.getElementById(checkin_id).value = url;

    const comment = document.getElementById(checkin_id + '_comment').textContent;
    const share_comment = comment + "\n" + url;
    console.log(comment);
    navigator.clipboard.writeText(share_comment);
    window.open('https://x.com/intent/tweet?url=' + url + '&text=' + encodeURIComponent(comment));
}

async function get_url(checkin_id) {
    const checkins = localStorage.getItem('rest_response');
    // console.log('checkins: ' + checkins);
    const checkin_data = JSON.parse(checkins);

    let shortcut_url;
    for (let checkin of checkin_data.response.checkins.items) {
        // console.log('saved checkin id: ' + checkin.id);
        if (checkin_id === checkin.id) {
            // consolog.log('checkin id: ' + checkin_id);
            if ('checkinShortUrl' in checkin) {
                console.log('shortcut url is exist');
                shortcut_url = checkin.checkinShortUrl;
            }
            else {
                console.log('shortcut url is not exist');

                const configure = load_configure();
                const url = 'https://api.foursquare.com/v2/checkins/' + checkin_id + '?v=20231010&oauth_token=' + configure.oauth_token;
                const headers = new Headers();
                headers.append('accept', 'application/json');
            
                const res = await fetch(url, { headers: headers });
            
                const response = await res.json();
                // console.log(response.response.checkin.checkinShortUrl);
            
                shortcut_url = response.response.checkin.checkinShortUrl;

                checkin.checkinShortUrl = shortcut_url;
            }
            if ('venueInfo' in checkin) {
                // 追加情報あり(または取得済み未設定)
                // console.log('already exist');
            }
            else if (!checkin.venue.private && !checkin.venue.closed) {
                // 取得
                console.log("get place info");
                const configure = load_configure();
                const url = 'https://api.foursquare.com/v3/places/' + checkin.venue.id + '?fields=social_media';
                const headers = new Headers();
                headers.append('accept', 'application/json');
                headers.append('Authorization', configure.api_key);
                const res = await fetch(url, { headers: headers });
                const response = await res.json();
                console.log(response.social_media.twitter);

                checkin.venueInfo = {twitter: response.social_media.twitter};
            }
            else {
                // console.log('private or obsolete');
                checkin.venueInfo = {};
            }
            break;
        }
    }
    localStorage.setItem('rest_response', JSON.stringify(checkin_data));

    return shortcut_url;
}
