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

            playerInfo.gear.forEach(item => {
                const itemInfo = itemSparse[item.id];
                const resistance = itemInfo ? itemInfo['Resistances[2]'] : 0;
                playerDiv.innerHTML += `<p>Item ID: ${item.id}, Resistance: ${resistance}</p>`;
            });

            encounterDiv.appendChild(playerDiv);
        });

        output.appendChild(encounterDiv);
    });
}

function parseCombatantInfo(line) {
    const parts = line.split(',');
    const id = parts[1];
    const gearString = parts[25];
    const gear = gearString.substring(2, gearString.length - 2).split('),(').map(g => {
        const gearParts = g.split(',');
        return { id: gearParts[0], resistance: gearParts[1] };
    });
    return { id, gear };
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
