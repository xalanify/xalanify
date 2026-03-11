# Xalanify - Melhorias Implementadas

## 1. Atualização Automática (WhatsNew Card) ✅
- [x] Atualizar lib/versions.ts para suportar "não mostrar novamente"
- [x] Atualizar app/page.tsx para adicionar botão "Não mostrar novamente"

## 2. Cores Sólidas (Barra de Navegação e Mini-Player) ✅
- [x] Remover transparência da barra de navegação em app/page.tsx
- [x] Remover transparência do mini-player em components/mini-player.tsx

## 3. Background Playback ✅
- [x] Adicionar botões de próxima/anterior ao mini-player
- [x] O sistema já mantinha reprodução em background (verificado)

## 4. Próxima Música Automática ✅
- [x] Verificado - já estava implementado em audio-engine.tsx

## 5. Lista de Músicas no Player ✅
- [x] Adicionar botão de lista ao full-player.tsx
- [x] Criar modal com lista de músicas atual

## 6. Reordenar Músicas (Playlists e Favoritos) ✅
- [x] Adicionar funções em lib/player-context.tsx (addToQueue, removeFromQueue, reorderQueue)
- [x] Adicionar funções em lib/db.ts (reorderPlaylistTracks, reorderLikedTracks)
- [x] UI de reorder disponível na lista do player completo

---

## Versão Atual
- Versão: 0.69.0
- Data: 2026-01-26
- Alterações incluídas:
  - Card de novidades com botão "Não mostrar novamente"
  - Cores sólidas na barra de navegação e mini-player
  - Botões de próxima/anterior no mini-player
  - Modal de lista de músicas no player completo
  - Funções de reordernar músicas (via queue do player)

