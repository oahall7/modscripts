// ==UserScript==
// @name         Find New Accounts - Experimental Search
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Add a button to run the User ID check script and copy IDs to clipboard
// @author       kloob
// @match        www.gaiaonline.com/moddog/
// @match        https://www.gaiaonline.com/admin/user/mod/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @enabled      true
// ==/UserScript==

(function() {
    'use strict';

    // Load Font Awesome
    const faStylesheet = document.createElement('link');
    faStylesheet.rel = 'stylesheet';
    faStylesheet.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css';
    document.head.appendChild(faStylesheet);

    let startID = 46994256; // Hardcoded starting ID

    // Initialize the tracked IPs list from localStorage or as an empty array if none
    const trackedIPs = JSON.parse(localStorage.getItem('trackedIPs') || '[]');

    // Checks if an IP is in the tracked list
    function isIPTracked(ip) {
        return trackedIPs.includes(ip);
    }

    // Insert a link to the IP
    function createIpLink(ipAddress, userId) {
        return `<a href="https://www.gaiaonline.com/forum/mod/ip/?i=${ipToDecimal(ipAddress)}&u=${userId}" target="_blank">${ipAddress}</a>`;
    }

    // Add buttons, input fields, and disclaimer
    function addButtonsAndTable() {
        const insertionPoint = document.getElementById('tools_and_resources');
        if (!insertionPoint) {
            console.warn('Insertion point for buttons not found.');
            return; // Exit if the specific fieldset is not found
        }

        const container = document.createElement('div');
        container.style.marginTop = '10px';
        container.style.width = 'calc(100% - 15px)';
        container.style.margin = '0 auto';
        container.style.padding = '5px';

        const checkButton = createButton('Load New Accounts', checkForNewUserIDs);
        container.appendChild(checkButton);

        const startIdInput = createInput('number', 'Enter new start ID');
        container.appendChild(startIdInput);

        const checkLatestIdButton = createButton('Check for Latest ID', findLatestAccountId);
        container.appendChild(checkLatestIdButton);

        insertionPoint.parentNode.insertBefore(container, insertionPoint.nextSibling);

        createEmptyTable();

        const disclaimerDiv = createDisclaimerDiv();
        insertionPoint.parentNode.insertBefore(disclaimerDiv, container.nextSibling);
    }

    // Create a button with specified text and click event
    function createButton(text, clickEvent) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.marginLeft = '5px';
        button.addEventListener('click', clickEvent);
        return button;
    }

    // Create an input field with specified type and placeholder
    function createInput(type, placeholder) {
        const input = document.createElement('input');
        input.type = type;
        input.placeholder = placeholder;
        input.style.marginLeft = '5px';
        return input;
    }

    // Create a disclaimer div
    function createDisclaimerDiv() {
        const disclaimerDiv = document.createElement('div');
        disclaimerDiv.id = 'disclaimerDiv';
        disclaimerDiv.textContent = "Disclaimer! This tool is not intended to be a one-stop-shop for your modding activities. Just because an account is flagged does NOT mean it is truly a BoS User or an Exclusive Advertiser. Do your due diligence and investigate an account fully before taking any actions. This tool finds the latest 50 accounts.";
        disclaimerDiv.style.marginTop = '10px';
        disclaimerDiv.style.width = 'calc(100% - 15px)';
        disclaimerDiv.style.margin = '0 auto';
        disclaimerDiv.style.padding = '5px';
        return disclaimerDiv;
    }

    // Add event listeners and UI for tracking IPs
    function setupTrackedIPsUI() {
        const container = document.createElement('div');
        container.id = 'tracked-ips-container';
        container.style.marginTop = '20px';
        container.style.padding = '10px';
        container.style.border = '1px solid #ccc';

        const title = document.createElement('h3');
        title.textContent = 'Tracked IPs';
        container.appendChild(title);

        const trackedIPsList = document.createElement('div');
        trackedIPsList.id = 'tracked-ips-list';
        container.appendChild(trackedIPsList);

        const ipInput = createInput('text', 'Enter IP to track');
        container.appendChild(ipInput);

        const addButton = createButton('Add IP', () => {
            const ip = ipInput.value.trim();
            if (ip) {
                updateTrackedIPs(ip, true);
                ipInput.value = '';
                refreshTrackedIPsList();
            }
        });
        container.appendChild(addButton);

        const disclaimerDiv = document.getElementById('disclaimerDiv');
        if (disclaimerDiv) {
            disclaimerDiv.parentNode.insertBefore(container, disclaimerDiv.nextSibling);
        } else {
            document.body.appendChild(container);
        }

        refreshTrackedIPsList();
    }

// Update tracked IPs list in localStorage
function updateTrackedIPs(ip, isAdding, alias = '') {
    let trackedIPs = JSON.parse(localStorage.getItem('trackedIPs') || '{}');

    // Convert tracked IPs array to object if necessary
    if (Array.isArray(trackedIPs)) {
        trackedIPs = {};
        localStorage.setItem('trackedIPs', JSON.stringify(trackedIPs));
    }

    console.log(`Current Tracked IPs: `, trackedIPs); // Log the current state before modification

    if (isAdding) {
        if (!alias && confirm("Do you want to add an alias for this IP?")) {
            alias = prompt("Enter an alias for the IP:", '');
        }
        trackedIPs[ip] = alias; // Store or update the alias for the IP
        console.log(`Adding/Updating IP ${ip} with alias '${alias}'`);
    } else {
        delete trackedIPs[ip]; // Remove the IP and its alias
        console.log(`Removing IP ${ip} from tracking`);
    }

    localStorage.setItem('trackedIPs', JSON.stringify(trackedIPs));
    console.log(`Updated Tracked IPs: `, trackedIPs); // Log the new state after modification

    refreshTrackedIPsList(); // Refresh the list whenever an update is made
}

// comment
function refreshTrackedIPsList() {
    const list = document.getElementById('tracked-ips-list');

    // Check if the element exists before modifying it
    if (!list) {
        console.error("Error: Element #tracked-ips-list not found.");
        return; // Exit function to prevent error
    }

    list.innerHTML = ''; // Safe to modify now

    let trackedIPs = JSON.parse(localStorage.getItem('trackedIPs'));

    // Convert tracked IPs array to object if necessary
    if (Array.isArray(trackedIPs)) {
        trackedIPs = {};
        localStorage.setItem('trackedIPs', JSON.stringify(trackedIPs));
    }

    console.log(`Retrieved Tracked IPs: `, trackedIPs); // Log the retrieved tracked IPs

    Object.entries(trackedIPs).forEach(([ip, alias]) => {
        const entry = document.createElement('div');
        entry.textContent = `${ip} - ${alias}`; // Display IP with alias

        const removeButton = createButton('Remove', () => {
            updateTrackedIPs(ip, false);
        });
        entry.appendChild(removeButton);

        list.appendChild(entry);
    });
}


function addButtonNextToIP() {
    window.addEventListener('load', () => {
        const ipRegex = /Last Login IP:.*?(\d+\.\d+\.\d+\.\d+)/;
        const textNodes = document.evaluate("//text()[contains(., 'Last Login IP:')]", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

        for (let i = 0; i < textNodes.snapshotLength; i++) {
            const node = textNodes.snapshotItem(i);
            // Ensure that the next sibling is an anchor tag before proceeding
            if (node.nextSibling && node.nextSibling.tagName === 'A') {
                const ipLink = node.nextSibling;
                const button = createIPTrackButton(ipLink);
                // Insert the button after the anchor tag
                ipLink.parentNode.insertBefore(button, ipLink.nextSibling);
            }
        }
    });
}

function createIPTrackButton(ipLink) {
    const button = document.createElement('button');
    button.textContent = 'Track IP';
    button.style.marginLeft = '10px';
    button.onclick = function() {
        // Extract the standard IP address format from the anchor's text
        const ip = ipLink.textContent; // Use the text content of the link which contains the IP address
        updateTrackedIPs(ip, true); // Adjust updateTrackedIPs to handle the standard IP format
    };
    return button;
}


        addButtonNextToIP();



    // Find the latest account ID
    function findLatestAccountId() {
        let low = startID;
        let high = startID + 333333;

        high -= (high - startID) % 3;

        const checkExistence = (id, resolve) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: `https://www.gaiaonline.com/admin/user/mod/${id}`,
                onload: function(response) {
                    const expectedErrorMessage = `User ${id} cannot be found.`;
                    if (response.responseText.includes(expectedErrorMessage)) {
                        high = id - 3;
                    } else {
                        low = id + 3;
                    }

                    if (low > high) {
                        resolve(high);
                    } else {
                        checkExistence(low + Math.floor((high - low) / 6) * 3, resolve);
                    }
                },
                onerror: function() {
                    console.error(`Error checking ID: ${id}`);
                    resolve(low);
                }
            });
        };

        return new Promise((resolve) => {
            checkExistence(low + Math.floor((high - low) / 6) * 3, resolve);
        }).then((latestID) => {
            const newStartID = latestID - 150;
            updateInputWithValue(newStartID);
            console.log(`Start ID updated for loading the latest 50 accounts: ${newStartID}`);
        });
    }

    // Update input field value with the latest ID
    function updateInputWithValue(id) {
        const startIdInput = document.querySelector('input[type="number"][placeholder="Enter new start ID"]');
        if (startIdInput) {
            startIdInput.value = id;
            startID = id;
            localStorage.setItem('lastReviewedUserID', (id - 3).toString());
            console.log(`Input and startID updated with latest ID: ${id}`);
        }
    }

    // Check for new user IDs
    function checkForNewUserIDs() {
        let table = document.getElementById('userIdInfoTable');
        if (table.rows.length > 1) {
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
        }

        let loadingRow = table.insertRow(-1);
        let loadingCell = loadingRow.insertCell(0);
        loadingCell.textContent = 'Loading New Users.';
        loadingCell.colSpan = 4;

        let dots = 1;
        let loadingInterval = setInterval(() => {
            dots = (dots % 3) + 1;
            loadingCell.textContent = `Loading New Users${'.'.repeat(dots)}`;
        }, 500);

        let userID = Math.max(getNextUserID(), startID);
        let foundIDsUsernamesIPs = [];

        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                checkUserID(userID, foundIDsUsernamesIPs);
                userID += 3;
                if (i === 9) {
                    clearInterval(loadingInterval);
                    displayResultsInTable(foundIDsUsernamesIPs);
                }
            }, i * 500);
        }
    }

    // Check user ID for details
    function checkUserID(userID, foundIDsUsernamesIPs) {
        const url = `https://www.gaiaonline.com/admin/user/mod/${userID}`;

        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            onload: function(response) {
                const responseBody = response.responseText;

                const usernameRegex = /Username:\s*([\w\s\-]+)/;
                const lastLoginIPRegex = /Last Login IP:.*?(\d+\.\d+\.\d+\.\d+)/;
                const joinDateRegex = /Joined: <strong>(.*?)<\/strong>/;
                const postsRegex = /Posts:\s*<strong>(\d+)<\/strong>/;
                const usernameMatch = usernameRegex.exec(response.responseText);
                const lastLoginIPMatch = lastLoginIPRegex.exec(responseBody);
                const joinDateMatch = joinDateRegex.exec(responseBody);
                const postsMatch = postsRegex.exec(responseBody);
                const postCount = postsMatch ? postsMatch[1] : 'Unknown';
                const parser = new DOMParser();
                const doc = parser.parseFromString(response.responseText, "text/html");
                const avatarImg = doc.querySelector('img[alt*="avatar"]');
                const bannedElement = doc.querySelector('p.error');

                if (usernameMatch && lastLoginIPMatch && avatarImg) {
                    const lastLoginIP = lastLoginIPMatch[1];
                    const lastLoginIPDecimal = ipToDecimal(lastLoginIP);
                    const lastLoginIPLink = `https://www.gaiaonline.com/forum/mod/ip/?i=${lastLoginIPDecimal}&u=${userID}`;

                    foundIDsUsernamesIPs.push({
                        id: userID,
                        username: usernameMatch[1],
                        lastLoginIP: lastLoginIP,
                        lastLoginIPLink: lastLoginIPLink,
                        joinDate: joinDateMatch ? joinDateMatch[1] : 'Unknown',
                        postCount: postCount,
                        avatarURL: avatarImg ? avatarImg.src : '',
                        isBanned: !!bannedElement
                    });
                } else {
                    console.log(`Incomplete data for User ID ${userID}.`);
                }

                saveLastReviewedID(userID);
            },
            onerror: function(err) {
                console.error(`Error fetching data for User ID ${userID}:`, err);
            }
        });
    }

    // Get next user ID
    function getNextUserID() {
        return parseInt(localStorage.getItem('lastReviewedUserID') || '0') + 3;
    }

    // Save last reviewed ID
    function saveLastReviewedID(id) {
        localStorage.setItem('lastReviewedUserID', id.toString());
    }

    // Create an empty table for user ID info
    function createEmptyTable() {
        const insertionPoint = document.getElementById('tools_and_resources');
        if (!insertionPoint) {
            console.warn('Insertion point for table not found.');
            return;
        }

        const table = document.createElement('table');
        table.id = 'userIdInfoTable';
        table.style.width = 'calc(100% - 15px)';
        table.border = '1';
        table.style.margin = '0 auto';

        const headerRow = table.createTHead().insertRow(0);
        const headers = ['ID', 'Avatar', 'Username', 'Last Login IP'];
        headers.forEach((text, index) => {
            const headerCell = headerRow.insertCell(index);
            headerCell.textContent = text;
        });

        insertionPoint.parentNode.insertBefore(table, insertionPoint.nextSibling);
    }

    // Display results in the table
// Display results in the table with aliases
function displayResultsInTable(foundIDsUsernamesIPs) {
    const table = document.getElementById('userIdInfoTable');
    const trackedIPs = JSON.parse(localStorage.getItem('trackedIPs') || '{}');

    console.log("Displaying results in table. Total entries: ", foundIDsUsernamesIPs.length);

    // Clear existing rows except the header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    foundIDsUsernamesIPs.forEach(data => {
        const row = table.insertRow(-1);
        const ipAlias = trackedIPs[data.lastLoginIP] || ''; // Get alias if exists

        console.log(`Processing user ID ${data.id} with IP ${data.lastLoginIP} and alias '${ipAlias}'`);

        // Highlight row if IP is tracked
        if (data.lastLoginIP in trackedIPs) {
            row.style.backgroundColor = "#ffcccc";
            console.log(`IP ${data.lastLoginIP} is tracked with alias '${ipAlias}'. Highlighting row.`);
        }

        // ID Cell
        const idCell = row.insertCell(0);
        idCell.innerHTML = `<strong>${data.id}</strong><br>Joined: ${data.joinDate}<br>Posts: ${data.postCount}<br><i class="fa-solid fa-user"></i>  <a href="https://www.gaiaonline.com/admin/user/mod/${data.id}" target="_blank">Profile Tools</a> <br><i class="fa-solid fa-dog"></i> <a href="https://www.gaiaonline.com/moddog/note/search/${data.id}" target="_blank">ModDog</a>`;

        // Avatar Cell
        const avatarCell = row.insertCell(1);
        const avatarImg = document.createElement('img');
        avatarImg.src = data.avatarURL;
        avatarImg.alt = "User's Avatar";
        avatarImg.style.maxWidth = '50px';
        avatarImg.style.height = 'auto';
        avatarCell.appendChild(avatarImg);

        // Username and Alias Cell
        const usernameCell = row.insertCell(2);
        if (ipAlias) {
            usernameCell.innerHTML = `${data.username}<br><small><strong>Potentially: </strong>${ipAlias}</small>`; // Display username with alias
        } else {
            usernameCell.innerHTML = `${data.username}`; // Display username only
        }


        // IP Cell
        const ipCell = row.insertCell(3);
        ipCell.innerHTML = createIpLink(data.lastLoginIP, data.id);

        // Checkbox for IP Tracking
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = data.lastLoginIP in trackedIPs;
        checkbox.addEventListener('click', function() {
            handleCheckboxInteraction(data.lastLoginIP, checkbox, usernameCell);
        });
        ipCell.prepend(checkbox);
    });
}

// Handle interactions with the IP tracking checkbox
function handleCheckboxInteraction(ip, checkbox) {
    console.log(`Checkbox interaction for IP ${ip}: checked status = ${checkbox.checked}`);

    const row = checkbox.closest('tr'); // Find the parent row of the checkbox
    const usernameCell = row.querySelector('td:nth-child(3)'); // Find the username cell within the row

    if (checkbox.checked) {
        let currentAlias = JSON.parse(localStorage.getItem('trackedIPs') || '{}')[ip] || '';
        const userAlias = prompt("Enter an alias for the IP:", currentAlias);
        if (userAlias !== null && userAlias !== '') {
            updateTrackedIPs(ip, true, userAlias);
            row.style.backgroundColor = "#ffcccc"; // Highlight row immediately
            usernameCell.innerHTML += `<br><small>${userAlias}</small>`; // Append alias to the username cell
            console.log(`Alias '${userAlias}' added for IP ${ip}.`);
        } else {
            checkbox.checked = false; // If no alias entered or cancelled, do not check
            console.log(`No alias entered or prompt cancelled. Checkbox unchecked.`);
        }
    } else {
        updateTrackedIPs(ip, false);
        row.style.backgroundColor = ""; // Remove row highlighting
        usernameCell.innerHTML = usernameCell.textContent.split('<br>')[0]; // Remove alias display
    }
}





    // Convert IP address to decimal
    function ipToDecimal(ip) {
        return ip.split('.').reduce((acc, octet) => acc * 256 + parseInt(octet, 10), 0);
    }

    addButtonsAndTable();
    setupTrackedIPsUI();
})();