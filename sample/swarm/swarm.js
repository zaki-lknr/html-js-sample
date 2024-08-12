function save_configure() {
    console.log("save_configure() begin");
    // get form data
    let input_token = document.getElementById("oauth_token").value;
    // console.log("oauth_token: " + input_token);

    const swarm_configure = {
        oauth_token: input_token
    }
    // save to local storage
    localStorage.setItem('configure', JSON.stringify(swarm_configure));
}

function load_configure() {
    console.log("load_configure() begin");

    // load from local storage
    const swarm_configure = localStorage.getItem('configure');
    console.log('configure: ' + swarm_configure);

    const configure = JSON.parse(swarm_configure);
    // update page
    console.log('token: '+ configure.oauth_token);
    document.getElementById("oauth_token").value = configure.oauth_token;

    return configure;
}

async function get_data() {
    const configure = load_configure();
    const url = 'https://api.foursquare.com/v2/users/self/checkins?v=20231010&limit=30&offset=0&oauth_token=' + configure.oauth_token;
    // console.log('url: ' + url);
    const headers = new Headers();
    headers.append('accept', 'application/json');

    const res = await fetch(url, { headers: headers });

    const body = await res.text();
    // console.log('body: ' + body);

    localStorage.setItem('rest_response', body);
}

function load_data() {
    const checkins = localStorage.getItem('rest_response');
    // console.log('checkins: ' + checkins);
    const checkin_data = JSON.parse(checkins);
    // console.log('checkin_data: ' + checkin_data);

    var display = document.getElementById("checkin_list");
    for (let checkin of checkin_data.response.checkins.items) {
        console.log("checkin: " + checkin.venue.name);
        console.log("createdAt: " + checkin.venue.createdAt);

        let component = document.createElement("div");

        let venue_name = document.createElement("div");
        venue_name.id = checkin.id + '_comment';
        const location = ('address' in checkin.venue.location)? 1: 0;
        if ('shout' in checkin) {
            venue_name.textContent = checkin.shout + ' (@ ' + checkin.venue.name + ' in ' + checkin.venue.location.formattedAddress[location] + ')';
        }
        else {
            venue_name.textContent = "I'm at " + checkin.venue.name + ' in ' + checkin.venue.location.formattedAddress[location];
        }
        let form_part = document.createElement("div");
        let url_input = document.createElement("input");
        url_input.type = 'text';
        url_input.id = checkin.id;
        let rest_button = document.createElement("button");
        rest_button.textContent = "get url";
        // rest_button.onclick = 'get_shortcut_url()'; // 効かない
        rest_button.addEventListener('click', ()=> {
            get_shortcut_url(checkin.id);
        });
        form_part.appendChild(url_input);
        form_part.appendChild(rest_button);

        let checkin_datetime = document.createElement("div");
        let datetime = new Date(checkin.createdAt * 1000);
        checkin_datetime.textContent = datetime.toLocaleDateString() + ' ' + datetime.toLocaleTimeString();

        let photo_count = checkin.photos.count;
        // console.log("photo count: " + photo_count);
        let photo_view = document.createElement("div");
        if (photo_count > 0) {
            for (let photos of checkin.photos.items) {
                // let photo_item = document.createElement("img");
                let photo_item = document.createElement("div");
                let photo_url = photos.prefix + Math.round(photos.width/10) + 'x' + Math.round(photos.height/10) + photos.suffix;
                // photo_item.src = photo_url;
                photo_item.textContent = photo_url;
                photo_view.appendChild(photo_item);
            }
        }

        var item_hr = document.createElement("hr");
        // component.appendChild(comment_view);
        component.appendChild(checkin_datetime);
        component.appendChild(venue_name);
        component.appendChild(form_part);
        component.appendChild(photo_view);
        component.appendChild(item_hr);
        display.appendChild(component);

    }
}

async function get_shortcut_url(checkin_id) {
    console.log("get_shortcut_url() begin: " + checkin_id);

    let url = await get_url(checkin_id);
    document.getElementById(checkin_id).value = url;

    let comment = document.getElementById(checkin_id + '_comment').textContent;
    comment += "\n" + url;
    console.log(comment);
    navigator.clipboard.writeText(comment);
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
                break;
            }
        }
    }
    localStorage.setItem('rest_response', JSON.stringify(checkin_data));

    return shortcut_url;
}
