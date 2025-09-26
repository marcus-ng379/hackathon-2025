

//GET'S THE USER NAME FROM THE INPUT AND BUTTON
nameBtn.addEventListener('click', () => {
    const page = document.getElementById("page");
    localStorage.setItem("Name", document.getElementById('name').value)
    bindRoomButtons(page);
});

//REBINDS ROOM BUTTONS
function bindRoomButtons(page) {
    ///DEFINES HTML
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
            createChatBox(code);

        });
    }
}
//ASKS FOR FILTER DATAA
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
async function bindFilterButtons(page) {
    const filterBtn = document.getElementById('filterBtn');
    const exitBtn = document.getElementById('exit');

    // Bind the filter button
    if (filterBtn) {
        filterBtn.addEventListener('click', async () => {
            const inputs = document.querySelectorAll('#page input');
            const filterDict = {};

            inputs.forEach(input => {
                if (input.id !== 'exit') { // skip the exit button if inside inputs (just in case)
                    // Convert input values to numbers
                    filterDict[input.id] = Number(input.value) || 0;
                }
            });
            try {
                // Send filters to the server
                const response = await fetch('https://5e2b62bc-3c14-4aff-b3ed-a90fff910650-00-21sf5eeropuu7.riker.replit.dev/filter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filters: filterDict })
                });

                if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}`);
                }

                const filteredQuestions = await response.json();

                // Clear the page and show filtered questions
                page.innerHTML = '';
                Object.entries(filteredQuestions).forEach(([name, info]) => {
                    const btn = document.createElement('button');
                    btn.textContent = `${name} (${info.Difficulty})`;
                    btn.onclick = () => window.open(info.Url, '_blank');
                    page.appendChild(btn);
                    page.appendChild(document.createElement('br'));
                });
            } catch (err) {
                console.error('Error fetching filtered questions:', err);
                page.innerHTML = `<p style="color:red;">Failed to fetch filtered questions</p>`;
            }
            getQuestionInfo(page, Data);
            getRoomIdAndRedirect();

        });
    }

    // Bind the exit button
    if (exitBtn) {
        exitBtn.addEventListener('click', () => {
            bindRoomButtons(page);
        });
    }
}

function getQuestionInfo(page) {
    Data.forEach(problem => {
        createProblemLink(page, problem);
    })
}

function createChatBox(code) {
    const text = document.getElementById('messages');
    text.innerHTML = '';
    const link = `https://5e2b62bc-3c14-4aff-b3ed-a90fff910650-00-21sf5eeropuu7.riker.replit.dev/room/${code}`;
    showWebsite(link);
}
function showWebsite(url) {
    // Get the messages container
    const messages = document.getElementById('messages');

    // Clear previous content
    messages.innerHTML = '';

    // Create a flex container
    const flexContainer = document.createElement('div');
    flexContainer.style.display = 'flex';
    flexContainer.style.flexDirection = 'column'; // 'row' if you want horizontal
    flexContainer.style.justifyContent = 'center'; // center items horizontally
    flexContainer.style.alignItems = 'center';     // center items vertically
    flexContainer.style.gap = '10px';
    flexContainer.style.width = '100%';
    flexContainer.style.height = '100%';

    // Create an iframe to display the website
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '90%';
    iframe.style.height = '500px';
    iframe.style.border = '1px solid #ccc';
    iframe.style.borderRadius = '8px';

    // Append iframe to flex container
    flexContainer.appendChild(iframe);

    // Append flex container to messages div
    messages.appendChild(flexContainer);
}

function createProblemLink(page, problem) {
    const questionBtn = document.createElement("button");
    questionBtn.textContent = problem.name;
    questionBtn.id = problem.difficulty;
    questionBtn.onclick = () => { chrome.tabs.update({ url: problem.link }); }
    page.appendChild(questionBtn);
    page.appendChild(document.createElement("br"));

}

const Data = [
    { "name": "Agar Adventure", "difficulty": "B", "link": "https://aucpl.com/problem/agaradventure" },
    { "name": "AI Problem", "difficulty": "A", "link": "https://aucpl.com/problem/ai" },
    { "name": "Longest Increasing Subsequence", "difficulty": "Medium", "link": "https://leetcode.com/problems/longest-increasing-subsequence/description/" }
];


function getRoomIdAndRedirect() {
    fetch('https://5e2b62bc-3c14-4aff-b3ed-a90fff910650-00-21sf5eeropuu7.riker.replit.dev/RoomIDGen'
        , {
            method: 'POST',
            mode: "cors",
            headers: { 'Content-Type': 'application/json' } // optional here
        })
        .then(res => res.json())
        .then(data => {
            const roomId = data.result;
            createChatBox(roomId);

        })
        .catch(err => console.error('Error fetching room ID:', err));
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

