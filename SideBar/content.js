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
});// content.js

function getSubmissionStatus() {
    const accepted = document.querySelector('.text-green-s, .text-success, .status-accepted');
    const wrong = document.querySelector('.text-red-s, .text-error, .status-wrong');
    const runtimeError = document.querySelector('.text-orange-s, .status-runtime-error');

    if (accepted) return "Accepted";
    if (wrong) return "Wrong Answer";
    if (runtimeError) return "Runtime Error";

    return null; // Not yet submitted
}

// Track state
let hasSubmitted = false;
let submissionAccepted = false;

function updateStatus() {
    const status = getSubmissionStatus();
    const submitted = status !== null;
    const accepted = status === "Accepted";
    if (hasSubmitted && submissionAccepted) {
        chrome.runtime.sendMessage({
            action: "LEETCODE_SUBMISSION_ACCEPTED", // Use a clear, unique action name
            problemUrl: window.location.href // Pass relevant data
        });
    }
    if (submitted !== hasSubmitted || accepted !== submissionAccepted) {
        hasSubmitted = submitted;
        submissionAccepted = accepted;

        console.log("Has submitted?", hasSubmitted);
        console.log("Submission accepted?", submissionAccepted);

        // **ADD THIS SECTION**
        if (hasSubmitted && submissionAccepted) {
            console.log("SUCCESS: Sending message to background script.");
            chrome.runtime.sendMessage({
                action: "LEETCODE_SUBMISSION_STATUS",
                status: "ACCEPTED",
                // You could also extract and send the problem title, user, etc.
            });
        }
        // **END OF ADDED SECTION**
    }
}

// Wait a little before the first check to let React render the page
setTimeout(updateStatus, 1000);

// Observe DOM changes to catch React updates
const observer = new MutationObserver(updateStatus);
observer.observe(document.body, { childList: true, subtree: true });