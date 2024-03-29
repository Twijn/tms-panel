const inf = new Intl.NumberFormat('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1});

const dayOfYear = function(date) {
    return Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
}

function formatTime(timestamp) {
    let curDate = new Date();
    let tsDate = new Date(timestamp);
    let secAgo = (Date.now() - timestamp)/1000;

    if (secAgo < 60) {
        return `${inf.format(secAgo)} second${secAgo === 1 ? "" : "s"} ago`;
    } else if (secAgo < 3600) {
        return `${inf.format(secAgo/60)} minute${secAgo === 1 ? "" : "s"} ago`;
    } else {
        let relativeDay = tsDate.toLocaleDateString();

        if (curDate.getFullYear() === tsDate.getFullYear()) {
            let dayDiff = dayOfYear(curDate) - dayOfYear(tsDate);
            if (dayDiff === 0) {
                relativeDay = "Today";
            } else if (dayDiff === 1) {
                relativeDay = "Yesterday";
            } else if (dayDiff < 7) {
                relativeDay = `${dayDiff} days ago`;
            }
        }

        return `${relativeDay} at ${tsDate.toLocaleTimeString()}`;
    }
}

function parseChat(log, lastChannel = "") {
    let result = "";
    let userTable = log.user_table;

    log.log.forEach(entry => {
        if (entry.type === "chatlog") {
            let channel = userTable[entry.streamer_id];
            let user = userTable[entry.user_id];
            let safeMessage = entry.message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            if (lastChannel !== channel.display_name) {
                result += `<h4><img src="${channel.profile_image_url}" aria-hidden="true" onerror="failedImage(this);"> #${channel.display_name}</h4>`
                lastChannel = channel.display_name;
            }
            
            result += `<div class="log${entry.deleted ? " deleted":""}"><img src="${user.profile_image_url}" onerror="failedImage(this);" /><div class="log-content"><div class="un-time"><a class="username" href="#" onclick="loadTwitchUser(${user.id},'${user.display_name}');return false;" style="color:${entry.color};">${user.display_name}${user.affiliation == "partner" ? '<i class="fas fa-badge-check"></i>' : ''}</a><span class="time">${formatTime(entry.timesent)}</span></div>${safeMessage}</div></div>`;
        } else if (entry.type === "filler" && lastChannel !== "") {
            result += `<div class="filler" onclick="let x=$(this);getFillerChat('${$("#ch-streamer").val()}',${entry.fromTime},${entry.toTime},'${lastChannel}',function(data){x.html(data)});return false;"><span class="load-msg">Load ${entry.messageCount} additional message${entry.messageCount === 1 ? "" : "s"} from other users</span></div>`
        }
    });

    return result;
}

function getFillerChat(streamer, fromTime, toTime, lastChannel, callback) {
    api.get(`chat/${streamer}?time_start=${fromTime}&time_end=${toTime}`, function(data) {
        if (data.success) {
            callback(parseChat(data.data, lastChannel));
        } else {
            console.error(data.error);
        }
    });
}

function fullChatHistory(streamer, user) {
    updateChatSelects(streamer, user);
    if (streamer === "all") streamer = null;
    if (user === "all") user = null;

    let query = "";
    if (streamer) {
        query = "/" + streamer;
        if (user) {
            query += "/" + user;
        }
    } else if (user) {
        query = "?user=" + user;
    } else {
        $("#chat-history-result").html("<small>Showing you the entire database would probably break your computer. Or the server. Or your computer then the server. Or the server then the computer. Or Twitch.<br/>Yeah, let's go with that.<br/>It'll break Twitch.</small>");
    }

    api.get("chat" + query, function(data) {
        if (data.success) {
            $("#chat-history-result").html(parseChat(data.data));
        } else {
            console.error(data.error);
        }
    });

    $(".ch-wrapper").fadeIn(200);
}

function updateChatSelects(streamer, user) {
    updateChatUsers(streamer, user);
    updateChatStreamers(user, streamer);
}

let defaultStreamers = [];

function setDefaultStreamers() {
    let result = `<option value="all">All Streamers</option>`;
    defaultStreamers.forEach(chatEntry => {
        result += `<option value="${chatEntry.streamer.id}"${$("#ch-streamer").val() == chatEntry.streamer.id ? ' selected="selected"' : ""}>${chatEntry.streamer.display_name} • ${comma(chatEntry.count)} chat entries</option>`;
    });
    $("#ch-streamer").html(result);
}

function updateChatUsers(streamer, selected) {
    if (streamer !== "all") {
        api.get("chat/select-menu?channel=" + streamer, function(data) {
            if (data.success) {
                let result = `<option value="all"${selected === "all" ? ' selected="selected"' : ""}>All Users</option>`;
                data.data.forEach(chatEntry => {
                    result += `<option value="${chatEntry.user.id}"${selected == chatEntry.user.id ? ' selected="selected"' : ''}>${chatEntry.user.display_name} • ${comma(chatEntry.count)} chat entries</option>`;
                });
                $("#ch-user").html(result);
            } else {
                console.error(data.error);
            }
        });
    } else {
        setDefaultStreamers();
        if (selected !== "all") {
            $("#ch-user").html(`<option value="all">All Users</option><option selected="selected">${selected}</option>`);
        }
    }
}

function updateChatStreamers(user, selected) {
    if (user !== "all") {
        api.get("chat/select-menu?user=" + user, function(data) {
            if (data.success) {
                let result = `<option value="all"${selected === "all" ? ' selected="selected"' : ""}>All Streamers</option>`;
                data.data.forEach(chatEntry => {
                    result += `<option value="${chatEntry.streamer.id}"${selected == chatEntry.streamer.id ? ' selected="selected"' : ''}>${chatEntry.streamer.display_name} • ${comma(chatEntry.count)} chat entries</option>`;
                });
                $("#ch-streamer").html(result);
            } else {
                console.error(data.error);
            }
        });
    } else {
        setDefaultStreamers();
    }
}

$(function() {
    $(".ch-wrapper").on("click", function(e) {
        if ($(e.target).hasClass("ch-wrapper") || $(e.target).hasClass("fa-times")) {
            $(".ch-wrapper").fadeOut(200);
        }
    })

    api.get("chat/select-menu?all-streamers=true", function(data) {
        if (data.success) {
            let result = `<option value="all">All Streamers</option>`;
            data.data.forEach(chatEntry => {
                result += `<option value="${chatEntry.streamer.id}">${chatEntry.streamer.display_name} • ${comma(chatEntry.count)} chat entries</option>`;
            });

            defaultStreamers = data.data;
            $("#ch-streamer").html(result);
        } else {
            console.error(data.error);
        }
    });

    $(".chat-selector select").change(function() {
        fullChatHistory($("#ch-streamer").val(), $("#ch-user").val());
    });
});