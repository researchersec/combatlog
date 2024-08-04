function parseCombatLog(fileContent) {
    const lines = fileContent.split('\n');
    const combatants = {}; // To store combatant names

    const items = [];
    let currentCombatant = null;

    lines.forEach(line => {
        if (line.startsWith('PARTY_KILL')) {
            // Extract the combatant ID and name from the PARTY_KILL event
            const parts = line.split(' ');
            const combatantID = parts[1];
            const combatantName = parts.slice(2).join(' '); // Assumes the name follows the ID
            combatants[combatantID] = combatantName;
        } else if (line.startsWith('ENCOUNTER_START')) {
            // Extract the combatant ID and name from the ENCOUNTER_START event
            const parts = line.split(' ');
            const combatantID = parts[1];
            const combatantName = parts.slice(2).join(' '); // Assumes the name follows the ID
            combatants[combatantID] = combatantName;
        } else if (line.startsWith('UNIT_DIED')) {
            // Extract the combatant ID and name from the UNIT_DIED event
            const parts = line.split(' ');
            const combatantID = parts[1];
            const combatantName = parts.slice(2).join(' '); // Assumes the name follows the ID
            combatants[combatantID] = combatantName;
        } else if (line.startsWith('ITEM')) {
            // Parse item data
            const parts = line.split('\t');
            const combatantID = parts[0];
            const itemID = parts[1];
            const itemLevel = parts[2];
            const enchant = parts[3];
            const gem1 = parts[4];
            const gem2 = parts[5];
            
            // Get the combatant name
            const combatantName = combatants[combatantID] || combatantID; // Use ID if name is unknown
            
            items.push({
                combatantName,
                itemID,
                itemLevel,
                enchant,
                gem1,
                gem2
            });
        }
    });

    return items;
}
