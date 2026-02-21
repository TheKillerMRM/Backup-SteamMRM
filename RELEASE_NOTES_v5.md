# 🚀 Steam Toolkit MRM v5.0.0

A maior atualização do Steam Toolkit MRM até agora! Interface completamente redesenhada, novas funcionalidades de gestão de backups e melhorias de estabilidade.

---

## 🖌️ Interface Redesenhada
- Novo visual moderno com **glassmorphism**, gradientes suaves e micro-animações
- **Barra de ações** redesenhada com novos ícones (engrenagem, refresh, scanner, pasta, fechar)
- **Menu de Configurações** melhorado com layout espaçado e organizado
- **Temas** agora exibidos lado a lado em vez de empilhados
- **Contraste dinâmico** — o texto adapta-se automaticamente a temas claros ou escuros

## 💾 Backup & Gestão
- **Backup Manual** — Botão "Backup Agora" para criar snapshots a qualquer momento
- **📌 Pin de Backups** — Fixe backups importantes para protegê-los do Auto-Cleanup
- **✏️ Renomear Backups** — Dê nomes personalizados aos seus backups
- **📊 Contador de Slots** — Indicador visual (ex: 3/5 usados) com barra de progresso
- **📂 Pasta em Primeiro Plano** — Abrir pasta de backups agora aparece à frente da Steam (Win32 API)

## 🗂️ Caminho Configurável
- Escolha a pasta de destino dos backups nas configurações
- Histórico de locais anteriores para troca rápida
- Opção de mover backups antigos para o novo local

## 🔧 Estabilidade
- Corrigido problema crítico que fazia o menu do Millennium desaparecer
- Limpeza de ficheiros duplicados no diretório do plugin
- `Millennium.ready()` agora é chamado corretamente no import do módulo

---

## 📥 Instalação

### ⚡ Automática (PowerShell Admin)
```powershell
irm https://raw.githubusercontent.com/TheKillerMRM/Backup-SteamMRM/main/install.ps1 | iex
```

### 📦 Offline
Baixe o `Install_Backup_SteamMRM.exe` abaixo e execute.

---

**Pré-requisito:** [Millennium](https://steambrew.app/) instalado na Steam.
