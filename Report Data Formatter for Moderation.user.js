// ==UserScript==
// @name         Report Data Formatter for Moderation
// @namespace    https://greasyfork.org/en/users/1265537-kloob
// @version      2.0
// @description  Extracts and formats report data for moderation purposes
// @author       kloob
// @grant        GM_setClipboard
// @match        https://www.gaiaonline.com/moddog/report/view/*
// @enabled      true
// ==/UserScript==

(function () {
    'use strict';

    // Function to find the next sibling element
    function nextElementSibling(element) {
        do {
            element = element.nextSibling;
        } while (element && element.nodeType !== 1);
        return element;
    }

    // Function to check if the report is against a reply
    function isReplyReport() {
        let referenceElements = document.querySelectorAll('td.fname');
        for (let element of referenceElements) {
            if (element.textContent.includes("References")) {
                let nextSibling = nextElementSibling(element);
                return nextSibling && nextSibling.textContent.includes('» Post:');
            }
        }
        return false;
    }

    // Function to extract and format data
    function formatReportData() {
        let reportIDElement = document.querySelector('#report_detail_overview .fval a');
        let reportID = reportIDElement ? reportIDElement.textContent.trim() : 'N/A';
        let reportURL = reportIDElement ? reportIDElement.href : 'N/A';
        let reportType = extractData('Reason Reported');
        let additionalInfo = extractData('Additional Information');
        let reporterInfo = extractData('Reporter Id');
        let reporterDetails = extractReporterInfo(reporterInfo);
        let reporterName = reporterDetails.split(" ").slice(1).join(" ");
        let reporterID = reporterDetails.split(" ")[0].replace(/[\[\]]/g, '');
        let offenderInfo = extractData('Offender Id');
        let offenderDetails = extractReporterInfo(offenderInfo);
        let offenderName = offenderDetails.split(" ").slice(1).join(" ");
        let offenderID = offenderDetails.split(" ")[0].split(" ")[0].replace(/[\[\]]/g, '');
        let offendingForumData = extractData('References').split(" ");
        let offendingTopic = offendingForumData[1];
        let offendingPost = offendingForumData[4];
        let topicTitle = extractData('Thread Title');

        //let offendingPost = extractData('Post:');

        //old return function, you can disregard lol
        //return `[b]Report ID:[/b] ${reportID} | [b]Report Type:[/b] ${reportType}\n[b]Report URL:[/b] [url]${reportURL}[/url]\n[b]Additional Information:[/b] ${additionalInfo}\n[b]Reporter:[/b] ${reporterID} | ${reporterName} ([url=https://www.gaiaonline.com/admin/user/mod/${reporterID}]Profile Tools[/url]) ${offenderName}`;

        return `[b]Report ID:[/b] ${reportID} | [b]Report Type:[/b] ${reportType} \n[b]Report URL:[/b] [url]${reportURL}[/url]\n[b]Offender:[/b] ${offenderName} | ${offenderID} | [url=https://www.gaiaonline.com/admin/user/mod/${offenderID}]Profile Tools[/url]\n[b]Reporter:[/b] ${reporterName} | ${reporterID} | [url=https://www.gaiaonline.com/admin/user/mod/${reporterID}]Profile Tools[/url]\n[b]Thread:[/b] [url=https://www.gaiaonline.com/forum/viewtopic.php?t=${offendingTopic}]${topicTitle ? topicTitle : offendingTopic}[/url]${offendingPost ? ` | [b]Reported Post:[/b] [url=https://www.gaiaonline.com/forum/viewtopic.php?p=${offendingPost}#${offendingPost}]${offendingPost}[/url]` : ''}`;

    }

    // Function to extract data based on the label
    function extractData(label) {
        let elements = document.querySelectorAll('td.fname');
        for (let element of elements) {
            if (element.textContent.includes(label)) {
                let nextSibling = nextElementSibling(element);
                if (nextSibling) {
                    // Check if there's a dropdown or additional report reasons, and exclude them
                    let textContent = nextSibling.cloneNode(true);
                    let dropdown = textContent.querySelector('select');
                    let changeCategoryLink = textContent.querySelector('#Oldcategory > a:nth-child(1)');
                    if (dropdown) dropdown.remove();
                    if (changeCategoryLink) changeCategoryLink.remove();
                    return textContent.textContent.trim();
                }
                break;
            }
        }
        return 'N/A';
    }

    // Function to extract reporter ID and username, excluding specific links text
    function extractReporterInfo(reporterInfo) {
        let reporterDetails = reporterInfo.split('<a')[0].trim();
        // Removing any trailing symbols or words if needed
        return reporterDetails.replace(/ModDog.*/, '').trim();
    }

    // Function to add the copy button
    function addCopyButton() {
        let tracebackElement = document.querySelector('.traceback');
        if (tracebackElement) {
            let copyButton = document.createElement('button');
            copyButton.textContent = 'Copy Report Info';
            copyButton.style = 'margin-left: 10px;';
            copyButton.onclick = function (event) {
                event.preventDefault();
                let dataToCopy = formatReportData();
                GM_setClipboard(dataToCopy);
                copyButton.textContent = 'Report Content Copied';
                copyButton.disabled = true;
            };

            tracebackElement.appendChild(copyButton);
        }
    }

    // Delay execution to ensure the page is fully loaded
    window.addEventListener('load', addCopyButton);
})();
