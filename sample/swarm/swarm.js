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
}
