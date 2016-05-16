
function setChallenge() {
    $.ajax({
        type: "GET",
        url: "../api/auth",
        timeout: 10000,
        async: false,
        success: function(response) {
            challenge = $.parseJSON(response);
            if ($.cookie("big_sherif_session")) {
                var session = $.cookie("big_sherif_session");
                session["challenge"] = challenge.challenge;
				session["session_id"] = challenge.session_id;
                $.cookie("big_sherif_session", session, { expire: 1});
            } else {
                $.cookie("big_sherif_session", challenge, { expire: 1});
            }
        }
    });
}

function checkAuth(username, password, challenge) {
    var digest = $.encoding.digests.hexSha1Str(challenge+password);
    $.ajax({
        type: "POST",
        url: "../api/auth/login",
        timeout: 10000,
        data: {
            username: username,
            password: digest
        },
        success: $.proxy(function(response) {
            var session = $.cookie("big_sherif_session");
            if (session.isLogedIn == true) {
                session["username"] = username;
                session["digest"] = digest;
                session["isLogedIn"] = true;
                session["challenge"] = "used";
                session["profile"]  = $.parseJSON(response);
                $.cookie("big_sherif_session", session, { expire: 1});
                document.bigsherif_router.navigate("" ,{trigger: true});
            } else {
                $("#password").trigger("reset");
                $("#password").trigger("focus");
                $("#username").trigger("focus");
                $("#password").trigger("focus");
            }
        }, this)
    });
}

function attemptLogin() {
    formValue = $("#loginForm").serializeObject();
    if ($.cookie("big_sherif_session")) {
        checkAuth(formValue["username"],
                    $.md5(formValue["password"]),
                    $.cookie("big_sherif_session")["challenge"]);
    } else {
        setChallenge();
    }
}

function attemptLogout(){
    $.removeCookie("big_sherif_session");
    setChallenge();
    document.bigsherif_router.navigate("" ,{trigger: true});
}
