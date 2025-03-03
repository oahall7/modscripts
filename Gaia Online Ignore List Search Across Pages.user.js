// ==UserScript==
// @name         Gaia Online Ignore List Search Across Pages
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Search through all pages of ignore list on Gaia Online and navigate to the page where the user is found.
// @author       You
// @match        https://www.gaiaonline.com/profiles/*/*/?mode=ignored
// @match        https://www.gaiaonline.com/profiles/*/*/?mode=ignored&start=*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    function addSearchBox() {
        if (document.getElementById("userSearchContainer")) return;

        const searchContainer = document.createElement("div");
        searchContainer.setAttribute("id", "userSearchContainer");
        searchContainer.style.backgroundColor = "black";
        searchContainer.style.color = "white";
        searchContainer.style.padding = "5px";
        searchContainer.style.zIndex = "9999";
        searchContainer.style.position = "relative";

        const searchBox = document.createElement("input");
        searchBox.setAttribute("type", "text");
        searchBox.setAttribute("id", "userSearch");
        searchBox.setAttribute("placeholder", "Search Ignored Users...");
        searchBox.style.color = "white";
        searchBox.style.backgroundColor = "black";
        searchBox.style.border = "none";

        searchContainer.appendChild(searchBox);

        const headerLeft = document.getElementById("header_left");
        if (headerLeft) {
            headerLeft.parentNode.insertBefore(searchContainer, headerLeft);
            searchBox.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    searchUsers(searchBox.value.trim());
                }
            });
        }
    }

    function getAllPageLinks() {
        const baseUrl = window.location.href.split('?')[0];
        const firstPageUrl = baseUrl + '?mode=ignored';
        const uniqueUrls = new Set([firstPageUrl]);

        document.querySelectorAll('.pagination a').forEach(link => {
            uniqueUrls.add(link.getAttribute('href'));
        });

        return Array.from(uniqueUrls).sort((a, b) => {
            let startA = parseInt(new URL(a, window.location.origin).searchParams.get("start")) || 0;
            let startB = parseInt(new URL(b, window.location.origin).searchParams.get("start")) || 0;
            return startA - startB;
        });
    }

    function fetchPage(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                onload: function(response) {
                    if (response.status >= 200 && response.status < 300) {
                        resolve({ url, content: response.responseText });
                    } else {
                        reject('Error: ' + response.statusText);
                    }
                },
                onerror: function(error) {
                    reject('Error: ' + error);
                }
            });
        });
    }

    async function searchUsers(searchTerm) {
        const searchBox = document.getElementById("userSearch");
        const originalPlaceholder = searchBox.placeholder;

        function setLoadingAnimation() {
            let dots = 0;
            return setInterval(() => {
                dots = (dots + 1) % 4;
                searchBox.placeholder = `Searching Ignored List${'.'.repeat(dots)}`;
            }, 500);
        }

        const animationInterval = setLoadingAnimation();

        try {
            searchBox.value = '';
            const pageLinks = getAllPageLinks();

            for (const link of pageLinks) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const { url, content } = await fetchPage(link);
                const parser = new DOMParser();
                const doc = parser.parseFromString(content, "text/html");
                const users = doc.querySelectorAll('ul > li > span > a');

                for (const user of users) {
                    if (user.textContent.trim() === searchTerm) { // Exact match
                        clearInterval(animationInterval);
                        searchBox.placeholder = originalPlaceholder;
                        searchBox.value = searchTerm;

                        // Redirect and add username to URL to highlight
                        window.location.href = `${url}&searchUser=${encodeURIComponent(searchTerm)}`;
                        return;
                    }
                }
            }
            displayResult(searchTerm, false);
        } catch (error) {
            console.error(error);
            displayResult(searchTerm, false);
        } finally {
            clearInterval(animationInterval);
            searchBox.placeholder = originalPlaceholder;
            searchBox.value = searchTerm;
        }
    }

    function displayResult(user, found) {
        const existingResult = document.getElementById("searchResult");
        if (existingResult) existingResult.remove();

        const resultDiv = document.createElement("div");
        resultDiv.setAttribute("id", "searchResult");
        resultDiv.style.marginTop = "10px";
        resultDiv.style.color = "white";
        resultDiv.style.fontSize = "inherit";
        resultDiv.style.fontFamily = "inherit";
        resultDiv.style.fontWeight = "normal";
        resultDiv.style.textDecoration = "none";

        resultDiv.textContent = found ? `${user} found on Ignore List.` : `No user found matching "${user}".`;
        document.getElementById("userSearchContainer").appendChild(resultDiv);
    }

    function highlightUser() {
        const urlParams = new URLSearchParams(window.location.search);
        const searchUser = urlParams.get("searchUser");

        if (searchUser) {
            const users = document.querySelectorAll('ul > li > span > a');
            users.forEach(user => {
                if (user.textContent.trim() === searchUser) {
                    user.style.backgroundColor = "yellow";
                    user.style.color = "black";
                    user.style.fontWeight = "bold";
                    user.style.padding = "3px";
                    user.style.borderRadius = "5px";

                    // Flashing Animation
                    let flashCount = 0;
                    const flashInterval = setInterval(() => {
                        user.style.backgroundColor = flashCount % 2 === 0 ? "red" : "yellow";
                        flashCount++;
                        if (flashCount > 5) clearInterval(flashInterval);
                    }, 500);

                    // Scroll to the highlighted username
                    user.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            });
        }
    }

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (document.getElementById("gaia_header") && !document.getElementById("userSearch")) {
                observer.disconnect();
                addSearchBox();
                highlightUser(); // Highlight the user when page loads
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();