// Content script for the web extension
// This script runs on pages matching the URL in manifest.json

console.log('Leet Leagues extension content script loaded');

// You can add functionality here that interacts with the webpage
// For example, if you want to modify the appearance of leetcode.com or your Replit site

// Example: Add a message to the page (remove if not needed)
function addExtensionIndicator() {
    const indicator = document.createElement('div');
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #4a90e2;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 10000;
        font-family: Arial, sans-serif;
    `;
    indicator.textContent = 'Leet Leagues Active';
    document.body.appendChild(indicator);
    
    // Remove indicator after 3 seconds
    setTimeout(() => {
        indicator.remove();
    }, 3000);
}

// Run when the page is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addExtensionIndicator);
} else {
    addExtensionIndicator();
}

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);
    
    // Handle different message types
    switch (request.action) {
        case 'ping':
            sendResponse({ status: 'pong' });
            break;
        default:
            console.log('Unknown message action:', request.action);
    }
});