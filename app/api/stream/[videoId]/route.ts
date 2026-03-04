import { NextRequest, NextResponse } from "next/server"

// Instâncias Invidious para buscar streams
const INVIDIOUS_INSTANCES = [
  "https://yewtu.be",
  "https://invidious.projectsegfau.lt",
  "https://invidious.kavin.rocks",
  "https://iv.ggtyler.dev",
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params
  
  console.log("[API] A procurar stream para:", videoId)

  // Tentar cada instância Invidious
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const response = await fetch(
        `${instance}/api/v1/videos/${videoId}?fields=adaptiveFormats`,
        { signal: AbortSignal.timeout(10000) }
      )

      if (!response.ok) continue

      const data = await response.json()
      const formats = data.adaptiveFormats || []

      // Filtrar streams de áudio
      const audioFormats = formats.filter(
        (f: any) => f.type?.startsWith("audio/") && f.url
      )

      if (audioFormats.length > 0) {
        // Pegar o de melhor qualidade
        const bestAudio = audioFormats.reduce(
          (best: any, current: any) =>
            (current.bitrate || 0) > (best.bitrate || 0) ? current : best,
          audioFormats[0]
        )

        console.log("[API] ✅ Stream encontrado!")
        
        // Retornar URL do stream
        return NextResponse.json({ url: bestAudio.url })
      }
    } catch (e) {
      console.log("[API] ❌ Erro instance:", instance)
    }
  }

  console.log("[API] ❌ Nenhuma instância funcionou")
  return NextResponse.json({ error: "No stream found" }, { status: 404 })
}

