// src/app/api/spotify/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  // 1. Obter Token (Lado do servidor não tem bloqueio de CORS)
  const authRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID + ":" + process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET).toString('base64'),
    },
    body: "grant_type=client_credentials",
  });
  
  const authData = await authRes.json();
  const token = authData.access_token;

  // 2. Pesquisar no Spotify
  const spotRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query || '')}&type=track&limit=15`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  const data = await spotRes.json();
  return NextResponse.json(data);
}