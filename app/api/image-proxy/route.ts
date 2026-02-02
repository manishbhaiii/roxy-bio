import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return new NextResponse('Missing URL', { status: 400 });
    }

    try {
        const response = await fetch(targetUrl, {
            headers: {
                // Mimic a generic browser or Discord to bypass User-Agent blocks
                'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
                'Referer': targetUrl
            }
        });

        if (!response.ok) {
            return new NextResponse(`Failed to fetch image: ${response.status}`, { status: response.status });
        }

        const blob = await response.blob();
        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('Content-Type') || 'image/png');
        headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // Cache aggressively

        return new NextResponse(blob, { headers });
    } catch (error) {
        console.error("Image Proxy Error:", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
