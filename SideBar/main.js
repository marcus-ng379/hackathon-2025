const AUCPL_ORIGIN = 'https://aucpl.com';
const LEET_ORIGIN = 'https://leetcode.com';

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    if (!tab.url) return;
    const url = new URL(tab.url);
    // Enables the side panel on google.com
    if (url.origin === AUCPL_ORIGIN || url.origin === LEET_ORIGIN) {
        await chrome.sidePanel.setOptions({
            tabId,
            path: 'panel.html',
            enabled: true
        });
    } else {
        // Disables the side panel on all other sites
        await chrome.sidePanel.setOptions({
            tabId,
            enabled: false
        });
    }
});

// main.js


// Listener for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Check for the specific action sent from content.js
    if (request.action === "LEETCODE_SUBMISSION_ACCEPTED") {
        console.log("Service Worker received ACCEPTED status. Forwarding to Side Panel.");

        // We need to know which tab the message came from to send it to that tab's side panel
        if (sender.tab?.id) {
            // Use chrome.tabs.sendMessage to send the message specifically to the side panel 
            // of the tab where the submission occurred.
            chrome.tabs.sendMessage(sender.tab.id, {
                action: "SIDE_PANEL_UPDATE",
                data: request // Forward the original request object
            }).catch(error => {
                // The .catch handles cases where the side panel might be closed 
                // or not fully loaded on that tab.
                console.warn("Could not send message to side panel script (script.js). Panel likely closed.", error);
            });
        }
    }
    // No need to return true as we are not sending an asynchronous response back to content.js
});