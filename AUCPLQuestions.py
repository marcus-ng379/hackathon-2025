import requests
from bs4 import BeautifulSoup


def clean_string(s):
    """Remove unwanted characters from text"""
    return "".join([c for c in s if c.isalpha() or c == " "])


def get_questions(response, payload):
    """Extract questions from a page and update payload"""
    soup = BeautifulSoup(response.text, "html.parser")
    main_table = soup.find("div", class_="problems h-scrollable-table")

    if not main_table:
        return False  # No table found, stop scraping

    table_body = main_table.find("tbody")
    if not table_body:
        return False

    all_problems = table_body.find_all("tr")

    for p in all_problems:
        # Get name
        problem = p.find("td", class_="problem")
        name = clean_string(problem.text)

        # Get URL
        link = problem.find("a")
        url = f"https://aucpl.com/problems/{link.get('href')}"

        # Origin
        origin = "AUCPL"

        # Difficulty
        d = p.find("td", class_="category")
        difficulty = d.text.strip()

        # Add to payload
        payload["byName"][name] = {
            "Url": url,
            "Origin": origin,
            "Difficulty": difficulty,
        }
        payload["byDifficulty"].setdefault(difficulty, []).append(name)
        payload["byOrigin"].setdefault(origin, []).append(name)

    return True


def main():
    # Initialize payload
    payload = {
        "byName": {},
        "byDifficulty": {},
        "byOrigin": {},
    }

    cur_page = 1
    while True:
        response = requests.get(f"https://aucpl.com/problems/?page={cur_page}")
        if response.status_code != 200:
            break

        print(f"Scraping page {cur_page}...")
        success = get_questions(response, payload)
        if not success:
            break

        cur_page += 1

    # Send results to local server
    try:
        r = requests.post("http://localhost:3000/scraped", json=payload)
        print("POST status:", r.status_code)
    except Exception as e:
        print("Failed to send data:", e)


if __name__ == "__main__":
    main()
