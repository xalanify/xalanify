export async function searchMusic(query: string) {
  try {
    const res = await fetch(
      `https://spotify-downloader9.p.rapidapi.com/api/search?q=${encodeURIComponent(query)}&type=multi&limit=25`, 
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '',
          'x-rapidapi-host': 'spotify-downloader9.p.rapidapi.com'
        }
      }
    );

    if (!res.ok) throw new Error(`API Error: ${res.status}`);

    const data = await res.json();
    
    // Verificação de segurança para evitar erro .map()
    if (!data || !data.data) return [];

    return data.data.map((item: any) => ({
      id: item.id || Math.random().toString(),
      title: item.title || "Sem Título",
      artist: item.artist || "Artista Desconhecido",
      thumbnail: item.thumbnail || "",
      youtubeId: item.youtubeId || null,
    }));
  } catch (error) {
    console.error("Erro na busca:", error);
    return []; // Retorna lista vazia em vez de quebrar a app
  }
}

export async function getYoutubeId(title: string, artist: string) {
  try {
    const res = await fetch(
      `https://spotify-downloader9.p.rapidapi.com/api/getYoutubeId?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '',
          'x-rapidapi-host': 'spotify-downloader9.p.rapidapi.com'
        }
      }
    );
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    return null;
  }
}