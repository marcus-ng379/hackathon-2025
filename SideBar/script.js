
createRoomBtn.addEventListener('click', () => {
    const homePage = document.getElementById('home');
    alert("Create");
    homePage.innerHTML = "";
});
enterRoomBtn.addEventListener('click', () => {
    const homePage = document.getElementById('home');
    alert(document.getElementById('roomCode').value);
    homePage.innerHTML = "";
});
EnterCode.addEventListener('click', () => {
    const createPage = document.getElementById('home');
    alert("Create");
    createPage.innerHTML = "";
});
/*
/*
/*
const links = [["https://aucpl.com/problem/agaradventure", "Agar Adventure", "B"], ["https://aucpl.com/problem/ai", "ai", "A"]];
const container = document.getElementById("links");
for (let i = 0; i < links.length; i++) {
    const url = links[i][0];
    const btn = document.createElement("button");
    btn.textContent = links[i][1];
    btn.onclick = () => window.open(url, "_blank");
    container.appendChild(btn)
}



*/

//The page update.


