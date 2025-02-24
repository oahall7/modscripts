// ==UserScript==
// @name         Highlight Usernames/Certain Text in Red
// @namespace    https://greasyfork.org/en/users/1265537-kloob
// @version      1.0
// @description  Adds a button to highlight specified text within a textarea
// @author       You
// @match        https://www.gaiaonline.com/forum/compose/entry/*
// @grant        none
// @enabled      true
// ==/UserScript==

(function() {
    'use strict';

    // Insert the button at the end of #format_controls
    const button = document.createElement('button');
    button.textContent = 'Highlight Text';
    button.style.margin = '10px';
    document.querySelector('#format_controls').appendChild(button);

    // Add click event to the button
    button.addEventListener('click', () => {
        // Prompt the user to enter text
        const searchText = prompt('Enter text to highlight:');
        if (!searchText) return;

        // Get the textarea element
        const textarea = document.getElementById('message');
        if (textarea) {
            // Find all instances of the searchText and wrap with [color=red][/color]
            const regex = new RegExp(`(${searchText})`, 'gi');
            textarea.value = textarea.value.replace(regex, '[color=red]$1[/color]');
        } else {
            alert('Textarea not found.');
        }
    });
})();
