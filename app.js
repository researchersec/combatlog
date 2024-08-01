// app.js
function processFile() {
    const input = document.getElementById('file-input');
    const file = input.files[0];

    if (!file) {
        alert('Please upload a file first.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const text = event.target.result;
        analyzeFile(text);
    };
    reader.readAsText(file);
}

function analyzeFile(content) {
    // Split the content into lines
    const lines = content.split('\n');
    let results = '';

    lines.forEach((line) => {
        // Assuming each line follows a structure defined in the documentation
        const columns = line.split('\t');
        // You can further parse each column based on the documentation
        results += `Timestamp: ${columns[0]}, Subevent: ${columns[1]}\n`;
    });

    document.getElementById('results').textContent = results;
}
