document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileContent = e.target.result;
            const items = parseCombatLog(fileContent);
            displayItems(items);
        };
        reader.readAsText(file);
    }
});

function displayItems(items) {
    const tableBody = document.querySelector('#resultsTable tbody');
    tableBody.innerHTML = ''; // Clear existing content

    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.combatantName}</td>
            <td>${item.itemID}</td>
            <td>${item.itemLevel}</td>
            <td>${item.enchant}</td>
            <td>${item.gem1}</td>
            <td>${item.gem2}</td>
        `;
        tableBody.appendChild(row);
    });
}
