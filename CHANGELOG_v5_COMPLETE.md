# 🚀 Steam Toolkit MRM v5 — O Derradeiro Update

Esta versão marca a maior reformulação do projeto até à data, focada em **Design, Usabilidade e Estabilidade**.

---

## ✨ Destaques Principais

### 🎨 Nova Interface (UI 2.0)
- **Design Moderno:** Estilo "Glassmorphism" com transparências, gradientes e sombras suaves.
- **Micro-interações:** Animações fluidas ao passar o rato, clicar ou carregar conteúdo.
- **Barra de Ações:** Ícones redesenhados e organizados no topo (Refresh, Scanner, Pasta, Fechar).
- **Temas Visuais:** Escolha entre vários temas (Purple, Blue, Dark, etc.) com pré-visualização lado-a-lado.

### 🛠️ Novas Funcionalidades
- **💾 Backup Manual:** Botão "Backup Agora" para criar snapshots instantâneos a qualquer momento.
- **📌 Pin de Backups:** Marque backups favoritos com um clique para impedir que o *Auto-Cleanup* os apague.
- **✏️ Renomear:** Dê nomes personalizados aos seus backups para fácil identificação.
- **📊 Slots Inteligentes:** Barra de progresso visual mostrando o uso dos slots (ex: 3/5 usados).
- **⚙️ Caminho Personalizado:** Escolha qualquer pasta do PC para salvar os seus backups (com histórico de locais).

---

## 📦 Novo Instalador Profissional

O instalador foi reescrito do zero para ser mais robusto e fácil de usar:
- **Auto-detecção Inteligente:** Encontra a pasta da Steam automaticamente (via Registo do Windows).
- **Interface Gráfica Escura:** Nada de janelas pretas de comando — agora tem uma GUI moderna e amigável.
- **Splash Screen:** Carregamento instantâneo para feedback imediato.
- **Segurança:** Fecha a Steam automaticamente para evitar erros de ficheiros em uso.
- **Verificação:** Garante que todos os ficheiros (incluindo o motor `ludusavi.exe`) foram copiados corretamente.
- **Thread Safety:** O processo de instalação corre em segundo plano sem congelar a janela.

---

## 🔧 Correções e Melhorias Técnicas (v5.0.1 - v5.0.2)

- **[CRÍTICO] Botão Roxo:** Resolvido bug que impedia o botão de aparecer na loja (conflito de funções JS duplicadas).
- **[CRÍTICO] Instalador Congelado:** Corrigido *freeze* na tela inicial adicionando *thread safety* e splash screen.
- **[FIX] Ludusavi em Falta:** O instalador agora inclui corretamente a pasta `ludusavi` (que estava a ser ignorada pelo git).
- **[FIX] Pasta em 1º Plano:** Ao clicar em "Abrir Pasta", a janela do Explorador agora vem para a frente da Steam.
- **[FIX] Millennium Hook:** Melhorada a deteção do Millennium (`.ready()`) para garantir que o plugin carrega sempre.

---

## 📥 Como Atualizar

1. **Baixe o novo instalador:** `Install_Backup_SteamMRM.exe` (v5.0.2)
2. Execute e clique em **Instalar** (ele remove a versão antiga automaticamente).
3. A Steam irá reiniciar com tudo atualizado! 💜
