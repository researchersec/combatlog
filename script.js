document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        processCombatLog(content);
    };
    reader.readAsText(file);
});

function processCombatLog(content) {
    const lines = content.split('\n');
    const totalLines = lines.length;
    const gearInfo = {};
    const gearPattern = /(\d+) (\d+)(?: (\d+))?(?: (\d+))?(?: (\d+))?/;
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');

    progressContainer.style.display = 'block';

    lines.forEach((line, index) => {
        updateProgressBar(index, totalLines);

        const parts = line.split(': ');
        const key = parts[0];
        const value = parts[1];

        if (key === "Equipment") {
            const items = value.split(',');
            items.forEach(item => {
                const match = item.trim().match(gearPattern);
                if (match) {
                    const itemId = match[1];
                    const ilvl = match[2];
                    const enchantments = match.slice(3).filter(Boolean);

                    gearInfo[itemId] = { ilvl, enchantments };
                }
            });
        }
    });

    displayGearInfo(gearInfo);
    updateProgressBar(totalLines, totalLines);
}

function updateProgressBar(current, total) {
    const progressBar = document.getElementById('progress-bar');
    const percentage = Math.round((current / total) * 100);
    progressBar.style.width = percentage + '%';
    progressBar.innerText = percentage + '%';
}

function displayGearInfo(gearInfo) {
    const output = document.getElementById('output');
    output.innerHTML = "";

    for (const itemId in gearInfo) {
        const item = gearInfo[itemId];
        const ilvl = item.ilvl;
        const enchantments = item.enchantments;

        let enchantLinks = enchantments.map(enchantId => {
            return `<a href="https://www.wowhead.com/spell=${enchantId}" rel="enchantment">${enchantId}</a>`;
        }).join(', ');

        if (!enchantLinks) enchantLinks = 'None';

        const itemLink = `<a href="https://www.wowhead.com/item=${itemId}" rel="item">${itemId}</a>`;
        output.innerHTML += `Item: ${itemLink}, ilvl: ${ilvl}, Enchantments: ${enchantLinks}\n`;
    }

    // Activate Wowhead tooltips
    if (typeof whTooltips !== 'undefined') {
        whTooltips.refreshLinks();
    }

    // Hide progress bar after processing
    const progressContainer = document.getElementById('progress-container');
    progressContainer.style.display = 'none';
}
