function save_configure() {
    // console.log("save_configure() begin");
    // get form data
    const client_id = document.getElementById("client_id").value;
    const client_secret = document.getElementById("client_secret").value;
    const input_token = document.getElementById("oauth_token").value;
    const input_apikey = document.getElementById("api_key").value;
    // bsky
    const bsky_id = document.getElementById("bsky_id").value;
    const bsky_pass = document.getElementById("bsky_pass").value;

    // console.log("oauth_token: " + input_token);
    const view_image = document.getElementById("view_image").checked;
    const include_sns = document.getElementById("include_sns").checked;
    const edit_tweet = document.getElementById("edit_tweet").checked;

    const configure = {
        app: {
            view_image: view_image,
            include_sns: include_sns,
            edit_tweet: edit_tweet,
        },
        swarm: {
            oauth_token: input_token,
            api_key: input_apikey,
            client_id: client_id,
            client_secret: client_secret,
        },
        bsky: {
            bsky_id: bsky_id,
            bsky_pass: bsky_pass,
        },
    }
    console.log(configure);
    // save to local storage
    localStorage.setItem('configure', JSON.stringify(configure));
}

function load_configure() {
    // console.log("load_configure() begin");

    const configure = JSON.parse(localStorage.getItem('configure'));
    // update page
    // console.log('token: '+ configure.oauth_token);
    if (configure?.swarm?.client_id)
        document.getElementById("client_id").value = configure?.swarm?.client_id;
    if (configure?.swarm?.client_secret)
        document.getElementById("client_secret").value = configure?.swarm?.client_secret;
    if (configure?.swarm?.oauth_token)
        document.getElementById("oauth_token").value = configure?.swarm?.oauth_token;
    if (configure?.swarm?.api_key)
        document.getElementById("api_key").value = configure?.swarm?.api_key;
    if (configure?.bsky?.bsky_id)
        document.getElementById("bsky_id").value = configure?.bsky?.bsky_id;
    if (configure?.bsky?.bsky_pass)
        document.getElementById("bsky_pass").value = configure?.bsky?.bsky_pass;
    if (configure?.app?.view_image)
        document.getElementById("view_image").checked = configure?.app?.view_image;
    if (configure?.app?.include_sns)
        document.getElementById("include_sns").checked = configure?.app?.include_sns;
    if (configure?.app?.edit_tweet)
        document.getElementById("edit_tweet").checked = configure?.app?.edit_tweet;

    return configure;
}

async function reload_data() {
    const configure = load_configure();
    const url = 'https://api.foursquare.com/v2/users/self/checkins?v=20231010&limit=30&offset=0&oauth_token=' + configure.swarm.oauth_token;
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

function swarm_oauth() {
    console.log('swarm_oauth() begin');
    save_configure();
    const configure = load_configure();
    const client_id = configure?.swarm?.client_id;
    const redirect_url = 'https://www.jp-z.jp/swarm/';
    const url = 'https://foursquare.com/oauth2/authenticate?client_id=' + client_id + '&response_type=code&redirect_uri=' + redirect_url;

    window.location.href = url;
}
async function swarm_oauth2(code) {
    console.log('swarm_oauth2() begin');
    const configure = load_configure();
    const client_id = configure?.swarm?.client_id;
    const client_secret = configure?.swarm?.client_secret;
    const redirect_url = 'https://www.jp-z.jp/swarm/';
    const url = 'https://foursquare.com/oauth2/access_token?client_id=' + client_id + '&client_secret=' + client_secret +'&grant_type=authorization_code&redirect_uri=' + redirect_url + '&code=' + code;
    const res = await fetch('https://corsproxy.io/?' + encodeURIComponent(url));

    const response = await res.json();
    if (response.access_token.length > 0) {
        load_configure();
        document.getElementById("oauth_token").value = response.access_token;
        save_configure();
        window.location.href = redirect_url;
    }
}

function get_image_url(disp_width, count, photo) {
    let w = disp_width * 0.95;
    let h = photo.height * w / photo.width;
    if (count != 1) {
        // さらに半分
        w = w / 2;
        h = h / 2;
    }
    return photo.prefix + Math.round(w) + 'x' + Math.round(h) + photo.suffix;
}

function load_data() {
    // title version
    document.getElementById('title').textContent = 'swarm c2c ver.0915';

    // oauth?
    if (window.location.search.length > 0) {
        const param = new URLSearchParams(window.location.search);
        // console.log(param);
        const code = param.get('code');
        console.log(code);
        const token = swarm_oauth2(code);
        return;
    }

    // preview?
    const configure = load_configure();
    const preview_image = configure?.app?.view_image;

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

        let display = document.getElementById("checkin_list");
        let index = 0;
        const today = new Date();   // 当日チェックインカウント判定用
        let today_count = 0;
        // console.log(today.toLocaleDateString());
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
            if (datetime.toLocaleDateString() === today.toLocaleDateString()) {
                today_count++;
            }

            header_part.appendChild(checkin_datetime);
            let rest_button = document.createElement("button");
            rest_button.textContent = "get url";
            // rest_button.onclick = 'create_share()'; // 効かない
            rest_button.addEventListener('click', ()=> {
                create_share(checkin);
            });
            header_part.appendChild(rest_button);

            // item config
            const tw_checkbox = document.createElement("input");
            tw_checkbox.type = 'checkbox';
            tw_checkbox.id = 'tw_edit_' + checkin.id;
            tw_checkbox.name = 'tw_edit_' + checkin.id;
            tw_checkbox.value = 'tw_edit_' + checkin.id;
            tw_checkbox.checked = configure.app.edit_tweet;
            const tw_chk_label = document.createElement("label");
            tw_chk_label.htmlFor = 'tw_edit_' + checkin.id;
            tw_chk_label.textContent = 'tw';
            header_part.appendChild(tw_checkbox);
            header_part.appendChild(tw_chk_label);

            const acc_checkbox = document.createElement("input");
            acc_checkbox.type = 'checkbox';
            acc_checkbox.id = 'acc_include_' + checkin.id;
            acc_checkbox.name = 'acc_include_' + checkin.id;
            acc_checkbox.value = 'acc_include_' + checkin.id;
            acc_checkbox.checked = configure.app.include_sns;
            const acc_chk_label = document.createElement("label");
            acc_chk_label.htmlFor = 'acc_include_' + checkin.id;
            acc_chk_label.textContent = '@';
            header_part.appendChild(acc_checkbox);
            header_part.appendChild(acc_chk_label);

            let photo_count = checkin.photos.count;
            // console.log("photo count: " + photo_count);
            let photo_view = document.createElement("div");
            if (photo_count > 0) {
                for (let photos of checkin.photos.items) {
                    let photo_item = document.createElement("img");
                    let photo_url = get_image_url(display.clientWidth, photo_count, photos);
                    photo_item.src = photo_url;
                    if (preview_image) {
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
        const comment_view = document.getElementById("comment");
        comment_view.textContent = 'todays checkin: ' + today_count;
    }
}

function create_share_string(checkin, twitter_id = null) {
    let location_str = '';
    let return_string;
    let twitter_string = '';
    let event_string = '';

    if ('event' in checkin) {
        event_string = ' for ' + checkin.event.name;
    }
    // formattedAddressが無いヴェニューもある
    if ('formattedAddress' in checkin.venue.location) {
        const location = ('address' in checkin.venue.location)? 1: 0;
        location_str = ' in ' + checkin.venue.location.formattedAddress[location];
    }
    if (twitter_id) {
        twitter_string = ' - @' + twitter_id;
    }

    if ('shout' in checkin) {
        return_string = checkin.shout + ' (@ ' + checkin.venue.name + twitter_string + event_string + location_str + ')';
    }
    else {
        return_string = "I'm at " + checkin.venue.name + twitter_string + event_string + location_str;
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

async function create_share(checkin) {
    const configure = load_configure();
    // console.log("create_share() begin: " + checkin_id);
    // get configure
    const enable_tweet = document.getElementById('tw_edit_' + checkin.id).checked;
    const include_account = document.getElementById('acc_include_' + checkin.id).checked;

    const detail = await get_detail(checkin.id, configure);
    document.getElementById(checkin.id).value = detail.checkinShortUrl;
    console.log(checkin);

    // const comment = document.getElementById(checkin.id + '_comment').textContent;
    const comment = create_share_string(detail, (include_account)? detail.venueInfo.twitter: null);
    const share_comment = comment + "\n" + detail.checkinShortUrl;
    console.log(comment);
    navigator.clipboard.writeText(share_comment);
    if (enable_tweet) {
        window.open('https://x.com/intent/tweet?url=' + detail.checkinShortUrl + '&text=' + encodeURIComponent(comment));
    }
}

async function get_detail(checkin_id, configure) {
    const checkins = localStorage.getItem('rest_response');
    // console.log('checkins: ' + checkins);
    const checkin_data = JSON.parse(checkins);

    let result = {};
    for (let checkin of checkin_data.response.checkins.items) {
        // console.log('saved checkin id: ' + checkin.id);
        if (checkin_id === checkin.id) {
            // consolog.log('checkin id: ' + checkin_id);
            if ('checkinShortUrl' in checkin) {
                console.log('shortcut url is exist');
            }
            else {
                console.log('shortcut url is not exist');

                const url = 'https://api.foursquare.com/v2/checkins/' + checkin_id + '?v=20231010&oauth_token=' + configure.swarm.oauth_token;
                const headers = new Headers();
                headers.append('accept', 'application/json');
            
                const res = await fetch(url, { headers: headers });
            
                const response = await res.json();
                // console.log(response.response.checkin.checkinShortUrl);
            
                checkin.checkinShortUrl = response.response.checkin.checkinShortUrl;
            }
            if ('venueInfo' in checkin) {
                // 追加情報あり(または取得済み未設定)
                // console.log('already exist');
            }
            else if (!checkin.venue.private && !checkin.venue.closed) {
                if (configure.swarm.api_key.length > 0) {
                    // 取得
                    console.log("get place info");
                    const url = 'https://api.foursquare.com/v3/places/' + checkin.venue.id + '?fields=social_media';
                    const headers = new Headers();
                    headers.append('accept', 'application/json');
                    headers.append('Authorization', configure.swarm.api_key);
                    const res = await fetch(url, { headers: headers });
                    if (res.status === 404) {
                        // venueの詳細情報が無い(原因不明)
                        console.log(await res.text());
                        checkin.venueInfo = {};
                        // 台場交差点(id:4bee05ae4daaa593c7a88f61)
                        // 台場2丁目バス停(id:4d397ec6beb7b1f72fbedf71)
                        // …など
                    }
                    else if (res.status === 200) {
                        const response = await res.json();
                        console.log(response.social_media.twitter);

                        checkin.venueInfo = {twitter: response.social_media.twitter};
                    }
                    else {
                        // error
                        console.log(res);
                    }
                }
                else {
                    checkin.venueInfo = {};
                }
            }
            else {
                // console.log('private or obsolete');
                checkin.venueInfo = {};
            }
            result = checkin;
            break;
        }
    }
    localStorage.setItem('rest_response', JSON.stringify(checkin_data));

    return result;
}
