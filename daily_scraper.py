import requests
from bs4 import BeautifulSoup
import json
import os
import tempfile
import shutil
from datetime import datetime
import time


def clean_string(s):
    return "".join([c for c in s if c.isalpha() or c == " "])


def hardclean(s):
    return "".join([c for c in s if c.isalpha()])


def get_questions(response, payload):
    soup = BeautifulSoup(response.text, "html.parser")
    main_table = soup.find("div", class_="problems h-scrollable-table")

    if not main_table:
        return False

    table_body = main_table.find("tbody")
    if not table_body:
        return False

    all_problems = table_body.find_all("tr")

    for p in all_problems:
        problem = p.find("td", class_="problem")
        name = clean_string(problem.text)

        link = problem.find("a")
        url = f"https://aucpl.com{link.get('href')}"

        origin = "AUCPL"

        d = p.find("td", class_="category")
        difficulty = d.text.strip()

        payload["byName"][name] = {
            "Url": url,
            "Origin": origin,
            "Difficulty": hardclean(difficulty),
        }
        payload["byDifficulty"].setdefault(hardclean(difficulty),
                                           []).append(name)
        payload["byOrigin"].setdefault(origin, []).append(name)

    return True


def scrape_questions_with_retry():
    payload = {
        "byName": {},
        "byDifficulty": {},
        "byOrigin": {},
    }

    cur_page = 1
    # print(f"Starting scraper at {datetime.now()}")

    while True:
        # print(f"Scraping page {cur_page}...")

        # Retry logic for each page
        for attempt in range(3):
            try:
                response = requests.get(
                    f"https://aucpl.com/problems/?page={cur_page}", timeout=30)

                if response.status_code == 404:
                    # print(f"Reached end of pages at page {cur_page}")
                    return payload

                if response.status_code != 200:
                    raise requests.RequestException(
                        f"HTTP {response.status_code}")
                # print("resp 200")
                success = get_questions(response, payload)
                if not success:
                    # print(f"No more questions found on page {cur_page}")
                    return payload

                break  # Success, exit retry loop

            except (requests.RequestException, requests.Timeout) as e:
                # print(f"Attempt {attempt + 1} failed for page {cur_page}: {e}")
                if attempt == 2:  # Last attempt
                    raise Exception(
                        f"Failed to scrape page {cur_page} after 3 attempts: {e}"
                    )
                time.sleep(2**attempt)  # Exponential backoff

        cur_page += 1
        time.sleep(1)  # Be nice to the server

    return payload


def save_to_file_atomic(data):
    """Save data to file atomically with validation"""
    # Validate data before writing
    if not data.get("byName") or len(data["byName"]) == 0:
        raise ValueError(
            "No questions found - refusing to overwrite existing data")

    # print(f"Validated {len(data['byName'])} questions")

    # Make sure public directory exists
    os.makedirs("public", exist_ok=True)

    # Add metadata
    output_data = {
        **data, "lastUpdated": datetime.now().isoformat(),
        "totalQuestions": len(data["byName"])
    }

    # Write to temporary file first, then atomically rename
    final_path = "public/AllAUCPL.json"
    with tempfile.NamedTemporaryFile(mode='w',
                                     encoding='utf-8',
                                     dir="public",
                                     delete=False,
                                     suffix='.json.tmp') as temp_file:
        try:
            json.dump(output_data, temp_file, indent=2, ensure_ascii=False)
            temp_file.flush()
            os.fsync(temp_file.fileno())  # Force write to disk
            temp_path = temp_file.name
        except Exception as e:
            os.unlink(temp_file.name)  # Clean up temp file
            raise e

    # Atomic rename
    shutil.move(temp_path, final_path)
    print(
        f"Successfully saved {len(data['byName'])} questions to {final_path}")


if __name__ == "__main__":
    # print("Running")
    try:
        data = scrape_questions_with_retry()
        save_to_file_atomic(data)
        # print("Scraping completed successfully!")
    except Exception as e:
        # print(f"Error during scraping: {e}")
        raise
