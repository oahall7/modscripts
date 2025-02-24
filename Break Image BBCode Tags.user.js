// ==UserScript==
// @name         Break Image BBCode Tags
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Add a button to break image BBCode tags
// @author       You
// @match        https://www.gaiaonline.com/forum/compose/entry/*/
// @grant        none
// @enabled      true
// ==/UserScript==

(function() {
    'use strict';

    // Function to add the button once format_controls div is available
    function addButton() {
        // Check if the button is already added to avoid duplicates
        if (document.getElementById("break-image-bbcode-button")) return;

        const formatControlsDiv = document.getElementById("format_controls");
        if (!formatControlsDiv) return;

        // Create the new button
        const breakImageBBCodeButton = document.createElement('button');
        breakImageBBCodeButton.innerText = "Break Image BBCode Tags";
        breakImageBBCodeButton.id = "break-image-bbcode-button";
        breakImageBBCodeButton.style.marginLeft = "10px";

        // Append the button to the format_controls div
        formatControlsDiv.appendChild(breakImageBBCodeButton);

        // Add event listener to handle breaking image BBCode
        breakImageBBCodeButton.addEventListener('click', () => {
            const textAreas = document.querySelectorAll('textarea');
            textAreas.forEach(textarea => {
                textarea.value = textarea.value.replace(/\[img\](.*?)\[\/img\]/g, '[img*]$1[/img]');
            });
            alert("Image BBCode tags have been broken!");
        });
    }

    // Use MutationObserver to detect changes in the DOM
    const observer = new MutationObserver((mutations, observer) => {
        if (document.getElementById("format_controls")) {
            addButton();
            observer.disconnect(); // Stop observing once the button is added
        }
    });

    // Start observing the body for changes in child nodes
    observer.observe(document.body, { childList: true, subtree: true });

})();
