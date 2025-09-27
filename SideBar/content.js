// content.js

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