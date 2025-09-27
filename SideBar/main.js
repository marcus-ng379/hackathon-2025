const AUCPL_ORIGIN = 'https://aucpl.com';
const LEET_ORIGIN = 'https://leetcode.com';

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

async function updateSidePanel(tabId, urlString) {
    if (!urlString) return;
    const url = new URL(urlString);

    if (url.origin === LEET_ORIGIN || url.origin === AUCPL_ORIGIN) {
        await chrome.sidePanel.setOptions({
            tabId,
            path: 'panel.html',
            enabled: true
        });
    } else {
        await chrome.sidePanel.setOptions({
            tabId,
            enabled: false
        });
    }
}

// Runs when the URL changes (navigation)
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (info.status === "complete") {
        updateSidePanel(tabId, tab.url);
    }
});

// Runs when the user switches tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    updateSidePanel(tab.id, tab.url);
});
