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

function logMessage(message) {
    const consoleLogDiv = document.getElementById('consoleLog');
    consoleLogDiv.innerHTML += `<p>${message}</p>`;
}

function updateProgress(percentage) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    progressBar.value = percentage;
    progressText.textContent = `${percentage}%`;
}

function parseCombatLog(text) {
    const resultDiv = document.getElementById('result');
    const consoleLogDiv = document.getElementById('consoleLog');
    resultDiv.innerHTML = ''; // Clear previous results
    consoleLogDiv.innerHTML = ''; // Clear previous logs
    updateProgress(0); // Initialize progress

    const lines = text.split('\n');
    let playerData = {};
    
    const totalLines = lines.length;
    lines.forEach((line, index) => {
        // Update progress
        const percentage = Math.round((index / totalLines) * 100);
        updateProgress(percentage);

        // Simple example of extracting gear and resistances
        if (line.includes('Gear:')) {
            const parts = line.split(' ');
            const playerName = parts[0];
            const gear = parts.slice(1).join(' ');
            if (!playerData[playerName]) {
                playerData[playerName] = { gear: gear, resistances: {} };
            } else {
                playerData[playerName].gear = gear;
            }
            logMessage(`Parsed gear for ${playerName}: ${gear}`);
        } else if (line.includes('Resistance:')) {
            const parts = line.split(' ');
            const playerName = parts[0];
            const resistanceType = parts[1];
            const resistanceValue = parts[2];
            if (!playerData[playerName]) {
                playerData[playerName] = { gear: '', resistances: {} };
            }
            playerData[playerName].resistances[resistanceType] = resistanceValue;
            logMessage(`Parsed resistance for ${playerName}: ${resistanceType} - ${resistanceValue}`);
        }
    });

    // Final progress update
    updateProgress(100);

    // Display parsed data
    Object.keys(playerData).forEach(playerName => {
        const data = playerData[playerName];
        const gear = data.gear || 'N/A';
        const resistances = Object.entries(data.resistances).map(([type, value]) => `${type}: ${value}`).join(', ');

        resultDiv.innerHTML += `<h2>${playerName}</h2>`;
        resultDiv.innerHTML += `<p>Gear: ${gear}</p>`;
        resultDiv.innerHTML += `<p>Resistances: ${resistances}</p>`;
    });

    logMessage('Parsing completed.');
}
