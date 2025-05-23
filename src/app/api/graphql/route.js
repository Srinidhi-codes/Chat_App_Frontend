import { NextResponse } from 'next/server';

export async function POST(request) {
    const body = await request.text();

    const res = await fetch(process.env.NEXT_PUBLIC_SOCKET_URL, {
        method: 'POST',
        headers: {
            ...Object.fromEntries(request.headers),
            host: new URL(process.env.NEXT_PUBLIC_SOCKET_URL).host,
        },
        body,
    });

    const responseBody = await res.text();

    return new NextResponse(responseBody, {
        status: res.status,
        headers: res.headers,
    });
}

export async function GET(request) {
    const url = new URL(request.url);
    const searchParams = url.search;

    const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}${searchParams}`, {
        method: 'GET',
        headers: {
            ...Object.fromEntries(request.headers),
            host: new URL(process.env.NEXT_PUBLIC_SOCKET_URL).host,
        },
    });

    const responseBody = await res.text();

    return new NextResponse(responseBody, {
        status: res.status,
        headers: res.headers,
    });
}
