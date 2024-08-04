document.addEventListener('DOMContentLoaded', () => {
    const logInput = document.getElementById('logInput');
    const csvInput = document.getElementById('csvInput');
    const resultsTableBody = document.querySelector('#results tbody');

    let combatants = {};
    let itemsparse = {};
    const itemEnchantResistances = {
        '1505': 20,  // Lesser Arcanum of Resilience
        '7564': 20,  // Hydraxian Coronation
        // Add more item IDs and their enchant resistances as needed
    };

    logInput.addEventListener('change', handleLogFileSelect);
    csvInput.addEventListener('change', handleCSVFileSelect);

    function handleLogFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            parseLogData(e.target.result);
        };
        reader.readAsText(file);
    }

    function handleCSVFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            parseCSVData(e.target.result);
        };
        reader.readAsText(file);
    }

    function parseLogData(text) {
        const combatantPattern = /COMBATANT_INFO,(.*?),0,(\d+),(\d+),(\d+),(\d+),(\d+),0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,(\d+),0,.*?\(\d+,\d+,\d+\),\(\),\[(.*?)\]/g;
        const itemPattern = /\((\d+),(\d+),\((\d*),(\d*),(\d*)\),\(\),\(\)\)/g;

        combatants = {};  // Reset combatants

        let match;
        while ((match = combatantPattern.exec(text)) !== null) {
            const combatantId = match[1];
            const itemsInfo = match[8];

            const items = [];
            let itemMatch;
            while ((itemMatch = itemPattern.exec(itemsInfo)) !== null) {
                const itemid = itemMatch[1];
                const ilvl = itemMatch[2];
                const enchant = itemMatch[3];
                const gem1 = itemMatch[4];
                const gem2 = itemMatch[5];
                items.push({
                    itemid,
                    ilvl,
                    enchant,
                    gem1,
                    gem2
                });
            }

            combatants[combatantId] = {
                items
            };
        }

        processAndDisplayResults();
    }

    function parseCSVData(text) {
        const rows = text.split('\n').map(row => row.split(','));
        const header = rows.shift();  // Remove header
        itemsparse = {};  // Reset itemsparse

        rows.forEach(row => {
            if (row.length < 3) return;  // Skip invalid rows
            const [id, display_lang, resistances2] = row;
            itemsparse[id] = {
                Display_lang: display_lang,
                Resistances2: parseInt(resistances2, 10) || 0
            };
        });
    }

    function processAndDisplayResults() {
        resultsTableBody.innerHTML = '';  // Clear existing results

        const processedIds = new Set();

        Object.keys(combatants).forEach(combatantId => {
            if (processedIds.has(combatantId)) return;
            processedIds.add(combatantId);

            const data = combatants[combatantId];
            const combatantName = combatantId;  // Default to combatant ID, replace with name lookup if available

            let totalResistance = 0;
            let totalEnchantResistance = 0;

            data.items.forEach(item => {
                const { itemid, ilvl, enchant, gem1, gem2 } = item;
                const itemInfo = itemsparse[itemid] || {};
                const enchantResistance = itemEnchantResistances[enchant] || 0;
                totalResistance += itemInfo.Resistances2 || 0;
                totalEnchantResistance += enchantResistance;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${combatantName}</td>
                    <td>${itemid}</td>
                    <td>${ilvl}</td>
                    <td>${enchant}</td>
                    <td>${gem1}</td>
                    <td>${gem2}</td>
                    <td>${itemInfo.Display_lang || 'Unknown'}</td>
                    <td>${itemInfo.Resistances2 || 0}</td>
                    <td>${enchantResistance}</td>
                `;
                resultsTableBody.appendChild(tr);
            });

            const trTotal = document.createElement('tr');
            trTotal.innerHTML = `
                <td colspan="6"><strong>Total Resistances[2] and Enchant Resistances for ${combatantName}</strong></td>
                <td>${totalResistance}</td>
                <td>${totalEnchantResistance}</td>
            `;
            resultsTableBody.appendChild(trTotal);
        });
    }
});
