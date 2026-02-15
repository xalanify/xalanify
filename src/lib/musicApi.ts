export async function searchMusic(query: string) {
  try {
    // Aumentamos o limite para 25 para trazer mais variedade (colaborações, remixes, etc)
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
    const data = await res.json();
    
    // Mapeamos os resultados garantindo que capturamos uma lista vasta
    return data.data.map((item: any) => ({
      id: item.id,
      title: item.title,
      artist: item.artist,
      thumbnail: item.thumbnail,
      youtubeId: item.youtubeId || null, // Se a API já trouxer, usamos
    }));
  } catch (error) {
    console.error("Erro na busca:", error);
    return [];
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
    return data.data; // Retorna o ID do vídeo do YouTube
  } catch (error) {
    return null;
  }
}