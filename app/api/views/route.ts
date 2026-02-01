import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'views.json');

// In-memory fallback if file system is read-only (for Vercel)
let inMemoryViews = 0;

function getViews() {
    try {
        if (fs.existsSync(dataFilePath)) {
            const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
            const data = JSON.parse(fileContent);
            return data.views || 0;
        }
    } catch (e) {
        console.error("Error reading views file:", e);
    }
    return inMemoryViews;
}

function saveViews(views: number) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify({ views }));
    } catch (e) {
        // Vercel is read-only, so this will fail. We just log it and update in-memory.
        console.warn("Could not write to file system (likely read-only environment). Using in-memory store.");
        inMemoryViews = views;
    }
}

export async function GET() {
    const views = getViews();
    return NextResponse.json({ views });
}

export async function POST() {
    let views = getViews();
    views++;
    saveViews(views);
    return NextResponse.json({ views });
}
