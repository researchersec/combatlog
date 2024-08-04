document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const resultsTableBody = document.querySelector('#results tbody');

    fileInput.addEventListener('change', handleFileSelect);

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            parseCombatLog(e.target.result);
        };
        reader.readAsText(file);
    }

    function parseCombatLog(text) {
        const lines = text.split('\n');
        const combatantNames = {};  // Stores the mapping of Combatant IDs to Names
        const results = [];

        for (const line of lines) {
            const parts = line.split(' ');
            if (parts.length < 7) continue;  // Skip invalid lines

            const [timestamp, event, combatantId, itemId, itemLevel, enchant, gem1, gem2] = parts;
            
            if (event === "COMBATANT_INFO") {
                combatantNames[combatantId] = parts.slice(3).join(' ');  // Store combatant names
            } else {
                results.push({
                    combatantId,
                    itemId,
                    itemLevel,
                    enchant,
                    gem1,
                    gem2
                });
            }
        }

        displayResults(results, combatantNames);
    }

    function displayResults(results, combatantNames) {
        resultsTableBody.innerHTML = '';  // Clear existing results

        for (const result of results) {
            const tr = document.createElement('tr');

            const combatantName = combatantNames[result.combatantId] || result.combatantId;

            tr.innerHTML = `
                <td>${combatantName}</td>
                <td>${result.itemId}</td>
                <td>${result.itemLevel}</td>
                <td>${result.enchant}</td>
                <td>${result.gem1}</td>
                <td>${result.gem2}</td>
            `;

            resultsTableBody.appendChild(tr);
        }
    }
});
