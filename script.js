document.getElementById('fileInput').addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            parseAndDisplayGear(content);
        };
        reader.readAsText(file);
    }
}

function parseAndDisplayGear(content) {
    // Assuming content follows the format: "ItemID: [ItemID], ilvl: [ilvl], Enchants: [EnchantID1, EnchantID2, EnchantID3]"
    const lines = content.split('\n');
    const gearOutput = document.getElementById('gear-output');
    gearOutput.innerHTML = ''; // Clear previous content

    lines.forEach(line => {
        if (line.trim()) {
            const [itemPart, ilvlPart, enchantsPart] = line.split(', ');
            const itemId = itemPart.split(': ')[1];
            const ilvl = ilvlPart.split(': ')[1];
            const enchantIds = enchantsPart ? enchantsPart.split(': ')[1].split(', ') : [];

            const listItem = document.createElement('li');
            const itemLink = document.createElement('a');
            itemLink.href = `https://www.wowhead.com/item=${itemId}`;
            itemLink.rel = 'item';
            itemLink.textContent = `Item ${itemId} - ilvl ${ilvl}`;
            listItem.appendChild(itemLink);

            if (enchantIds.length > 0) {
                const enchantList = document.createElement('ul');
                enchantIds.forEach(enchantId => {
                    const enchantItem = document.createElement('li');
                    const enchantLink = document.createElement('a');
                    enchantLink.href = `https://www.wowhead.com/spell=${enchantId}`;
                    enchantLink.rel = 'spell';
                    enchantLink.textContent = `Enchant ${enchantId}`;
                    enchantItem.appendChild(enchantLink);
                    enchantList.appendChild(enchantItem);
                });
                listItem.appendChild(enchantList);
            }

            gearOutput.appendChild(listItem);
        }
    });
}
