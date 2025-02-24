// ==UserScript==
// @name         Group Reports by Like Topics
// @namespace    https://greasyfork.org/en/users/1265537-kloob
// @version      2.7
// @description  Adds a button to group similar topics in GaiaOnline reports, formats each group with [quote][/quote] tags, and allows insertion of grouped topics at the cursor position, while preserving spacing
// @match        https://www.gaiaonline.com/forum/compose/entry/*
// @grant        none
// @enabled      true
// ==/UserScript==

(function() {
    'use strict';

    let formattedReports = '';  // Variable to store the grouped topics

    // Function to extract and group reports by topic ID
    function groupReportsByTopic() {
        // Get the textarea content
        const textarea = document.querySelector('#message');
        const textContent = textarea ? textarea.value : '';

        // Regular expression to capture both types of reports and the topic title
        const reportRegex = /\[b\]Report ID:\[\/b\] (\d+) \| \[b\]Report Type:\[\/b\] (.*?)\s*\[b\]Report URL:\[\/b\] .*?\[b\]Offender:\[\/b\] .*?\n?\[b\]Reporter:\[\/b\] .*?\n?\[b\]Thread:\[\/b\] \[url=https:\/\/www\.gaiaonline\.com\/forum\/viewtopic\.php\?t=(\d+)\](.*?)\[\/url\](?: \| \[b\]Reported Post:\[\/b\] \[url=.*?\].*?\[\/url\])?/gs;

        // Object to hold reports grouped by topic ID
        const groupedReports = {};

        // Extract each report and group by topic ID
        let match;
        while ((match = reportRegex.exec(textContent)) !== null) {
            const reportId = match[1];
            const reportType = match[2];
            const topicId = match[3];
            const topicTitle = match[4];  // Capture the topic title
            const reportDetails = match[0];

            // Add report to the grouped reports by topic ID
            if (!groupedReports[topicId]) {
                groupedReports[topicId] = {
                    title: topicTitle,  // Store the topic title
                    reports: []
                };
            }
            groupedReports[topicId].reports.push({ reportId, reportType, reportDetails });
        }

        // Build the formatted output with [quote][/quote] wrapping each group of reports
        formattedReports = '';
        Object.keys(groupedReports).forEach(topicId => {
            const topicTitle = groupedReports[topicId].title;
            formattedReports += `[quote="Topic ${topicId}: ${topicTitle}"]\n`;  // Include topic title here
            groupedReports[topicId].reports.forEach(report => {
                formattedReports += `${report.reportDetails.trim()}\n\n`;  // Trim whitespace to avoid extra blank lines
            });
            formattedReports += `[/quote]\n`;  // Close the quote block for this group
        });

        // Remove the reports from the content but leave other content intact
        let newTextContent = textContent.replace(reportRegex, '').replace(/\n\s*\n/g, '\n'); // Remove empty lines around removed reports

        // Update textarea with non-report content
        textarea.value = newTextContent.trim();  // Update textarea with the modified content (without extra whitespace)

        // Log the grouped reports to console (optional)
        console.log('Grouped Reports by Topic ID:', groupedReports);
    }

    // Add the "Group Reports" button to the end of #format_controls
    function addGroupReportsButton() {
        const formatControls = document.getElementById('format_controls');

        if (formatControls) {
            const button = document.createElement('button');
            button.innerText = 'Group Reports';
            button.id = 'group-reports-button';
            button.style.marginLeft = '10px';
            button.addEventListener('click', groupReportsByTopic);

            // Append button to #format_controls
            formatControls.appendChild(button);
        }
    }

    // Add an "Insert Reports" button to allow re-insertion of the formatted reports at cursor position
    function addInsertReportsButton() {
        const formatControls = document.getElementById('format_controls');

        if (formatControls) {
            const insertButton = document.createElement('button');
            insertButton.innerText = 'Insert Reports';
            insertButton.id = 'insert-reports-button';
            insertButton.style.marginLeft = '10px';
            insertButton.addEventListener('click', () => {
                const textarea = document.querySelector('#message');
                const cursorPosition = textarea.selectionStart;

                // Insert the formatted reports at the cursor position
                const beforeCursor = textarea.value.substring(0, cursorPosition);
                const afterCursor = textarea.value.substring(cursorPosition);
                textarea.value = `${beforeCursor}${formattedReports}${afterCursor}`;

                // Ensure cursor position moves to the end of inserted text
                const newCursorPosition = cursorPosition + formattedReports.length;
                textarea.selectionStart = newCursorPosition;
                textarea.selectionEnd = newCursorPosition;
                textarea.focus();  // Ensure the focus is kept in the textarea
            });

            // Append the insert button to #format_controls
            formatControls.appendChild(insertButton);
        }
    }

    // Run the functions to add the buttons
    addGroupReportsButton();
    addInsertReportsButton();

})();
