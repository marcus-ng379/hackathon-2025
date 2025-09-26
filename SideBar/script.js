

nameBtn.addEventListener('click', () => {
    const page = document.getElementById("page");
    localStorage.setItem("Name", document.getElementById('name').value)
    bindRoomButtons(page);
});


function bindRoomButtons(page) {
    page.innerHTML = `
    <button id="create" class="button">Create Room</button><br>
    <input id="code" class="text" placeholder="Enter code!"><br>
    <button id="enterCode" class="button">Send room code</button><br>
    `
    const createBtn = document.getElementById('create');
    const enterCodeBtn = document.getElementById('enterCode');

    if (createBtn) {
        createBtn.addEventListener('click', () => {
            getFilter(page);

        });
    }

    if (enterCodeBtn) {
        enterCodeBtn.addEventListener('click', () => {
            const code = document.getElementById('code').value;
            console.log('Room code sent:', code);
        });
    }
}
function getFilter(page) {
    page.innerHTML = `
    <input type="text" id="Easy" class="input" placeholder="Enter number of easies"><br>
    <input type="text" id="Medium" class="input" placeholder="Enter number of medium"><br>
    <input type="text" id="Hard" class="input" placeholder="Enter number of hard"><br>
    <input type="text" id="DivisionA" class="input" placeholder="Enter number of Division A's"><br>
    <input type="text" id="DivisionB" class="input" placeholder="Enter number of Division B's"><br>
    <button class="button" id="filterBtn">Enter</button><br>
    <button id="exit" class="button">Return</button>
    `
    //GET API KEY.
    bindFilterButtons(page);
}
function bindFilterButtons(page) {
    const filterBtn = document.getElementById('filterBtn');
    const exitBtn = document.getElementById('exit');

    // Bind the filter button
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            const inputs = document.querySelectorAll('#page input');
            const filterDict = {};

            inputs.forEach(input => {
                if (input.id !== 'exit') { // skip the exit button if inside inputs (just in case)
                    // Convert input values to numbers
                    filterDict[input.id] = Number(input.value) || 0;
                }
            });


        });
    }

    // Bind the exit button
    if (exitBtn) {
        exitBtn.addEventListener('click', () => {
            bindRoomButtons(page);
        });
    }
}

function getQuestionInfo() {

}

function createProblemLink(page, problem) {
    const questionBtn = document.createElement("button");
    questionBtn.textContent = problem.name;
    btn.id = problem.difficulty;
    btn.addEventListener('click', () => {
        window.location.href = problem.link;
    });
    page.appendChild(questionBtn + "<br>");

}


/*const username = prompt("Enter Username");

//CHECKS IF THE USER ACCIDENTAlly LEFT
if ((localStorage.getItem("code"))) {
    //IF SO ENTER THE ROOM.
    enterRoom();
}
//CREATE ROOM
function createRoom() {
    //SETS A CODE (RANDOMLY GENERATED)
    localStorage.setItem("code", "PLACEHOLDER");
    const homePage = document.getElementById('home');
    homePage.innerHTML = `
    <input type="text" id="ANumber"placeholder="number of division A"><br>
    <input type="text"  id="BNumber" placeholder="number of division B"><br>
    <input type="text" id="easyNumber" placeholder="number of easy"><br>
    <input type="text" id="Number" placeholder="number of division A"><br>
    <input type="text" id="hardNumber" placeholder="number of division A"><br><button class="button" id="info"></button>`;


    const links = [
        ["https://aucpl.com/problem/agaradventure", "Agar Adventure", "B"],
        ["https://aucpl.com/problem/ai", "ai", "A"],
        ['https://leetcode.com/problems/longest-increasing-subsequence/description/', "Longest Increasing Subsequence", "Medium"]
    ];
    //MY CALL

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
function callFilter(){

}



*/

//The page update.

