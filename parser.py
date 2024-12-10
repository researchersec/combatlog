import re

# Read log data from the file
with open("idag.txt", "r") as file:
    log_data = file.read()

# Define the regex patterns for COMBATANT_INFO and items
combatant_pattern = re.compile(
    r"COMBATANT_INFO,(.*?),0,(\d+),(\d+),(\d+),(\d+),(\d+),0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,(\d+),0,.*?\(\d+,\d+,\d+\),\(\),\[(.*?)\]"
)
item_pattern = re.compile(r"\((\d+),(\d+),\((\d*),(\d*),(\d*)\),\(\),\(\)\)")

# Process the log data
combatants = []

for combatant_match in combatant_pattern.finditer(log_data):
    combatant_id = combatant_match.group(1)
    items_info = combatant_match.group(8)

    items = []
    for item_match in item_pattern.finditer(items_info):
        itemid = item_match.group(1)
        ilvl = item_match.group(2)
        enchant = item_match.group(3)
        gem1 = item_match.group(4)
        gem2 = item_match.group(5)
        items.append(
            {
                "itemid": itemid,
                "ilvl": ilvl,
                "enchant": enchant,
                "gem1": gem1,
                "gem2": gem2,
            }
        )

    combatants.append({"combatant_id": combatant_id, "items": items})
print(combatants)
