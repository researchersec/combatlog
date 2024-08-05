import { Player, Item, parseCSV, fetchJSON } from './types';

document.getElementById('logFile')?.addEventListener('change', handleFileSelect);

let itemsData: Record<string, number> = {};
let combatantNames: Record<string, string> = {};

// Fetching data when the app loads
Promise.all([
    fetchJSON<Record<string, string>>('/combatantNames.json'),
    fetch('/itemsparse.csv').then(res => res.text()).then(parseCSV)
]).then(([names, items]) => {
    combatantNames = names;
    itemsData = items;
}).catch(error => console.error('Failed to load resources:', error));

function handleFileSelect(event: Event): void {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const contents = reader.result as string;
    const players = parseLogFile(contents);
    displayPlayers(players);
  };
  reader.readAsText(file);
}

function parseLogFile(contents: string): Player[] {
    const lines = contents.split('\n');
    const players: Record<string, Player> = {};

    lines.forEach(line => {
        if (line.startsWith('COMBATANT_INFO')) {
            const [, playerId, , , , , , , , , , , , , , , , , , , , , , , , , , , gearString] = line.split(',');
            const items = parseGear(gearString);
            const playerName = combatantNames[playerId] || playerId;
            players[playerId] = { id: playerId, name: playerName, items };
        }
    });

    return Object.values(players);
}

function parseGear(gearString: string): Item[] {
    const pattern = /\((\d+),\d+,\((\d+),/g;
    let match: RegExpExecArray | null;
    const items: Item[] = [];

    while ((match = pattern.exec(gearString)) !== null) {
        const itemId = match[1];
        const resistance = itemsData[itemId] || 0;
        items.push({ id: itemId, resistance });
    }

    return items;
}

function displayPlayers(players: Player[]): void {
    const output = document.getElementById('output');
    if (!output) return;
    output.innerHTML = '';

    players.forEach(player => {
        const div = document.createElement('div');
        div.innerHTML = `<h3>${player.name}</h3>` + player.items.map(item => `<p>Item ID: ${item.id}, Resistance: ${item.resistance}</p>`).join('');
        output.appendChild(div);
    });
}
