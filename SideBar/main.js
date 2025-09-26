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