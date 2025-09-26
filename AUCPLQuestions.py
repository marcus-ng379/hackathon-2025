import requests
from bs4 import BeautifulSoup
import json

def cleanString(s):
    t = ""
    for c in s:
        if (c >= "A" and c <= "Z") or (c >= "a" and c <= "z") or (c == " "):
            t += c
    return t

def getQuestions(response):
    global payload
    soup = BeautifulSoup(response.text, 'html.parser')
    main_table = soup.find("div", class_="problems h-scrollable-table")

    table_body = main_table.find("tbody")
    allProblems = table_body.find_all("tr")

    for p in allProblems:
        cache = []
        # Get name
        problem = p.find("td", class_="problem")
        cache.append({"Name" : cleanString(problem.text)})
        # Get Url
        link = problem.find("a")
        cache.append({"Url" : f"https://aucpl.com/problems/{link.get('href')}"})
        # Get origin
        cache.append({"Origin" : "AUCPL"})
        # Get difficulty
        d = p.find("td", class_="category")
        cache.append({"Difficulty" : d.text})
        payload.append(cache)
        

def main():
    global payload
    payload = []

    curPage = 1
    response_code = 200
    while (response_code == 200):
        response = requests.get(f"https://aucpl.com/problems/?page={curPage}")
        response_code = response.status_code
        if (response_code == 200):
            getQuestions(response)
        print(f"On page {curPage} with stat code: {response_code}")
        curPage += 1
    
    
    with open("problems.json", "w") as f:
        json.dump(payload, f, indent=2)


main() 