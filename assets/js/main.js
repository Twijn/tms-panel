const COOKIE_DOMAIN = "twitchmodsquad.com";
const API_URI = "http://localhost:8080/";
const DISCORD_AVATAR_URI = "https://cdn.discordapp.com/";

function failedImage(thisObj) {
    $(thisObj).attr("src", "/assets/images/person.png");
}

let traceList = {};

function sendNotification(title, description, classes = "notification-primary", length = 6000) {
    if ($(".notifications").length === 0) {
        $("body").append("<div class=\"notifications\"></div>");
    }

    let notification = $(`<div class="notification ${classes}" style="display: none;"><div class="header">${title}</div><div>${description}</div></div>`);
    $(".notifications").append(notification);

    notification.fadeIn(200);

    setTimeout(function() {
        notification.slideUp(200);

        setTimeout(function() {
            notification.remove();
        }, 250)
    }, length + 200);
}

let eventListeners = {
    ["streamer-list-updated"]: function(data) {
        sendNotification("Your streamer list was updated!", "The list of streamers are fresh from Twitch. <a href=\"#\" onclick=\"navigate('authorized-channels', '/you/authorized-channels.html');return false;\">Click here to check them out!</a>");
        emit("streamersChange", [data]);
    },
    ["no-action-notification"]: function(data) {
        sendNotification(data.title, data.description);
    }
};

function comma(x) {
    if (!x) return "";
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const listeners = {
    profileImageChange: [
        function(avatar) {
            // update global picture
            $(".profile-picture").attr("src", avatar);
        },
    ],
    twitchAccountsChange: [
        function(accounts) {

            let table = `<table>`;

            if (accounts.length === 0) {
                table += "<tr><th style=\"text-align: center;\">No data.</th></tr>";
            }

            accounts.forEach(account => {
                table += `
                <tr class="account-row">
                    <td><img class="rounded-square-avatar" src="${account.profile_image_url}" alt="Profile picture for Twitch user '${account.display_name}'" onerror="failedImage(this);"></td>
                    <td>
                        <span class="account-name">${account.display_name}${account.affiliation === "partner" ? '&nbsp;<i class=\"fas fa-badge-check\"></i></span>' : ''}</span>
                        <span class="account-stats">${account.follower_count !== null ? `<span class="highlight">${comma(account.follower_count)}</span> follower${account.follower_count === 1 ? '' : 's'} • ` : ''}${account.view_count !== null ? `<span class="highlight">${comma(account.view_count)}</span> views • ` : ''}User ID <span class="highlight">${account.id}</span>${account.affiliation === null ? '' : (account.affiliation === "partner" ? " • <span class=\"highlight\">Partner <i class=\"far fa-badge-check\"></i></span>" : " • <span class=\"highlight\">Affiliate</span>")}</span>
                    </td>
                </tr>`;
            });

            table += '</table>';
            // update linked accounts list
            $(".twitch-accounts").html(table);
        }
    ],
    discordAccountsChange: [
        function(accounts) {

            let table = `<table>`;

            if (accounts.length === 0) {
                table += "<tr><th style=\"text-align: center;\">No data.</th></tr>";
            }

            accounts.forEach(account => {
                let pfp = null;

                if (account.avatar !== null) {
                    pfp = DISCORD_AVATAR_URI + "avatars/" + account.id + "/" + account.avatar + ".png";
                } else {
                    pfp = DISCORD_AVATAR_URI + "embed/avatars/" + (account.discriminator % 5) + ".png";
                }

                table += `
                <tr class="account-row">
                    <td><img class="rounded-square-avatar" src="${pfp}" alt="Profile picture for Discord user '${account.name}'" onerror="failedImage(this);"></td>
                    <td>
                        <span class="account-name">${account.name}</span>
                        <span class="account-stats">Tag <span class="highlight">${account.name + "#" + account.discriminator}</span> • User ID <span class="highlight">${account.id}</span></span>
                    </td>
                </tr>`;
            });

            table += '</table>';
            // update linked accounts list
            $(".discord-accounts").html(table);
        }
    ],
    streamersChange: [
        function(streamers) {
            let identities = `<table>`;
            let twitch = `<table>`;
            let discord = `<table>`;

            if (streamers.length === 0) {
                identities += "<tr><th style=\"text-align: center;\">No data.</th></tr>";
            }

            streamers.forEach(streamer => {
                identities += `
                <tr class="account-row">
                    <td><img class="rounded-square-avatar" src="${streamer.avatar_url}" alt="Profile picture for Identity '${streamer.name}'" onerror="failedImage(this);"></td>
                    <td>
                        <span class="account-name">${streamer.name}</span>
                        <span class="account-stats"><span class="highlight">${streamer.twitchAccounts.length}</span> twitch account${streamer.twitchAccounts.length === 1 ? "" : "s"} • <span class="highlight">${streamer.discordAccounts.length}</span> discord account${streamer.discordAccounts.length === 1 ? "" : "s"} • Identity ID <span class="highlight">${streamer.id}</span></span>
                    </td>
                </tr>`;


                streamer.twitchAccounts.forEach(account => {
                    twitch += `
                    <tr class="account-row">
                        <td><img class="rounded-square-avatar" src="${account.profile_image_url}" alt="Profile picture for Twitch user '${account.display_name}'" onerror="failedImage(this);"></td>
                        <td>
                            <span class="account-name">${account.display_name}${account.affiliation === "partner" ? '&nbsp;<i class=\"fas fa-badge-check\"></i></span>' : ''}</span>
                            <span class="account-stats">${account.follower_count !== null ? `<span class="highlight">${comma(account.follower_count)}</span> follower${account.follower_count === 1 ? '' : 's'} • ` : ''}${account.view_count !== null ? `<span class="highlight">${comma(account.view_count)}</span> views • ` : ''}User ID <span class="highlight">${account.id}</span>${account.affiliation === null ? '' : (account.affiliation === "partner" ? " • <span class=\"highlight\">Partner <i class=\"far fa-badge-check\"></i></span>" : " • <span class=\"highlight\">Affiliate</span>")}</span>
                        </td>
                    </tr>`;
                });

                streamer.discordAccounts.forEach(account => {
                    let pfp = null;
    
                    if (account.avatar !== null) {
                        pfp = DISCORD_AVATAR_URI + "avatars/" + account.id + "/" + account.avatar + ".png";
                    } else {
                        pfp = DISCORD_AVATAR_URI + "embed/avatars/" + account.discriminator + ".png";
                    }
    
                    discord += `
                    <tr class="account-row">
                        <td><img class="rounded-square-avatar" src="${pfp}" alt="Profile picture for Discord user '${account.name}'" onerror="failedImage(this);"></td>
                        <td>
                            <span class="account-name">${account.name}</span>
                            <span class="account-stats">Tag <span class="highlight">${account.name + "#" + account.discriminator}</span> • User ID <span class="highlight">${account.id}</span></span>
                        </td>
                    </tr>`;
                });
            });

            if (twitch === "<table>") {
                twitch += "<tr><th style=\"text-align: center;\">No data.</th></tr>";
            }

            if (discord === "<table>") {
                discord += "<tr><th style=\"text-align: center;\">No data.</th></tr>";
            }

            identities += '</table>';
            twitch += '</table>';
            discord += '</table>';

            $(".authorized-identities").html(identities);
            $(".authorized-twitch").html(twitch);
            $(".authorized-discord").html(discord);
        }
    ],
    statusChange: [
        function(status) {
            let moduleCode = `<div class="container-fluid"><div class="row">`;
            status.forEach((node, i) => {
                if (i % 2 === 0 && i !== 0) {
                    moduleCode += `</div><div class="row">`;
                }

                moduleCode += `<div class="col col-lg-6"><section>
                <h3>
                    TMI Node #${node.id}
                    <small>All channels being listened to by node #${node.id}.</small>
                </h3>
    
                <div class="channel-status"><table>`;
                node.channels.forEach(account => {
                    moduleCode += `
                    <tr class="account-row">
                        <td><img class="rounded-square-avatar" src="${account.profile_image_url}" alt="Profile picture for Twitch user '${account.display_name}'" onerror="failedImage(this);"></td>
                        <td>
                            <span class="account-name">${account.display_name}${account.affiliation === "partner" ? '&nbsp;<i class=\"fas fa-badge-check\"></i></span>' : ''}</span>
                            <span class="account-stats">${account.follower_count !== null ? `<span class="highlight">${comma(account.follower_count)}</span> follower${account.follower_count === 1 ? '' : 's'} • ` : ''}${account.view_count !== null ? `<span class="highlight">${comma(account.view_count)}</span> views • ` : ''}User ID <span class="highlight">${account.id}</span>${account.affiliation === null ? '' : (account.affiliation === "partner" ? " • <span class=\"highlight\">Partner <i class=\"far fa-badge-check\"></i></span>" : " • <span class=\"highlight\">Affiliate</span>")}</span>
                        </td>
                    </tr>`;
                });
                moduleCode += `</table></div></section></div>`;
            });
            moduleCode += "</div></div>";
            $(".bot-bot-status").html(moduleCode);
        }
    ],
}

function emit(event, params) {
    if (typeof(params) !== "object") params = [params];

    if (listeners[event]) {
        listeners[event].forEach(function(listener) {
            listener(...params);
        });
    }
}

// https://stackoverflow.com/questions/1599287/create-read-and-erase-cookies-with-jquery
function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";               

    document.cookie = name + "=" + value + expires + "; path=/; domain=" + COOKIE_DOMAIN;
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

const api = {
    get: function(uri, callback) {
        $.ajax({
            type: "GET",
            url: API_URI + uri,
            headers: {
                "Authorization": readCookie("session")
            },
            success: callback,
            statusCode: {
                401: function(){
                    createCookie("return_uri", window.location.href, .1);
                    window.location = "https://tms.to/login";
                }
            },
        });
    }
}

const navigate = function(url) {
    let page = url;
    let secondaryPage = null;
    if (page.indexOf("//") !== -1) {
        secondaryPage = page.slice(page.indexOf("//") + 2).toLowerCase();
        page = page.slice(0, page.indexOf("//"));
    }
    page = page.replace("#/", '').replace("/", "-");

    if (secondaryPage !== null) {
        if (secondaryPage.startsWith("twitch/")) {
            loadTwitchUser(secondaryPage.replace("twitch/", ""));
        } else if (secondaryPage.startsWith("discord/")) {
            loadDiscordUser(secondaryPage.replace("discord/", ""));
        } else if (secondaryPage.startsWith("identity/")) {
            loadIdentity(secondaryPage.replace("identity/", ""));
        }
    }

    $("body").removeClass("menu-open");

    $(".sidebar-nav a").removeClass("active");
    $(`.${page}-link`).addClass("active");

    if ($("h2 span").text() !== $(`.${page}-link`).text()) {
        let h2 = $("h2");
        let oldspan = $("h2 span");
        let newspan = $("<span class=\"new\">" + $(`.${page}-link`).text() + "</span>");

        h2.append(newspan);

        oldspan.addClass("old");

        setTimeout(function(){newspan.removeClass("new");}, 10);
        setTimeout(function(){oldspan.remove();}, 250);
    }

    $("article:not(.no-hide)").hide();
    $(`.${page}`).show();

    history.pushState({page: page, url: url}, "TMS Admin Panel", url);
}

$(document).ready(function() {
    api.get("identity", function(data) {
        if (data.success) {
            emit("twitchAccountsChange", [data.data.twitchAccounts]);
            emit("discordAccountsChange", [data.data.discordAccounts]);
            if (data.data.discordAccounts.length > 0) {
                emit("profileImageChange", data.data.avatar_url);
            } else if (data.data.twitchAccounts.length > 0) {
                if (data.data.twitchAccounts[0].profile_image_url) {
                    emit("profileImageChange", data.data.twitchAccounts[0].profile_image_url);
                }
            }
        } else {
            console.error(data.error);
        }
    });

    api.get("streamers", function(data) {
        if (data.success) {
            emit("streamersChange",[data.data]);
        }
    });

    api.get("status", function(data) {
        if (data.success) {
            emit("statusChange",[data.data]);
        }
    });

    $(".add-twitch-profile").on("click", function() {
        if (confirm('Twitch will not prompt you to change your login account. Go to Twitch and verify this is the account you\'d like to add prior to continuing.\n\nIf your logged in account is the same account that you use to login here, you will just be sent back to this page.')) {
            window.location = API_URI + "auth/twitch";
        }

        return false;
    });

    $("a.not-registered").on("click", function() {
        let ele = $(this);
        navigate(ele.attr("href"));
        return false;
    });

    $("a.not-registered").removeClass("not-registered");
    $("h1").on("click", function(){$("body").removeClass("menu-open");});
    $(".hamburger-menu").on("click", function(){$("body").toggleClass("menu-open");return false;});

    let pageDetermination = window.location.hash;
    if (pageDetermination.indexOf("//") !== -1)
        pageDetermination = pageDetermination.slice(0, pageDetermination.indexOf("//"));

    pageDetermination = pageDetermination.replace("#/", '').replace("/", "-");

    if (pageDetermination === "" || $("." + pageDetermination).length === 0) {
        window.location.hash = "/you/linked-profiles";
    }

    navigate(window.location.hash);
});

window.onpopstate = function(event) {
    if (event.state && event.state.page && event.state.url) {
        navigate(event.state.url);
    }
};
