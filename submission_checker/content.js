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
let hasSubmitted = getSubmissionStatus() !== null;
let submissionAccepted = hasSubmitted && getSubmissionStatus() === "Accepted";

console.log("Has submitted?", hasSubmitted);
console.log("Submission accepted?", submissionAccepted);

const observer = new MutationObserver(() => {
    const status = getSubmissionStatus();
    const submitted = status !== null;
    const accepted = status === "Accepted";

    // Only log if something changed
    if (submitted !== hasSubmitted || accepted !== submissionAccepted) {
        hasSubmitted = submitted;
        submissionAccepted = accepted;

        console.log("Has submitted?", hasSubmitted);
        console.log("Submission accepted?", submissionAccepted);

        // Optional: send to backend
        // fetch("https://yourbackend.com/submit_status", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ hasSubmitted, submissionAccepted, status })
        // });
    }
});

// Observe the body for dynamic updates
observer.observe(document.body, { childList: true, subtree: true });
