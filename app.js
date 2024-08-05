document.getElementById('logFileInput').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const logContent = e.target.result;
            parseLogFile(logContent);
        };
        reader.readAsText(file);
    }
}

async function parseLogFile(logContent) {
    const combatantNames = await fetchJSON('combatantNames.json');
    const itemEnchantResistances = await fetchJSON('itemEnchantResistances.json');
    const itemSparseData = await fetchCSV('itemsparse.csv');

    const encounters = [];
    const lines = logContent.split('\n');

    let currentEncounter = null;
    for (const line of lines) {
        if (line.includes('ENCOUNTER_START')) {
            currentEncounter = { start: line, players: [] };
        } else if (line.includes('ENCOUNTER_END')) {
            if (currentEncounter) {
                currentEncounter.end = line;
                encounters.push(currentEncounter);
                currentEncounter = null;
            }
        } else if (line.includes('COMBATANT_INFO') && currentEncounter) {
            const combatantInfo = parseCombatantInfo(line, combatantNames, itemSparseData, itemEnchantResistances);
            currentEncounter.players.push(combatantInfo);
        }
    }

    displayEncounters(encounters);
}

function fetchJSON(url) {
    return fetch(url).then(response => response.json());
}

function fetchCSV(url) {
    return fetch(url).then(response => response.text()).then(csvToJSON);
}

function csvToJSON(csv) {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const row = lines[i].split(',');
        headers.forEach((header, j) => {
            obj[header] = row[j];
        });
        result.push(obj);
    }
    return result;
}

function parseCombatantInfo(line, combatantNames, itemSparseData, itemEnchantResistances) {
    const parts = line.split(',');
    const playerId = parts[1];
    const gearInfoMatch = line.match(/\[(.*?)\]$/);

    if (!gearInfoMatch) {
        console.error('Invalid gear info format:', line);
        return { playerId, playerName: combatantNames[playerId] || playerId, resistances: 0, items: [] };
    }

    const gearInfoString = gearInfoMatch[1];
    const gearInfo = parseGearInfo(gearInfoString);
    const playerName = combatantNames[playerId] || playerId;

    const resistances = gearInfo.reduce((totalResistance, item) => {
        const itemId = item[0];
        const itemData = itemSparseData.find(data => data.ID == itemId);
        if (itemData) {
            const resistance = parseInt(itemData['Resistances[2]'], 10) || 0;
            totalResistance += resistance;

            if (item[2].length > 0) {
                const enchantmentId = item[2][0];
                if (itemEnchantResistances[enchantmentId]) {
                    totalResistance += itemEnchantResistances[enchantmentId];
                }
            }
        }
        return totalResistance;
    }, 0);

    const items = gearInfo.map(item => {
        const itemId = item[0];
        return {
            id: itemId,
            enchantmentId: item[2].length > 0 ? item[2][0] : null,
            icon: `https://wow.zamimg.com/images/wow/icons/large/${itemId}.jpg`
        };
    });

    return { playerId, playerName, resistances, items };
}

function parseGearInfo(gearInfoString) {
    return gearInfoString.split('),(').map(itemString => {
        return itemString.replace(/[\[\]()]/g, '').split(',').map(value => {
            return value.includes('(') ? value.split('(').map(val => val.replace(')', '')) : value;
        });
    });
}

function displayEncounters(encounters) {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '';

    encounters.forEach(encounter => {
        const encounterDiv = document.createElement('div');
        encounterDiv.classList.add('encounter');

        const encounterTitle = document.createElement('h2');
        encounterTitle.textContent = `Encounter: ${encounter.start.split(',')[2]}`;
        encounterDiv.appendChild(encounterTitle);

        encounter.players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.classList.add('player');

            const playerName = document.createElement('h3');
            playerName.textContent = `Player: ${player.playerName}`;
            playerDiv.appendChild(playerName);

            const resistanceInfo = document.createElement('p');
            resistanceInfo.classList.add('resistance');
            resistanceInfo.textContent = `Resistance: ${player.resistances}`;
            playerDiv.appendChild(resistanceInfo);

            player.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item');

                const itemIcon = document.createElement('img');
                itemIcon.src = item.icon;
                itemDiv.appendChild(itemIcon);

                const itemLink = document.createElement('a');
                itemLink.classList.add('item-link');
                itemLink.href = `https://www.wowhead.com/item=${item.id}`;
                itemLink.target = '_blank';
                itemLink.rel = 'noopener noreferrer';
                itemLink.textContent = `Item ${item.id}`;
                itemDiv.appendChild(itemLink);

                playerDiv.appendChild(itemDiv);
            });

            encounterDiv.appendChild(playerDiv);
        });

        contentDiv.appendChild(encounterDiv);
    });

    // Apply WoWHead tooltips
    WH.Tooltips.refresh();
}
