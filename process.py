import json
import os

destination_path = "questions.json"

# Load the destination JSON file
with open(destination_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Load the input JSON file
with open("leetcode_questions.json", "r", encoding="utf-8") as f:
    leetcode_data = json.load(f)

# Iterate through each element
for element in leetcode_data:
    name = element.get("title")
    difficulty = element.get("difficulty")
    url = element.get("question_link")
    
    data["byName"][name] = {"Url": url, "Origin": "Leetcode", "Difficulty": difficulty}
    data["byDifficulty"].setdefault(difficulty, []).append(name)
    data["byOrigin"].setdefault("Leetcode", []).append(name)

# Save back to the JSON file
with open(destination_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("Snippets added successfully!")
