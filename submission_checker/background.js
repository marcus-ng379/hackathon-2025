chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "submissionCheck") {
        console.log("User submission status:", message.accepted);
    }
});
