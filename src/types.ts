export interface Player {
    id: string;
    name: string;
    items: Item[];
}

export interface Item {
    id: string;
    resistance: number;
}

// Utility to parse CSV data (for itemsparse.csv)
export function parseCSV(csv: string): Record<string, number> {
    const lines = csv.split('\n');
    const header = lines.shift()?.split(',');
    const resistanceIndex = header?.indexOf('Resistances[2]');
    const idIndex = header?.indexOf('ID');
    const items: Record<string, number> = {};

    lines.forEach(line => {
        const columns = line.split(',');
        if (resistanceIndex !== undefined && idIndex !== undefined) {
            const id = columns[idIndex];
            const resistance = parseInt(columns[resistanceIndex], 10);
            items[id] = isNaN(resistance) ? 0 : resistance;
        }
    });

    return items;
}

// Utility to fetch and parse JSON data
export async function fetchJSON<T>(path: string): Promise<T> {
    const response = await fetch(path);
    return response.json() as Promise<T>;
}
