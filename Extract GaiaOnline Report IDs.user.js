// ==UserScript==
// @name         Extract GaiaOnline Report IDs
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Extract IDs from GaiaOnline report pages and construct URLs on button click.
// @author       YourName
// @match        https://www.gaiaonline.com/moddog/report/area/*/?offender=*&status=*
// @grant        none
// @enabled      true
// ==/UserScript==

(function () {
    'use strict';

    // Create a button
    const button = document.createElement('button');
    button.textContent = 'Extract Report IDs';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.padding = '10px';
    button.style.background = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.zIndex = '1000';

    // Append button to the page
    document.body.appendChild(button);

    // Function to extract report IDs
    function extractReportIDs() {
        const baseURL = "https://www.gaiaonline.com/moddog/report/view/";
        const keyElements = document.querySelectorAll('td.key');
        let reportURLs = [];

        keyElements.forEach(td => {
            const anchor = td.querySelector('a[href^="/moddog/report/view/"]');
            if (anchor) {
                const reportID = anchor.textContent.trim();
                reportURLs.push(`- ${baseURL}${reportID}`);
            }
        });

        console.log("Extracted Report URLs:", reportURLs);
        alert("Extracted Report URLs:\n" + reportURLs.join("\n"));
    }

    // Add event listener to the button
    button.addEventListener('click', extractReportIDs);
})();
