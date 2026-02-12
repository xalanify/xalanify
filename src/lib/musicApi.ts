export async function getYoutubeId(trackName: string, artist: string): Promise<string | null> {
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  
  // Estratégia de busca em ordem de prioridade
  const searchStrategies = [
    `${trackName} ${artist} official audio`,
    `${trackName} ${artist} audio`,
    `${trackName} ${artist} topic`,
    `${trackName} ${artist} lyrics`,
    `${trackName} ${artist}`
  ];

  // Tenta cada estratégia até encontrar um vídeo válido
  for (const searchTerm of searchStrategies) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&maxResults=3&key=${API_KEY}&videoCategoryId=10`; // 10 = Music category
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.items && data.items.length > 0) {
        // Procura pelo primeiro vídeo que pareça ser áudio oficial
        for (const item of data.items) {
          const title = item.snippet.title.toLowerCase();
          const channelTitle = item.snippet.channelTitle.toLowerCase();
          
          // Prioriza vídeos de canais oficiais ou com "topic" no nome
          const isLikelyAudio = 
            title.includes('audio') ||
            title.includes('official') ||
            channelTitle.includes('topic') ||
            channelTitle.includes('vevo') ||
            channelTitle.includes(artist.toLowerCase());
          
          // Evita vídeos que provavelmente são covers, tutoriais, etc
          const isLikelyNotOriginal = 
            title.includes('tutorial') ||
            title.includes('lesson') ||
            title.includes('cover') ||
            title.includes('karaoke') ||
            title.includes('instrumental');
          
          if (isLikelyAudio && !isLikelyNotOriginal) {
            console.log(`✓ YouTube ID encontrado: ${item.id.videoId} (estratégia: ${searchTerm})`);
            return item.id.videoId;
          }
        }
        
        // Se não encontrar um "ideal", usa o primeiro resultado
        const videoId = data.items[0].id.videoId;
        console.log(`→ YouTube ID (fallback): ${videoId} (estratégia: ${searchTerm})`);
        return videoId;
      }
    } catch (error) {
      console.error(`Erro na estratégia "${searchTerm}":`, error);
      continue; // Tenta a próxima estratégia
    }
  }
  
  console.error("❌ Nenhum vídeo encontrado para:", trackName, artist);
  return null;
}

export async function searchMusic(query: string) {
  const res = await fetch(`/api/spotify?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  
  return data.tracks.items.map((t: any) => ({
    id: t.id,
    title: t.name,
    artist: t.artists[0].name,
    thumbnail: t.album.images[0]?.url || "",
    album: t.album.name,
    preview_url: t.preview_url, // URL de prévia do Spotify (30 segundos)
    duration_ms: t.duration_ms,
  }));
}

// Função auxiliar para validar se um vídeo do YouTube é reproduzível
export async function validateYoutubeVideo(videoId: string): Promise<boolean> {
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=status&id=${videoId}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.items && data.items.length > 0) {
      const status = data.items[0].status;
      return status.embeddable && !status.privacyStatus.includes('private');
    }
  } catch (error) {
    console.error("Erro ao validar vídeo:", error);
  }
  
  return false;
}