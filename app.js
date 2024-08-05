document.getElementById('logFileInput').addEventListener('change', handleFileSelect, false);

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    parseLogFile(text);
}

async function parseLogFile(logText) {
    const lines = logText.split('\n');
    let encounters = [];
    let currentEncounter = null;

    for (let line of lines) {
        if (line.includes('ENCOUNTER_START')) {
            const parts = line.split(',');
            const bossId = parts[1];
            const bossName = parts[2].replace(/"/g, '');
            currentEncounter = { bossId, bossName, players: [] };
        } else if (line.includes('ENCOUNTER_END')) {
            if (currentEncounter) {
                encounters.push(currentEncounter);
                currentEncounter = null;
            }
        } else if (line.includes('COMBATANT_INFO')) {
            if (currentEncounter) {
                currentEncounter.players.push(line);
            }
        }
    }

    displayEncounters(encounters);
}

async function displayEncounters(encounters) {
    const output = document.getElementById('output');
    output.innerHTML = '';

    const combatantNames = await fetch('combatantNames.json').then(response => response.json());
    const itemEnchantResistances = await fetch('itemEnchantResistances.json').then(response => response.json());
    const itemSparseCSV = await fetch('itemsparse.csv').then(response => response.text());

    const itemSparse = parseCSV(itemSparseCSV);

    encounters.forEach(encounter => {
        const encounterDiv = document.createElement('div');
        encounterDiv.className = 'fight';
        encounterDiv.innerHTML = `<h2>Encounter: ${encounter.bossName}</h2>`;

        encounter.players.forEach(playerLine => {
            const playerInfo = parseCombatantInfo(playerLine);
            const playerName = combatantNames[playerInfo.id] || playerInfo.id;

            const playerDiv = document.createElement('div');
            playerDiv.className = 'card';
            playerDiv.innerHTML = `<h3>${playerName}</h3>`;

            let totalResistance = 0;
            let totalEnchantResistance = 0;

            playerInfo.gear.forEach(item => {
                const itemInfo = itemSparse[item.itemid];
                const resistance = itemInfo ? itemInfo["Resistances[2]"] : 0;
                const enchantResistance = itemEnchantResistances[item.enchant] || 0;
                totalResistance += resistance;
                totalEnchantResistance += enchantResistance;

                playerDiv.innerHTML += `
                    <p>Item ID: ${item.itemid}, Item Level: ${item.ilvl}, Enchant: ${item.enchant}, Gem1: ${item.gem1}, Gem2: ${item.gem2}</p>
                    <p>Display: ${itemInfo ? itemInfo.Display_lang : 'Unknown'}, Resistances[2]: ${resistance}, Enchant Resistances: ${enchantResistance}</p>
                `;
            });

            playerDiv.innerHTML += `<p>Total Resistances[2]: ${totalResistance}</p>`;
            playerDiv.innerHTML += `<p>Total Enchant Resistances: ${totalEnchantResistance}</p>`;

            encounterDiv.appendChild(playerDiv);
        });

        output.appendChild(encounterDiv);
    });
}

function parseCombatantInfo(line) {
    const combatantPattern = /COMBATANT_INFO,(.*?),0,(\d+),(\d+),(\d+),(\d+),(\d+),0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,(\d+),0,.*?\(\d+,\d+,\d+\),\(\),\[(.*?)\]/;
    const itemPattern = /\((\d+),(\d+),\((\d*),(\d*),(\d*)\),\(\),\(\)\)/;

    const match = combatantPattern.exec(line);
    const combatant_id = match[1];
    const items_info = match[8];

    const gear = [];
    let itemMatch;
    while ((itemMatch = itemPattern.exec(items_info)) !== null) {
        gear.push({
            itemid: itemMatch[1],
            ilvl: itemMatch[2],
            enchant: itemMatch[3],
            gem1: itemMatch[4],
            gem2: itemMatch[5]
        });
    }

    return { id: combatant_id, gear };
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const data = {};

    lines.slice(1).forEach(line => {
        const parts = line.split(',');
        const item = {};
        headers.forEach((header, index) => {
            item[header] = parts[index];
        });
        data[parts[0]] = item;
    });

    return data;
}
