# TODO - Melhorias na Pesquisa e Player

## Tarefas Completas:

### 1. [lib/preferences.ts] ✅
- [x] Removido opção retryMethod (YouTube/SoundCloud)
- [x] Manter apenas autoRetry

### 2. [lib/player-context.tsx] ✅
- [x] Lógica de retry usa sempre YouTube
- [x] Logging detalhado na consola
- [x] Detecção automática de música presa/travada

### 3. [lib/musicApi.ts] ✅
- [x] Prioriza YouTube na pesquisa (músicas completas)
- [x] Fallback para alternativas mais fiáveis
- [x] Abordagem Musify-like (YouTube primeiro)
- [x] Streams diretos via Invidious

### 4. [components/track-menu.tsx] ✅
- [x] Opção "Adicionar a Playlist" (mostrar playlists existentes da biblioteca)
- [x] Removido opção "Partilhar Música"

### 5. [components/settings-tab.tsx] ✅
- [x] Removido UI de seleção de método de retry
- [x] Mantido apenas toggle de auto-retry

### 6. [app/page.tsx] ✅
- [x] Passa playlists existentes para o track menu
