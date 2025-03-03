// ==UserScript==
// @name         Gaia Online Mod Script Loader
// @namespace    http://example.com/
// @version      1.0
// @description  Mod Script Manager - use one script instead of twelve bajillion. 
// @match        *://www.gaiaonline.com/*
// @grant        GM_addElement
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

// List of available scripts
const scripts = {
    "Copy Reportee Details": "https://cdn.jsdelivr.net/gh/oahall7/modscripts@main/Copy%20Reportee%20Details%20from%20Moddog.user.js",
    "Grab User Details from Profile Tools": "https://cdn.jsdelivr.net/gh/oahall7/modscripts@main/Grab%20User%20Details%20from%20Profile%20Tools.user.js",
    "Break Image BBCode":"https://cdn.jsdelivr.net/gh/oahall7/modscripts@main/Break%20Image%20BBCode%20Tags.user.js",
    "Generate Report List of Report URLs":"https://cdn.jsdelivr.net/gh/oahall7/modscripts@main/Extract%20GaiaOnline%20Report%20IDs.user.js",
    "New Account Search":"https://cdn.jsdelivr.net/gh/oahall7/modscripts@main/Find%20New%20Accounts%20-%20Experimental%20Search.user.js",
    "Water's Mod Script":"https://cdn.jsdelivr.net/gh/oahall7/modscripts@main/Gaia%20Mod%20-%20Mod++.user.js",
    "Search Users Friend List":"https://cdn.jsdelivr.net/gh/oahall7/modscripts@main/Gaia%20Online%20Friend%20List%20Search%20Across%20Pages.user.js",
    "Search Users Ignore List":"https://github.com/oahall7/modscripts/raw/refs/heads/main/Gaia%20Online%20Ignore%20List%20Search%20Across%20Pages.user.js",
    "AviChat Context Logs":"https://cdn.jsdelivr.net/gh/oahall7/modscripts@main/GaiaOnline%20-%20AviChat%20Mod%20Suite.user.js",
    "Quick View ModDog Comments":"https://cdn.jsdelivr.net/gh/oahall7/modscripts@main/GaiaOnline%20Quick%20View%20ModDog%20Comments.user.js",
    "Group Like Reports (Only Works for Threads/Post)":"https://cdn.jsdelivr.net/gh/oahall7/modscripts@main/Group%20Reports%20by%20Like%20Topics.user.js",
    "Highlight Keywords":"https://cdn.jsdelivr.net/gh/oahall7/modscripts@main/Highlight%20Usernames-Certain%20Text%20in%20Red.user.js",
    "Read Messages Quietly":"https://cdn.jsdelivr.net/gh/oahall7/modscripts@main/Read%20Messages%20Quietly%20-%20Final.user.js",
    "Show Deleted Posts Button":"https://cdn.jsdelivr.net/gh/oahall7/modscripts@main/Show%20Deleted%20Posts%20Button.user.js",
    "Copy Post URLS, Thread Titles, Timestamps":"https://cdn.jsdelivr.net/gh/oahall7/modscripts@main/URL%20&%20Timpestamp%20Buttons.user.js",
    "Wrap URLs in BBCode":"https://github.com/oahall7/modscripts/raw/refs/heads/main/Wrap%20URLs%20in%20BBCode%20Tags.user.js"
};

// Function to toggle script loading
function toggleScript(name, url) {
    let enabledScripts = GM_getValue("enabledScripts", {});
    if (enabledScripts[name]) {
        delete enabledScripts[name];
        alert(`${name} disabled`);
    } else {
        enabledScripts[name] = url;
        GM_addElement("script", { src: url, type: "text/javascript" });
        alert(`${name} enabled`);
    }
    GM_setValue("enabledScripts", enabledScripts);
}

// Add menu options
for (const [name, url] of Object.entries(scripts)) {
    GM_registerMenuCommand(name, () => toggleScript(name, url));
}

// Load enabled scripts on page load
const enabledScripts = GM_getValue("enabledScripts", {});
for (const url of Object.values(enabledScripts)) {
    GM_addElement("script", { src: url, type: "text/javascript" });
}
