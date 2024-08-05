document.getElementById('logFile').addEventListener('change', handleFileSelect, false);
document.getElementById('namesFile').addEventListener('change', handleFileSelect, false);
document.getElementById('itemsFile').addEventListener('change', handleFileSelect, false);
document.getElementById('enchantResistancesFile').addEventListener('change', handleFileSelect, false);

let combatantNames = {};
let items = {};
let enchantResistances = {};

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        if (event.target.id === 'logFile') {
            parseLogFile(e.target.result);
        } else if (event.target.id === 'namesFile') {
            combatantNames = JSON.parse(e.target.result);
        } else if (event.target.id === 'itemsFile') {
            parseCSV(e.target.result, parseItems);
        } else if (event.target.id === 'enchantResistancesFile') {
            enchantResistances = JSON.parse(e.target.result);
        }
    };
    
    reader.readAsText(file);
}

function parseLogFile(data) {
    const lines = data.split('\n');
    let encounters = [];
    let currentEncounter = null;

    lines.forEach(line => {
        if (line.includes('ENCOUNTER_START')) {
            const parts = line.split(',');
            currentEncounter = {
                id: parts[1],
                name: parts[2],
                players: []
            };
        } else if (line.includes('ENCOUNTER_END')) {
            encounters.push(currentEncounter);
            currentEncounter = null;
        } else if (line.includes('COMBATANT_INFO') && currentEncounter) {
            const parts = line.split(',');
            const playerId = parts[1];
            const items = JSON.parse(parts.slice(24).join(',')).map(item => item[2]);
            currentEncounter.players.push({ playerId, items });
        }
    });

    displayEncounters(encounters);
}

function parseCSV(data, callback) {
    const lines = data.split('\n');
    const headers = lines[0].split(',');
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentLine = lines[i].split(',');

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentLine[j];
        }
        result.push(obj);
    }
    callback(result);
}

function parseItems(data) {
    data.forEach(item => {
        items[item.ID] = item.Resistances[2];
    });
}

function displayEncounters(encounters) {
    const output = document.getElementById('output');
    output.innerHTML = '';

    encounters.forEach(encounter => {
        const encounterDiv = document.createElement('div');
        encounterDiv.className = 'card';

        const title = document.createElement('h3');
        title.textContent = `Encounter: ${encounter.name}`;
        encounterDiv.appendChild(title);

        encounter.players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.textContent = combatantNames[player.playerId] || player.playerId;

            let totalResistance = 0;
            player.items.forEach(itemId => {
                const itemResistance = items[itemId] || 0;
                const enchantResistance = enchantResistances[itemId] || 0;
                totalResistance += parseInt(itemResistance) + parseInt(enchantResistance);
            });

            playerDiv.textContent += ` - Total Resistance: ${totalResistance}`;
            encounterDiv.appendChild(playerDiv);
        });

        output.appendChild(encounterDiv);
    });
}
