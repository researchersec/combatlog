import re
import csv
import json

# Load item enchant resistances from JSON file
with open('itemEnchantResistances.json') as f:
    item_enchant_resistances = json.load(f)

# Load combatant names from JSON file
with open('combatantNames.json') as f:
    combatant_names = json.load(f)

# Read log data from the file
with open('WoWLogShort.txt', 'r') as file:
    log_data = file.read()

# Define the regex patterns for COMBATANT_INFO and items
combatant_pattern = re.compile(r'COMBATANT_INFO,(.*?),0,(\d+),(\d+),(\d+),(\d+),(\d+),0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,(\d+),0,.*?\(\d+,\d+,\d+\),\(\),\[(.*?)\]')
item_pattern = re.compile(r'\((\d+),(\d+),\((\d*),(\d*),(\d*)\),\(\),\(\)\)')

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
        items.append({
            "itemid": itemid,
            "ilvl": ilvl,
            "enchant": enchant,
            "gem1": gem1,
            "gem2": gem2
        })

    combatants.append({
        "combatant_id": combatant_id,
        "items": items
    })

# Load itemsparse.csv
itemsparse = {}
with open('itemsparse.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        itemsparse[row['ID']] = {
            "Display_lang": row['Display_lang'],
            "Resistances[2]": int(row['Resistances[2]']) if row['Resistances[2]'] else 0
        }

# Combine the data and calculate total resistance
combatant_resistances = []

for combatant in combatants:
    total_resistance = 0
    total_enchant_resistance = 0
    combatant_id = combatant['combatant_id']
    player_name = combatant_names.get(combatant_id, combatant_id)

    for item in combatant['items']:
        itemid = item['itemid']
        enchant = item['enchant']
        if itemid in itemsparse:
            item_info = itemsparse[itemid]
            total_resistance += item_info["Resistances[2]"]
            enchant_resistance = item_enchant_resistances.get(enchant, 0)
            total_enchant_resistance += enchant_resistance

    total_combined_resistance = total_resistance + total_enchant_resistance
    combatant_resistances.append({
        "player_name": player_name,
        "total_resistance": total_combined_resistance
    })

# Print results
print("Player Name, Total Resistance")
for combatant in combatant_resistances:
    print(f"{combatant['player_name']}, {combatant['total_resistance']}")

# Write to CSV
with open('combatant_resistances.csv', mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['Player Name', 'Total Resistance'])
    for combatant in combatant_resistances:
        writer.writerow([combatant['player_name'], combatant['total_resistance']])
