document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('logFile');
    if (!fileInput) {
        console.error('Element with ID "logFile" not found.');
        return;
    }

    fileInput.addEventListener('change', handleFileSelect, false);

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

    function parseLogFile(contents) {
        const lines = contents.split('\n');
        const players = {};

        lines.forEach(line => {
            if (line.includes('COMBATANT_INFO')) {
                try {
                    const player = parseCombatantInfo(line);
                    players[player.id] = player;
                } catch (error) {
                    console.error('Invalid gear info format:', line, error);
                }
            }
        });

        displayPlayers(players);
    }

    function parseCombatantInfo(line) {
        const parts = line.split(',');

        const id = parts[1];
        const specID = parts[2];
        const gear = parts[24];
        const talents = parts[23];

        const items = parseGear(gear);

        return { id, specID, items, talents };
    }

    function parseGear(gearString) {
        const items = [];
        const itemPattern = /\((\d+),(\d+),\(([\d,]*)\),\(\),\(\)\)/g;
        let match;

        while ((match = itemPattern.exec(gearString)) !== null) {
            const itemId = match[1];
            const itemLevel = match[2];
            const itemEnchant = match[3].split(',').filter(Boolean);

            items.push({ id: itemId, level: itemLevel, enchant: itemEnchant });
        }

        return items;
    }

    function displayPlayers(players) {
        const container = document.getElementById('output');
        container.innerHTML = '';

        for (const playerId in players) {
            const player = players[playerId];
            const playerElement = document.createElement('div');
            playerElement.className = 'player';

            const title = document.createElement('h2');
            title.textContent = `Player: ${playerId}, Spec: ${player.specID}`;
            playerElement.appendChild(title);

            const gearList = document.createElement('ul');
            player.items.forEach(item => {
                const listItem = document.createElement('li');
                const iconUrl = `https://wow.zamimg.com/images/wow/icons/large/${getItemIcon(item.id)}.jpg`;
                listItem.innerHTML = `
                    <a href="https://www.wowhead.com/item=${item.id}" data-wowhead="item=${item.id}">
                        <img src="${iconUrl}" alt="Item Icon" width="24" height="24"> 
                        Item ID: ${item.id}, Level: ${item.level}, Enchants: ${item.enchant.join(', ')}
                    </a>`;
                gearList.appendChild(listItem);
            });

            playerElement.appendChild(gearList);
            container.appendChild(playerElement);
        }

        // Apply wowhead tooltips
        if (typeof $WowheadPower != 'undefined') {
            $WowheadPower.refreshLinks();
        }
    }

    function getItemIcon(itemId) {
        // You might need to map item IDs to icon names.
        // Here, it's just a placeholder to demonstrate how you could get the item icon.
        return itemId;
    }
});
