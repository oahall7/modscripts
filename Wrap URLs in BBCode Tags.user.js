// ==UserScript==
// @name         Wrap URLs in BBCode Tags
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Adds a button to wrap URLs in [url] BBCode tags without double-wrapping existing tags
// @author       You
// @match        https://www.gaiaonline.com/forum/compose/*/*/
// @match        https://www.gaiaonline.com/forum/compose/*/*/?f=*
// @grant        none
// @enabled      true
// ==/UserScript==

(function() {
    'use strict';

    // Function to add the button to the format_controls div
    function addButton() {
        if (document.getElementById("wrap-url-bbcode-button")) return;

        const formatControlsDiv = document.getElementById("format_controls");
        if (!formatControlsDiv) return;

        // Create the new button
        const wrapUrlBBCodeButton = document.createElement('button');
        wrapUrlBBCodeButton.innerText = "Wrap URLs in BBCode";
        wrapUrlBBCodeButton.id = "wrap-url-bbcode-button";
        wrapUrlBBCodeButton.style.marginLeft = "10px";

        // Append the button to the format_controls div
        formatControlsDiv.appendChild(wrapUrlBBCodeButton);

        // Add event listener to handle wrapping URLs in BBCode
        wrapUrlBBCodeButton.addEventListener('click', () => {
            const textAreas = document.querySelectorAll('textarea');
            textAreas.forEach(textarea => {
                // Updated regex to match URLs not already within [url][/url] tags
                textarea.value = textarea.value.replace(/(?<!\[url=?)\b((?:https?:\/\/|www\.)[^\s\[\]]+)\b(?![^\[]*\[\/url\])/g, '[url]$1[/url]');
            });
            alert("URLs have been wrapped in BBCode tags!");
        });
    }

    // Check for format_controls div every 500ms until found
    const intervalId = setInterval(() => {
        const formatControlsDiv = document.getElementById("format_controls");
        if (formatControlsDiv) {
            addButton();
            clearInterval(intervalId); // Stop checking once button is added
        }
    }, 500); // Check every 500 milliseconds

})();
