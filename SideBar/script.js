if ((localStorage.getItem("code"))) {
    enterRoom();
}

function createRoom() {
    localStorage.setItem("code", "PLACEHOLDER")
    const homePage = document.getElementById('home');
    homePage.innerHTML = '';

    const links = [
        ["https://aucpl.com/problem/agaradventure", "Agar Adventure", "B"],
        ["https://aucpl.com/problem/ai", "ai", "A"]
    ];

    links.forEach(link => {
        const btn = document.createElement("button");
        btn.textContent = link[1];
        btn.classList.add(link[2]);
        btn.onclick = () => { chrome.tabs.update({ url: link[0] }); };
        homePage.appendChild(btn);
        homePage.appendChild(document.createElement("br"));
    });

    const exitBtn = document.createElement("button");
    exitBtn.textContent = "Exit";
    homePage.appendChild(exitBtn);

    exitBtn.addEventListener('click', () => {
        homePage.innerHTML = `
                <button id="createRoomBtn">Create Room</button>
                <br>
                <input type="text" id="roomCode" placeholder="Enter a code.">
                <br>
                <button id="enterRoomBtn">Enter Code</button>`;
        attachInitialListeners();
        localStorage.removeItem("code")
    });
}

function enterRoom() {
    localStorage.setItem("code", document.getElementById('roomCode').value);
    const homePage = document.getElementById('home');
    alert(document.getElementById('roomCode').value);
    homePage.innerHTML = '';
    const exitBtn = document.createElement("button");
    exitBtn.textContent = "Exit";
    homePage.appendChild(exitBtn);

    exitBtn.addEventListener('click', () => {
        homePage.innerHTML = `
                <button id="createRoomBtn">Create Room</button>
                <br>
                <input type="text" id="roomCode" placeholder="Enter a code.">
                <br>
                <button id="enterRoomBtn">Enter Code</button>`;
        localStorage.removeItem("code");
        attachInitialListeners();
    });
}
function attachInitialListeners() {
    document.getElementById('createRoomBtn').addEventListener('click', createRoom);
    document.getElementById('enterRoomBtn').addEventListener('click', enterRoom);
}
attachInitialListeners();
/*
/*
/*




*/

//The page update.


