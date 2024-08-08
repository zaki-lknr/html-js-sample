function save_configure() {
    console.log("save_configure() begin");
    // get form data
    let input_token = document.getElementById("oauth_token").value;
    console.log("oauth_token: " + input_token);

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
        venue_name.textContent = checkin.venue.name;

        let checkin_datetime = document.createElement("div");
        let datetime = new Date(checkin.createdAt * 1000);
        checkin_datetime.textContent = datetime.toLocaleDateString() + ' ' + datetime.toLocaleTimeString();

        var item_hr = document.createElement("hr");
        component.appendChild(venue_name);
        component.appendChild(checkin_datetime);
        component.appendChild(item_hr);
        display.appendChild(component);

    }
}
