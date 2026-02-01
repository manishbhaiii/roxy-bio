import { NextResponse } from 'next/server';
import { config } from '@/config';

// Use Discord ID to create a unique namespace for this specific user
const NAMESPACE = `roxy-bio-${config.discordId || 'default'}`;
const KEY = 'views';

export async function GET() {
    try {
        // Try to get current count
        const res = await fetch(`https://api.countapi.xyz/get/${NAMESPACE}/${KEY}`);
        if (!res.ok) {
            // New counter or network issue
            return NextResponse.json({ views: 0 });
        }
        const data = await res.json();
        return NextResponse.json({ views: data.value || 0 });
    } catch (e) {
        console.error("Counter API Error:", e);
        return NextResponse.json({ views: 0 });
    }
}

export async function POST() {
    try {
        // Increment count
        const res = await fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/${KEY}`);

        if (!res.ok) {
            // If key doesn't exist, we might need to create it, but 'hit' usually works or we can fallback
            return NextResponse.json({ views: 1 });
        }

        const data = await res.json();
        return NextResponse.json({ views: data.value || 0 });
    } catch (e) {
        console.error("Counter API Error:", e);
        // Fallback to 1 locally if API fails, so UI shows something
        return NextResponse.json({ views: 1 });
    }
}
