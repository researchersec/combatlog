// Load combatant names and item resistances
const combatantNames = fetch('combatantNames.json').then(res => res.json());
const itemResistances = fetch('itemEnchantResistances.json').then(res => res.json());
const itemsData = fetch('itemsparse.csv').then(res => res.text()).then(parseCSV);

document.getElementById('logFile').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const contents = event.target.result;
        parseLogFile(contents);
    };
    reader.readAsText(file);
}

async function parseLogFile(contents) {
    const combatantNamesMap = await combatantNames;
    const resistancesMap = await itemResistances;
    const itemsMap = await itemsData;

    const lines = contents.split('\n');
    let fights = [];
    let currentFight = null;

    lines.forEach(line => {
        if (line.includes('ENCOUNTER_START')) {
            const [ , , bossName ] = line.split(',');
            currentFight = { bossName, players: [] };
            fights.push(currentFight);
        } else if (line.includes('ENCOUNTER_END')) {
            currentFight = null;
        } else if (line.includes('COMBATANT_INFO') && currentFight) {
            const parts = line.split(',');
            const id = parts[1];
            const playerName = combatantNamesMap[id] || id;
            const gearString = parts[24];  // Adjust based on actual log structure
            const items = parseGear(gearString, itemsMap, resistancesMap);
            currentFight.players.push({ id: playerName, items });
        }
    });

    displayFights(fights);
}

function parseGear(gearString, itemsMap, resistancesMap) {
    const items = [];
    const itemPattern = /\((\d+),(\d+),\(([\d,]*)\),\(\),\(\)\)/g;
    let match;

    while ((match = itemPattern.exec(gearString)) !== null) {
        const itemId = match[1];
        const itemLevel = match[2];
        const itemEnchant = match[3].split(',').filter(Boolean);
        let resistance = 0;

        if (itemsMap[itemId] && itemsMap[itemId].resistances) {
            resistance += parseInt(itemsMap[itemId].resistances[2], 10);
        }

        itemEnchant.forEach(enchantId => {
            if (resistancesMap[enchantId]) {
                resistance += resistancesMap[enchantId];
            }
        });

        items.push({ id: itemId, level: itemLevel, enchant: itemEnchant, resistance });
    }

    return items;
}

function parseCSV(csv) {
    const rows = csv.split('\n');
    const header = rows[0].split(',');
    const resistanceIndex = header.indexOf('Resistances[2]');
    const itemMap = {};

    rows.slice(1).forEach(row => {
        const columns = row.split(',');
        const id = columns[0];
        const resistances = columns.slice(resistanceIndex, resistanceIndex + 7);
        if (id) {
            itemMap[id] = { resistances };
        }
    });

    return itemMap;
}

function displayFights(fights) {
    const output = document.getElementById('output');
    output.innerHTML = '';

    fights.forEach(fight => {
        const fightDiv = document.createElement('div');
        fightDiv.className = 'fight';
        fightDiv.innerHTML = `<h2>Boss: ${fight.bossName}</h2>`;

        fight.players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player';
            playerDiv.innerHTML = `<h3>${player.id}</h3>`;
            
            const gearList = document.createElement('div');
            player.items.forEach(item => {
                const listItem = document.createElement('div');
                listItem.className = 'item';
                listItem.innerHTML = `
                    <a href="https://www.wowhead.com/item=${item.id}" data-wowhead="item=${item.id}">
                        <img src="https://wow.zamimg.com/images/wow/icons/large/${item.id}.jpg" alt="Item">
                    </a>
                    <span>Resistance: ${item.resistance}</span>
                `;
                gearList.appendChild(listItem);
            });

            playerDiv.appendChild(gearList);
            fightDiv.appendChild(playerDiv);
        });

        output.appendChild(fightDiv);
    });

    // Load Wowhead tooltips
    if (typeof wowhead_tooltips !== 'undefined') {
        wowhead_tooltips();
    }
}
