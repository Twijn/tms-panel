function loadDiv() {
    $(".user-search").removeClass("open");
    $("#search-results").fadeIn(300);
}

function loadPunishments(type, user) {
    api.get(type + "/" + user.id + "/punishments", function(result) {
        if (result.success && result.data) {
            let bans = result.data.bans;
            let timeouts = result.data.timeouts;
            $(`#${user.id}-ban-total`).text(bans.length);
            $(`#${user.id}-timeout-total`).text(timeouts.length);

            let bansHtml = "";
            let timeoutsHtml = "";

            bans.forEach(function(ban) {
                let banTime = new Date(ban.time);
                bansHtml += `<div class="punishment ban">
                    <div class="users">
                        <div class="user">
                            <img src="${ban.channel.profile_image_url}" alt="404" onerror="failedImage(this);" />
                            <span class="name">${ban.channel.display_name}</span>
                        </div>
                        <div class="connector ${ban.active ? "active" : "inactive"}"><i class="fas fa-ban"></i></div>
                        <div class="user">
                            <img src="${ban.user.profile_image_url}" alt="404" onerror="failedImage(this);" />
                            <span class="name">${ban.user.display_name}</span>
                        </div>
                    </div>
                    <div class="ban-message">
                        <img src="${ban.user.profile_image_url}" alt="x" onerror="failedImage(this);" /> <strong>${ban.user.display_name}</strong> was banned from <img src="${ban.channel.profile_image_url}" onerror="failedImage(this);" alt="x" /> <strong>${ban.channel.display_name}</strong>'s channel on <strong>${banTime.toLocaleDateString()}</strong> at <strong>${banTime.toLocaleTimeString()}</strong>.
                        <br/>
                        <a href="#" class="view-chat-log" onclick="fullChatHistory(${ban.channel.id}, ${ban.user.id});return false;">Chat Log</a>
                    </div>
                </div>`;
            });

            timeouts.forEach(function(timeout) {
                let timeoutTime = new Date(timeout.time);
                timeoutsHtml += `<div class="punishment timeout">
                    <div class="users">
                        <div class="user">
                            <img src="${timeout.channel.profile_image_url}" alt="404" onerror="failedImage(this);" />
                            <span class="name">${timeout.channel.display_name}</span>
                        </div>
                        <div class="connector ${timeout.active ? "active" : "inactive"}"><i class="fas fa-ban"></i></div>
                        <div class="user">
                            <img src="${timeout.user.profile_image_url}" alt="404" onerror="failedImage(this);" />
                            <span class="name">${timeout.user.display_name}</span>
                        </div>
                    </div>
                    <div class="ban-message">
                        <img src="${timeout.user.profile_image_url}" alt="x" onerror="failedImage(this);" /> <strong>${timeout.user.display_name}</strong> was timed out from <img src="${timeout.channel.profile_image_url}" alt="x" onerror="failedImage(this);" /> <strong>${timeout.channel.display_name}</strong>'s channel on <strong>${timeoutTime.toLocaleDateString()}</strong> at <strong>${timeoutTime.toLocaleTimeString()}</strong> for <strong>${timeout.duration} second${timeout.duration === 1 ? '' : 's'}</strong>.
                        <br/>
                        <a href="#" class="view-chat-log" onclick="fullChatHistory(${timeout.channel.id}, ${timeout.user.id});return false;">Chat Log</a>
                    </div>
                </div>`;
            });

            if (bansHtml === "") bansHtml = "<small>This user has never been banned!</small>";
            if (timeoutsHtml === "") timeoutsHtml = "<small>This user has never been timed out!</small>";

            $(`#${user.id}-bans`).html(bansHtml);
            $(`#${user.id}-timeouts`).html(timeoutsHtml);
        }
    });
}

function formatTwitchUser(user) {
    loadPunishments("twitch", user);
    loadChatHistory(user);

    $("#ch-wrapper").fadeOut(200);

return `<div class="col col-md-6">
    <section class="user-section twitch-user-section">
        <h3>
            Twitch Profile
            <small>Displaying Twitch user ${user.display_name} (${user.id})</small>
        </h3>

        <div class="overview">
            <img src="${user.profile_image_url}" alt="Profile picture for ${user.display_name}" onerror="failedImage(this);" />

            <div class="overview-text">
                <h4>${user.display_name}${user.affiliation === "partner" ? '&nbsp;<i class=\"fas fa-badge-check\"></i></span>' : ''}<span class="id" aria-hidden="true">${user.id}</span></h4>

                <ul>
                    <li><strong>Follower Count:</strong> ${comma(user.follower_count)}</li>
                    <li><strong>View Count:</strong> ${comma(user.view_count)}</li>
                    <li><strong>Twitch Account:</strong> <a href="https://twitch.tv/${encodeURI(user.display_name.toLowerCase())}" target="__blank">https://twitch.tv/${encodeURI(user.display_name.toLowerCase())}</a></li>
                </ul>
            </div>
        </div>

        <h5><span id="${user.id}-ban-total" class="alert-bubble" aria-hidden="true">~</span> Bans</h5>

        <div id="${user.id}-bans" class="bans">
            <div class="loading-container"><div class="loading"><div id="loading"></div></div></div>
        </div>

        <h5><span id="${user.id}-timeout-total" class="alert-bubble" aria-hidden="true">~</span> Timeouts</h5>

        <div id="${user.id}-timeouts" class="timeouts">
            <div class="loading-container"><div class="loading"><div id="loading"></div></div></div>
        </div>

        <h5>Chat History</h5>

        <div id="${user.id}-chat-history" class="chat-history">
            <div class="loading-container"><div class="loading"><div id="loading"></div></div></div>
        </div>
    </section>
</div>`;
}

function formatDiscordUser(user) {
return `<div class="col col-md-6">
    <section class="user-section discord-user-section">
        <h3>
            Discord Profile
            <small>Displaying Discord user @${user.name}#${user.discriminator} (${user.id})</small>
        </h3>

        <div class="overview">
            <img src="${user.avatar_url}" alt="Profile picture for ${user.name}#${user.discriminator}" onerror="failedImage(this);" />

            <div class="overview-text">
                <h4>@${user.name}#${user.discriminator}<span class="id" aria-hidden="true">${user.id}</span></h4>

                <ul>
                    <li><strong>User ID:</strong> ${user.id}</li>
                    <li><strong>User Name:</strong> ${user.name}</li>
                    <li><strong>User Discriminator:</strong> ${user.discriminator}</li>
                </ul>
            </div>
        </div>

        ModBot doesn't capture much data on Discord users yet...We're still under construction!
    </section>
</div>`;
}

function loadIdentity(id) {
    window.location.hash = "/records/user//identity/" + id;

    api.get("identity/" + id, function (result) {
        if (result.success && result.data) {
            let identity = result.data;
            
            let results = [];

            identity.twitchAccounts.forEach(function(twitchAccount) {
                results = [
                    ...results,
                    formatTwitchUser(twitchAccount),
                ];
            });

            identity.discordAccounts.forEach(function(discordAccount) {
                results = [
                    ...results,
                    formatDiscordUser(discordAccount),
                ];
            });

            let html = '<div class="row">';

            results.forEach(function(result) {
                html += result;
            });

            $("#search-results").html(html + "</div>");

            loadDiv();
        } else {
            sendNotification("Failed to retrieve", "Failed to retrieve identity. Error: " + result.error + "<br/>Contact Twijn#8888 for assistance.", "notification-error");
        }
    });
}

function loadUser(type, id, formatFunc) {
    window.location.hash = "/records/user//"+type+"/" + id;

    api.get(type + "/" + id, function (result) {
        if (result.success && result.data) {
            $("#search-results").html(`<div class="row">${formatFunc(result.data)}</div>`);

            loadDiv();
        } else {
            sendNotification("Failed to retrieve", "Failed to retrieve "+type+" user. Error: " + result.error + "<br/>Contact Twijn#8888 for assistance.", "notification-error");
        }
    });
}

function loadChatHistory(user) {
    api.get("chat/overview/" + user.id, function(result) {
        if (result.success && result.data) {
            let chatHistory = "";

            let chatterChats = comma(result.data.chatter_overview.total.chats);
            let chatterChannels = comma(result.data.chatter_overview.total.channels);

            if (result.data.chatter_overview.total.chats > 0) {
                chatHistory += `<a href="#" onclick="fullChatHistory('all',${user.id});return false;">${user.display_name} has sent ${chatterChats} message${chatterChats === 1 ? "" : "s"} in ${chatterChannels} channel${chatterChannels === 1 ? "" : "s"}. Click to view.</a>`;
            }

            let streamerChats = comma(result.data.streamer_overview.total.chats);
            let streamerChannels = comma(result.data.streamer_overview.total.channels);

            if(result.data.streamer_overview.total.chats > 0) {
                chatHistory += `<a href="#" onclick="fullChatHistory(${user.id},'all');return false;">${streamerChats} message${streamerChats === 1 ? "" : "s"} has been sent to channel ${user.display_name} from ${streamerChannels} user${streamerChannels === 1 ? "" : "s"}. Click to view.</a>`;
            }

            if (chatHistory === "") chatHistory = "No chat history for this user!";

            $(`#${user.id}-chat-history`).html(chatHistory);
        }
    });
}

function loadTwitchUser(id) {
    loadUser("twitch", id, formatTwitchUser);
}

function loadDiscordUser(id) {
    loadUser("discord", id, formatDiscordUser);
}

function selectorAddUser(obj) {

}

$(document).ready(function() {
    let originalMessage = '<div class="waiting">Type something to get results. 🙂</div>';
    function updateSearch(obj) {
        let type = obj.attr("data-type");
        if (!type) type = "search";
        let query = encodeURIComponent(obj.find(".search-users-input").val());

        if (query === "") {
            obj.removeClass("open");
            obj.find(".user-search-results").html(originalMessage);
            return false;
        }
        obj.addClass("open");

        api.get("search/" + query, function(data) {
            let identities = "";
            let twitchProfiles = "";
            let discordProfiles = "";

            data.identityResults.forEach(identity => {
                let link = `loadIdentity(${identity.id}, '${identity.name}')`;
                
                if (type === "selector") link = "selectorAddUser($(this).parent().parent());";
                identities += `<div class="search-result" onclick="${link}"><img src="${identity.avatar_url}" alt="404" onerror="failedImage(this);" /><span class="name">${identity.name}</span><span class="info"><strong>${identity.discordAccounts.length}</strong> discord account${identity.discordAccounts.length === 1 ? "" : "s"} • <strong>${identity.twitchAccounts.length}</strong> twitch account${identity.twitchAccounts.length === 1 ? "" : "s"}</span></div>`;
            });

            data.twitchAccountResults.forEach(twitchAccount => {
                let follower_count = comma(twitchAccount.follower_count);
                let view_count = comma(twitchAccount.view_count);
                if (follower_count === "") follower_count = "unknown";
                if (view_count === "") view_count = "unknown";
                let link;
                if (twitchAccount.identity?.id) {
                    link = `loadIdentity(${twitchAccount.identity.id}, '${twitchAccount.identity.name}')`;
                } else {
                    link = `loadTwitchUser(${twitchAccount.id}, '${twitchAccount.display_name}')`;
                }
                if (type === "selector") link = "selectorAddUser($(this).parent().parent());";
                let affiliation = (twitchAccount.affiliation === "partner" ? " • <strong>Partner</strong> <i class=\"fas fa-badge-check\"></i>" : (twitchAccount.affiliation === "affiliate" ? " • <strong>Affiliate</strong>" : ""));
                twitchProfiles += `<div class="search-result" onclick="${link}"><img src="${twitchAccount.profile_image_url}" alt="404" onerror="failedImage(this);" /><span class="name">${twitchAccount.display_name}</span><span class="info"><strong>${follower_count}</strong> followers • <strong>${view_count}</strong> views • User ID <strong>${twitchAccount.id}</strong>${affiliation}</span></div>`;
            });

            data.discordAccountResults.forEach(discordAccount => {
                let link;
                if (discordAccount.identity?.id) {
                    link = `loadIdentity(${discordAccount.identity.id}, '${discordAccount.identity.name}')`;
                } else {
                    link = `loadDiscordUser(${discordAccount.id}, '${discordAccount.name}')`;
                }
                if (type === "selector") link = "selectorAddUser($(this).parent().parent());";
                discordProfiles += `<div class="search-result" onclick="${link}"><img src="${discordAccount.avatar_url}" alt="404" onerror="failedImage(this);" /><span class="name">${discordAccount.name}</span><span class="info"><strong>${discordAccount.name}#${discordAccount.discriminator}</strong> • User ID <strong>${discordAccount.id}</strong></span></div>`;
            });

            if (identities !== "") {
                identities = "<strong>Identities</strong>" + identities;
            }
            if (twitchProfiles !== "") {
                twitchProfiles = "<strong>Twitch Profiles</strong>" + twitchProfiles;
            }
            if (discordProfiles !== "") {
                discordProfiles = "<strong>Discord Profiles</strong>" + discordProfiles;
            }

            obj.find(".user-search-results").html(identities + twitchProfiles + discordProfiles);
        });

        return false;
    }

    let interval;

    $("#search-form").submit(function() {return updateSearch($(this).find(".user-search"));});
    $(".search-users-input").keyup(function() {
        if (interval) clearInterval(interval);
        let obj = $(this);
        interval = setTimeout(() => {updateSearch(obj.parent().parent());}, 500);
    });
})