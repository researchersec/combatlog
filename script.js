document.getElementById('fileInput').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            parseCombatLog(text);
        };
        reader.readAsText(file);
    }
}

function parseCombatLog(text) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // Clear previous results

    // Example parsing logic
    const lines = text.split('\n');
    let playerData = {};
    
    lines.forEach(line => {
        // Simple example of extracting gear and resistances
        // This will depend on the actual log format
        if (line.includes('Gear:')) {
            const parts = line.split(' ');
            const playerName = parts[0];
            const gear = parts.slice(1).join(' ');
            if (!playerData[playerName]) {
                playerData[playerName] = { gear: gear, resistances: {} };
            } else {
                playerData[playerName].gear = gear;
            }
        } else if (line.includes('Resistance:')) {
            const parts = line.split(' ');
            const playerName = parts[0];
            const resistanceType = parts[1];
            const resistanceValue = parts[2];
            if (!playerData[playerName]) {
                playerData[playerName] = { gear: '', resistances: {} };
            }
            playerData[playerName].resistances[resistanceType] = resistanceValue;
        }
    });

    // Display parsed data
    Object.keys(playerData).forEach(playerName => {
        const data = playerData[playerName];
        const gear = data.gear || 'N/A';
        const resistances = Object.entries(data.resistances).map(([type, value]) => `${type}: ${value}`).join(', ');

        resultDiv.innerHTML += `<h2>${playerName}</h2>`;
        resultDiv.innerHTML += `<p>Gear: ${gear}</p>`;
        resultDiv.innerHTML += `<p>Resistances: ${resistances}</p>`;
    });
}
