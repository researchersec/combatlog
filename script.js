document.getElementById('fileInput').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        processLogData(text);
    };
    reader.readAsText(file);
}

function processLogData(logData) {
    const combatantPattern = /COMBATANT_INFO,(.*?),0,(\d+),(\d+),(\d+),(\d+),(\d+),0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,(\d+),0,.*?\(\d+,\d+,\d+\),\(\),\[(.*?)\]/g;
    const itemPattern = /\((\d+),(\d+),\((\d*),(\d*),(\d*)\),\(\),\(\)\)/g;

    let combatants = {};
    let match;

    // Extract combatant information
    while ((match = combatantPattern.exec(logData)) !== null) {
        const combatantId = match[1];
        const itemsInfo = match[8];

        let items = [];
        let itemMatch;
        while ((itemMatch = itemPattern.exec(itemsInfo)) !== null) {
            items.push({
                itemid: itemMatch[1],
                ilvl: itemMatch[2],
                enchant: itemMatch[3],
                gem1: itemMatch[4],
                gem2: itemMatch[5]
            });
        }

        combatants[combatantId] = { items: items };
    }

    displayCombatants(combatants);
}

function displayCombatants(combatants) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Create table headers
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Combatant ID</th>
        <th>Item ID</th>
        <th>Item Level</th>
        <th>Enchant</th>
        <th>Gem1</th>
        <th>Gem2</th>
    `;
    thead.appendChild(headerRow);

    // Populate table rows
    for (const [combatantId, data] of Object.entries(combatants)) {
        data.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${combatantId}</td>
                <td>${item.itemid}</td>
                <td>${item.ilvl}</td>
                <td>${item.enchant}</td>
                <td>${item.gem1}</td>
                <td>${item.gem2}</td>
            `;
            tbody.appendChild(row);
        });
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    resultDiv.appendChild(table);
}
