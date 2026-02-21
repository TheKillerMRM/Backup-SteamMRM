(function () {
    'use strict';

    console.log("[Steam Toolkit MRM] Script carregado!");

    try {
        const API_URL = "http://localhost:9999";

        function isAllowedContext() {
            const url = window.location.href.toLowerCase();
            // Permite: Página Inicial da Loja, Biblioteca, Console e Millennium
            const allows = [
                "store.steampowered.com/",
                "steamcommunity.com/library",
                "steam://",
                "local.steampowered.com"
            ];

            // Bloqueia expressamente: Pesquisa, Fóruns, Pontos, Inventário, Perfil, etc
            // NOTA: store.steampowered.com/app/ NÃO está bloqueado para que o botão OnlineFix funcione
            const blocks = [
                "/search", "/discussions", "/points", "/inventory", "/profiles/",
                "store.steampowered.com/sub/", "store.steampowered.com/bundle/"
            ];

            const isAllowed = allows.some(a => url.includes(a)) || url === "about:blank";
            const isBlocked = blocks.some(b => url.includes(b));

            // Especial: Lojas de jogo (/app/) são permitidas; apenas a home e páginas de app
            if (url.includes("store.steampowered.com")) {
                const path = window.location.pathname;
                return path === "/" || path === "" || path.includes("/home") || path.startsWith("/app/");
            }

            return isAllowed && !isBlocked;
        }

        // --- ABORTO IMEDIATO SE FOR CONTEXTO INVÁLIDO ---
        if (!isAllowedContext()) return;

        // Dicionário de Traduções
        const TRANSLATIONS = {
            "pt": {
                title: "Steam Toolkit MRM v5",
                config: "Configurações",
                refresh: "Atualizar",
                scanner: "Scanner",
                openLudusavi: "Abrir Ludusavi",
                limit: "Limite de Backups",
                primaryColor: "Cor Principal",
                presets: "Temas",
                save: "Salvar",
                loading: "Carregando...",
                noBackups: "Nenhum backup encontrado.",
                poweredByText: "Agradecimentos a",
                byText: "dev",
                universalEngine: "Universal Engine",
                restore: "Restaurar",
                delete: "Apagar",
                language: "Idioma",
                restoreConfirm: "⚠️ ATENÇÃO ⚠️\n\nA Steam será FECHADA para restaurar o backup:\n",
                deleteConfirm: "Deseja realmente APAGAR este backup?\n",
                slotsUsed: "usados",
                ludusaviError: "Ludusavi não encontrado.",
                connectionError: "Erro de conexão: ",
                successTitle: "Restauro Completo",
                successDesc: "Backup restaurado com sucesso!",
                successSub: "Seus arquivos foram recuperados.",
                understood: "OK",
                restoring: "Restaurando...",
                restoringSub: "Verifique a janela de Admin.",
                restoringSteam: "Reiniciando Steam...",
                openFolder: "Abrir Pasta",
                backupPath: "Local dos Backups",
                moveBackupsConfirm: "Deseja mover os backups antigos para a nova pasta?",
                movingBackups: "Movendo...",
                invalidPath: "Caminho inválido.",
                backupNow: "Backup Agora",
                backingUp: "Criando...",
                pin: "Fixar",
                unpin: "Desafixar",
                rename: "Renomear",
                renamePrompt: "Novo nome para o backup:",
                renameSave: "Guardar",
                renameCancel: "Cancelar",
                pinnedError: "Este backup está fixado e não pode ser eliminado.",
                history: "Histórico",
                pinned: "Fixado",
                openSteamAutoCrack: "Abrir SteamAutoCrack",
                steamAutoCrackWarningTitle: "Aviso de Risco SteamAutoCrack",
                steamAutoCrackWarningDesc: "Este programa modifica executáveis de jogos e pode corromper a instalação. Use por sua conta e risco.\n\n⚠️ O AUTOR DESTE PLUGIN NÃO SE RESPONSABILIZA POR ABSOLUTAMENTE NADA QUE ACONTEÇA COM O SEU COMPUTADOR, JOGOS OU CONTA. ⚠️",
                steamAutoCrackTutorial: "1. Selecione o executável ou a pasta do jogo.\n2. Escolha as opções de crack (os padrões geralmente funcionam).\n3. Vá ao site <span onclick=\"window.calyOpenExternal('https://steamdb.info/')\" style=\"color:#3b82f6; cursor:pointer; font-weight:bold;\">https://steamdb.info/</span>, pesquise o nome do jogo, entre na página, copie o App ID e cole onde é solicitado no programa.\n4. Clique em 'Crack' e aguarde a conclusão.\n5. Depois é só Jogar.",
                steamAutoCrackAccept: "Li e Aceito (Abrir)",
                steamAutoCrackCancel: "Cancelar",
                steamAutoCrackSupport: "Suporte (GitHub)",
                fixSearching: "A procurar Fix Multijogador...",
                fixAvailable: "Fix Multijogador Disponível!",
                fixNotFound: "Sem Fix Online",
                fixOpened: "Aberto no Navegador!"
            },
            "en": {
                title: "Steam Toolkit MRM v5",
                config: "Settings",
                refresh: "Refresh",
                scanner: "Scanner",
                openLudusavi: "Open Ludusavi",
                limit: "Backup Limit",
                primaryColor: "Primary Color",
                presets: "Themes",
                save: "Save",
                loading: "Loading...",
                noBackups: "No backups found.",
                poweredByText: "Thanks to",
                byText: "dev",
                universalEngine: "Universal Engine",
                restore: "Restore",
                delete: "Delete",
                language: "Language",
                restoreConfirm: "⚠️ WARNING ⚠️\n\nSteam will be CLOSED to restore the backup:\n",
                deleteConfirm: "Do you really want to DELETE this backup?\n",
                slotsUsed: "used",
                ludusaviError: "Ludusavi not found.",
                connectionError: "Connection error: ",
                successTitle: "Restore Complete",
                successDesc: "Backup successfully restored!",
                successSub: "Your files recovered.",
                understood: "OK",
                restoring: "Restoring...",
                restoringSub: "Check Admin window.",
                restoringSteam: "Restarting Steam...",
                openFolder: "Open Folder",
                backupPath: "Backup Location",
                moveBackupsConfirm: "Move existing backups to new folder?",
                movingBackups: "Moving...",
                invalidPath: "Invalid path.",
                backupNow: "Backup Now",
                backingUp: "Backing up...",
                pin: "Pin",
                unpin: "Unpin",
                rename: "Rename",
                renamePrompt: "New name for backup:",
                renameSave: "Save",
                renameCancel: "Cancel",
                pinnedError: "This backup is pinned and cannot be deleted.",
                history: "History",
                pinned: "Pinned",
                openSteamAutoCrack: "Open SteamAutoCrack",
                steamAutoCrackWarningTitle: "SteamAutoCrack Risk Warning",
                steamAutoCrackWarningDesc: "This program modifies game executables and might corrupt the installation. Use at your own risk.\n\n⚠️ THE AUTHOR OF THIS PLUGIN IS NOT RESPONSIBLE FOR ABSOLUTELY ANYTHING THAT HAPPENS TO YOUR COMPUTER, GAMES, OR ACCOUNT. ⚠️",
                steamAutoCrackTutorial: "1. Select the game's executable or folder.\n2. Choose crack options (defaults are usually fine).\n3. Go to <span onclick=\"window.calyOpenExternal('https://steamdb.info/')\" style=\"color:#3b82f6; cursor:pointer; font-weight:bold;\">https://steamdb.info/</span>, search for the game, copy the App ID and paste it in the program.\n4. Click 'Crack' and wait for completion.\n5. Then just Play.",
                steamAutoCrackAccept: "I Read and Accept (Open)",
                steamAutoCrackCancel: "Cancel",
                steamAutoCrackSupport: "Support (GitHub)",
                fixSearching: "Searching for Multiplayer Fix...",
                fixAvailable: "Multiplayer Fix Available!",
                fixNotFound: "No Online Fix Found",
                fixOpened: "Opened in Browser!"
            }
        };

        // Gerenciamento de Cores e Tema
        const DEFAULT_THEME = {
            primary: "#8b5cf6",
            primaryDark: "#6d28d9",
            bg: "linear-gradient(135deg, #13131a 0%, #1e1e2e 100%)",
            header: "linear-gradient(90deg, #2e1065, #13131a)",
            language: "pt"
        };

        let currentTheme = JSON.parse(localStorage.getItem('caly-theme')) || DEFAULT_THEME;
        if (!currentTheme.language) currentTheme.language = "pt";

        function t(key) {
            const lang = currentTheme.language || "pt";
            return TRANSLATIONS[lang][key] || TRANSLATIONS["en"][key] || key;
        }

        function saveTheme(theme) {
            localStorage.setItem('caly-theme', JSON.stringify(theme));
            applyTheme(theme);
        }

        // Função para calcular a luminosidade de uma cor e determinar a cor do texto
        function getTextColorForBackground(hexColor) {
            try {
                if (!hexColor) return '#ffffff';
                const hex = hexColor.replace('#', '');
                const r = parseInt(hex.substr(0, 2), 16);
                const g = parseInt(hex.substr(2, 2), 16);
                const b = parseInt(hex.substr(4, 2), 16);
                // (0.299*R + 0.587*G + 0.114*B)
                const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                return luminance > 0.5 ? '#000000' : '#ffffff';
            } catch (e) { return '#ffffff'; }
        }

        function applyTheme(theme) {
            try {
                const root = document.documentElement;
                const textColor = getTextColorForBackground(theme.primary);

                // Calcula uma versão mais escura para o gradiente do cabeçalho
                const hex = theme.primary.replace('#', '');
                const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 100);
                const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 100);
                const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 100);
                const darkerPrimary = `rgb(${r}, ${g}, ${b})`;

                root.style.setProperty('--caly-primary', theme.primary);
                root.style.setProperty('--caly-primary-dark', theme.primaryDark);
                root.style.setProperty('--caly-bg', theme.bg);
                root.style.setProperty('--caly-header', `linear-gradient(90deg, ${darkerPrimary}, #13131a)`);
                root.style.setProperty('--caly-glow', theme.primary + '66');
                root.style.setProperty('--caly-text-color', textColor);
            } catch (e) { console.error("Erro ao aplicar tema", e); }
        }

        applyTheme(currentTheme);

        function ensureCalyStyles() {
            if (!document.head) return;
            if (document.getElementById('caly-styles')) return;

            const style = document.createElement('style');
            style.id = 'caly-styles';
            style.textContent = `
                /* Professional UI Polish - Scoped */
                .caly-modal ::-webkit-scrollbar { width: 6px; }
                .caly-modal ::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
                .caly-modal ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
                .caly-modal ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

                :root {
                    --caly-primary: #8b5cf6;
                    --caly-primary-dark: #6d28d9;
                    --caly-bg: #13131a;
                    --caly-header: rgba(19, 19, 26, 0.95);
                    --caly-glow: rgba(139, 92, 246, 0.2);
                    --caly-text-color: #ffffff;
                }

                #caly-fab {
                    position: fixed; bottom: 30px; right: 30px; width: 50px; height: 50px;
                    background: linear-gradient(135deg, var(--caly-primary), var(--caly-primary-dark));
                    border-radius: 50%; box-shadow: 0 4px 20px var(--caly-glow);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 9999; cursor: pointer; border: 1px solid rgba(255,255,255,0.1);
                    transition: all 0.3s ease; color: var(--caly-text-color);
                }
                #caly-fab:hover { transform: scale(1.05) rotate(5deg); box-shadow: 0 4px 25px var(--caly-primary); }
                
                .caly-overlay {
                    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(5px);
                    z-index: 10000; display: flex; align-items: center; justify-content: center;
                    animation: calyFadeIn 0.2s ease-out; font-family: "Segoe UI", "Roboto", sans-serif;
                }
                .caly-modal {
                    background: #18181b;
                    border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; width: 600px; max-width: 90vw;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
                    animation: calySlideUp 0.15s ease-out; color: #e4e4e7;
                    overflow: hidden; display: flex; flex-direction: column;
                }
                .caly-header {
                    padding: 16px 24px; background: var(--caly-header);
                    border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center;
                }
                .caly-title {
                    font-size: 18px; font-weight: 600; color: #fff; letter-spacing: -0.5px;
                }
                .caly-body { padding: 0; max-height: 60vh; overflow-y: auto; background: #0f0f12; }
                .caly-view-container { display: flex; width: 200%; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .caly-view { width: 50%; display: flex; flex-direction: column; }

                .caly-item {
                    padding: 12px 24px; border-bottom: 1px solid rgba(255,255,255,0.03);
                    display: flex; justify-content: space-between; align-items: center; transition: background 0.15s;
                    group: 1;
                }
                .caly-item:hover { background: rgba(255,255,255,0.02); }
                .caly-item.pinned { border-left: 2px solid var(--caly-primary); background: rgba(139, 92, 246, 0.03); }
                
                .caly-date { display: block; font-size: 14px; font-weight: 500; color: #e4e4e7; margin-bottom: 2px; }
                .caly-path { display: block; font-size: 11px; color: #71717a; font-family: monospace; }
                
                .caly-btn {
                    background: var(--caly-primary); border: none;
                    color: var(--caly-text-color); padding: 6px 12px; border-radius: 6px; font-weight: 500; cursor: pointer;
                    font-size: 12px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px;
                }
                .caly-btn:hover { background: var(--caly-primary-dark); }
                .caly-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                
                .caly-btn-ghost {
                    background: transparent; border: 1px solid rgba(255,255,255,0.1);
                    color: #a1a1aa; padding: 6px; border-radius: 6px; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; transition: all 0.2s;
                }
                .caly-btn-ghost:hover { background: rgba(255,255,255,0.05); color: #fff; border-color: rgba(255,255,255,0.2); }
                .caly-btn-ghost.active { color: var(--caly-primary); border-color: var(--caly-primary); background: rgba(139, 92, 246, 0.1); }
                
                .caly-btn-red {
                    color: #ef4444; background: transparent; padding: 6px; border-radius: 6px; cursor: pointer; border: none;
                }
                .caly-btn-red:hover { background: rgba(239, 68, 68, 0.1); }

                .caly-storage-bar { height: 4px; background: rgba(255,255,255,0.05); width: 100%; }
                .caly-storage-fill { height: 100%; background: var(--caly-primary); width: 0%; transition: width 0.5s ease; }
                .caly-storage-info { padding: 10px 24px 6px; display: flex; justify-content: space-between; align-items: center; }
                .caly-storage-text { font-size: 11px; color: #71717a; font-weight: 500; }

                @keyframes calySpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .caly-spin { animation: calySpin 0.8s linear infinite; }

                .caly-input-group { position: relative; width: 100%; }
                .caly-input {
                    background: #27272a; border: 1px solid rgba(255,255,255,0.1); color: #fff;
                    padding: 8px 12px; border-radius: 6px; width: 100%; font-size: 13px; outline: none; box-sizing: border-box;
                    transition: border-color 0.2s; font-family: monospace;
                }
                .caly-input:focus { border-color: var(--caly-primary); }
                
                .caly-history-btn {
                    position: absolute; right: 4px; top: 4px; bottom: 4px;
                    padding: 0 8px; background: #3f3f46; border: none; border-radius: 4px;
                    color: #a1a1aa; cursor: pointer; font-size: 10px; font-weight: 600;
                    display: flex; align-items: center;
                }
                .caly-history-btn:hover { color: #fff; background: #52525b; }
                
                .caly-history-dropdown {
                    position: absolute; top: 100%; left: 0; right: 0; background: #27272a;
                    border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; z-index: 10;
                    margin-top: 4px; max-height: 150px; overflow-y: auto; display: none;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
                }
                .caly-history-item {
                    padding: 8px 12px; font-size: 12px; color: #d4d4d8; cursor: pointer; font-family: monospace;
                    text-overflow: ellipsis; overflow: hidden; white-space: nowrap;
                }
                .caly-history-item:hover { background: rgba(255,255,255,0.05); color: #fff; }

                .caly-actions { display: flex; gap: 4px; align-items: center; }

                /* Settings styles */
                .caly-config-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
                .caly-config-row { display: flex; justify-content: space-between; align-items: center; }
                .caly-config-label { font-size: 13px; font-weight: 500; color: #d4d4d8; }
                
                .caly-preset-container { display: flex; gap: 8px; align-items: center; }
                
                .caly-select {
                    background: #27272a; border: 1px solid rgba(255,255,255,0.1); color: #fff;
                    padding: 4px 8px; border-radius: 6px; font-size: 13px; outline: none;
                    transition: border-color 0.2s; cursor: pointer; max-width: 250px;
                }
                .caly-select:focus { border-color: var(--caly-primary); }
                .caly-preset-circle { 
                    width: 20px; height: 20px; border-radius: 50%; cursor: pointer; border: 2px solid transparent;
                    transition: transform 0.2s;
                }
                .caly-preset-circle.selected { border-color: #fff; transform: scale(1.1); }

                /* === Botão OnlineFix === */
                #mrm-onlinefix-btn {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 10px 18px; border-radius: 3px; font-size: 15px;
                    font-weight: 600; font-family: "Motiva Sans", Arial, sans-serif;
                    border: none; cursor: not-allowed; transition: all 0.25s ease;
                    text-transform: uppercase; letter-spacing: 0.5px;
                    margin-top: 8px; width: 100%; justify-content: center;
                }
                #mrm-onlinefix-btn.of-loading {
                    background: #4b545c; color: #8f98a0; cursor: not-allowed;
                }
                #mrm-onlinefix-btn.of-found {
                    background: linear-gradient(to bottom, #82cc5d, #5c9933);
                    color: #fff; cursor: pointer; box-shadow: 0 0 8px rgba(130,204,93,0.4);
                }
                #mrm-onlinefix-btn.of-found:hover {
                    background: linear-gradient(to bottom, #95dd6a, #6ab043);
                    box-shadow: 0 0 14px rgba(130,204,93,0.6);
                }
                #mrm-onlinefix-btn.of-notfound {
                    background: #3a3a3a; color: #6b6b6b; cursor: not-allowed;
                }
                @keyframes mrmPulse {
                    0%,100% { box-shadow: 0 0 8px rgba(130,204,93,0.4); }
                    50%      { box-shadow: 0 0 18px rgba(130,204,93,0.8); }
                }
                #mrm-onlinefix-btn.of-found { animation: mrmPulse 2s ease-in-out infinite; }
                #mrm-onlinefix-btn.of-found:hover { animation: none; }
            `;
            document.head.appendChild(style);
        }

        function createFloatingButton() {
            if (!document.body) return;
            if (document.getElementById('caly-fab')) return;
            ensureCalyStyles();
            const fab = document.createElement('div');
            fab.id = 'caly-fab';
            fab.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
            fab.title = "Recall Control";
            fab.onclick = showRestoreModal;
            document.body.appendChild(fab);
        }

        window.calyOpenExternal = function (url) {
            fetch(`${API_URL}/open_url`, {
                method: 'POST',
                body: JSON.stringify({ url })
            }).catch(e => console.error("[Steam Toolkit MRM] Erro ao abrir link externo:", e));

            // Feedback visual universal para qualquer link clicado
            try {
                if (window.event) {
                    var target = window.event.target || window.event.srcElement;
                    if (target) {
                        var el = target.nodeType === 3 ? target.parentNode : target;
                        if (el && !el.dataset.opened) {
                            var originalHtml = el.innerHTML;
                            var msg = t('fixOpened') || "Aberto no Navegador!";
                            el.dataset.opened = "true";
                            el.innerHTML = originalHtml + ' <span style="font-size:0.85em; opacity:0.9; color:#fff; font-weight:normal; margin-left:4px;">(' + msg + ')</span>';
                            el.style.opacity = '0.7';
                            setTimeout(function () {
                                el.innerHTML = originalHtml;
                                el.style.opacity = '1';
                                delete el.dataset.opened;
                            }, 3000);
                        }
                    }
                }
            } catch (err) { }
        };

        function removeOverlay() {
            const existing = document.querySelector('.caly-overlay');
            if (existing) existing.remove();
        }

        function showRestoreModal() {
            removeOverlay();
            ensureCalyStyles();

            const overlay = document.createElement('div');
            overlay.className = 'caly-overlay';
            overlay.innerHTML = `
                <div class="caly-modal">
                    <div class="caly-header">
                        <div class="caly-title">${t('title')}</div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <button class="caly-btn-ghost" id="caly-toggle-view" title="${t('config')}">
                                <svg id="caly-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            </button>
                             <button class="caly-btn-ghost" id="caly-refresh" title="${t('refresh')}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                            </button>
                             <button class="caly-btn-ghost" id="caly-open-folder" title="${t('openFolder')}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                            </button>
                             <button class="caly-btn" id="caly-open-ludusavi" title="${t('openLudusavi')}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>
                             </button>
                             <button class="caly-btn" id="caly-open-sac" title="${t('openSteamAutoCrack')}" style="background:#ef4444; margin-left:8px;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                             </button>
                             <div style="width:1px; height:18px; background:rgba(255,255,255,0.1); margin:0 4px;"></div>
                             <div style="cursor:pointer; padding:5px; color:#a1a1aa;" id="caly-close">✕</div>
                        </div>
                    </div>
                    
                    <div style="background:var(--caly-header); padding:0 24px 16px; display:flex; gap:10px;">
                        <button class="caly-btn" style="width:100%; justify-content:center;" id="caly-backup-now">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                            ${t('backupNow')}
                        </button>
                    </div>
                    
                    <div class="caly-view-container" id="caly-slider">
                        <div class="caly-view">
                            <div class="caly-body" id="caly-list-container">
                                <div style="padding:40px; text-align:center; color:#94a3b8">${t('loading')}</div>
                            </div>
                        </div>
                        <div class="caly-view">
                            <div class="caly-body" id="caly-config-container"></div>
                        </div>
                    </div>

                    <div class="caly-storage-info">
                        <span class="caly-storage-text" id="caly-usage-text"></span>
                    </div>
                    <div class="caly-storage-bar"><div class="caly-storage-fill" id="caly-usage"></div></div>
                    
                     <div style="padding: 8px 24px; background: rgba(0,0,0,0.4); border-top: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 4px; align-items: center;">
                        <div style="font-size: 10px; color: #64748b; text-align:center;">${t('poweredByText')} <b>Ludusavi</b> &amp; <b>CalyRecall</b> &amp; <b>SteamAutoCracks</b></div>
                        <div style="display:flex; justify-content: space-between; align-items: center; width: 100%;">
                            <button class="caly-btn-ghost" id="caly-open-recommendations" style="font-size: 10px; padding: 2px 6px; height: auto;">Recomendações</button>
                            <div style="font-size: 10px; color: #4b5563;">${t('byText')} <span style="color:var(--caly-primary); font-weight:700;">TheKillerMRM</span></div>
                        </div>
                    </div>
               </div>
            `;
            document.body.appendChild(overlay);

            overlay.onclick = (e) => { if (e.target === overlay) removeOverlay(); };
            overlay.querySelector('#caly-close').onclick = removeOverlay;

            // Manual Backup
            overlay.querySelector('#caly-backup-now').onclick = () => {
                triggerBackup(overlay.querySelector('#caly-backup-now'));
            };

            let isConfigOpen = false;
            overlay.querySelector('#caly-toggle-view').onclick = () => {
                isConfigOpen = !isConfigOpen;
                overlay.querySelector('#caly-slider').style.transform = isConfigOpen ? 'translateX(-50%)' : 'translateX(0)';
                overlay.querySelector('#caly-nav-icon').style.color = isConfigOpen ? 'var(--caly-primary)' : 'currentColor';
                if (isConfigOpen) {
                    overlay.querySelector('#caly-toggle-view').classList.add('active');
                    renderConfigView(overlay.querySelector('#caly-config-container'), overlay);
                } else {
                    overlay.querySelector('#caly-toggle-view').classList.remove('active');
                    // Limpa o painel de config para que a altura colapse de volta
                    setTimeout(() => { overlay.querySelector('#caly-config-container').innerHTML = ''; }, 300);
                }
            };

            overlay.querySelector('#caly-refresh').onclick = () => {
                const btn = overlay.querySelector('#caly-refresh');
                const svg = btn.querySelector('svg');
                svg.classList.add('caly-spin');
                // Refresh completo: fecha e reabre o modal do zero (corrige qualquer estado inválido)
                setTimeout(() => {
                    removeOverlay();
                    showRestoreModal();
                }, 300);
            };

            overlay.querySelector('#caly-open-folder').onclick = () => {
                fetch(`${API_URL}/backups/open`, { method: 'POST' }).then(r => r.json()).then(data => {
                    if (data.status === 'not_found') alert(t('invalidPath'));
                });
            };

            overlay.querySelector('#caly-open-ludusavi').onclick = () => {
                fetch(`${API_URL}/ludusavi/open`, { method: 'POST' }).then(r => r.json()).then(data => {
                    // Handle response if needed
                });
            };

            overlay.querySelector('#caly-open-sac').onclick = () => {
                const sacOverlay = document.createElement('div');
                sacOverlay.className = 'caly-overlay';
                sacOverlay.style.zIndex = '10001';
                sacOverlay.innerHTML = `
                    <div class="caly-modal">
                        <div class="caly-header" style="border-bottom:1px solid #ef4444;">
                            <div class="caly-title" style="color:#ef4444;">⚠️ ${t('steamAutoCrackWarningTitle')} ⚠️</div>
                            <div style="cursor:pointer; padding:5px; color:#a1a1aa;" id="caly-sac-close">✕</div>
                        </div>
                        <div class="caly-body">
                            <div style="padding:24px; white-space:pre-wrap; font-size:14px; color:#d4d4d8; line-height:1.6;">${t('steamAutoCrackWarningDesc')}
                            
<b style="color:#ef4444;">Tutorial:</b>
${t('steamAutoCrackTutorial')}</div>
                            <div style="padding: 16px 24px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.05); background:#18181b;">
                                <div>
                                    <button class="caly-btn-ghost" id="caly-sac-support" style="color:#64748b; font-size:12px;">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                        ${t('steamAutoCrackSupport')}
                                    </button>
                                </div>
                                <div style="display:flex; gap:10px;">
                                    <button class="caly-btn-ghost" id="caly-sac-cancel">${t('steamAutoCrackCancel')}</button>
                                    <button class="caly-btn" style="background:#ef4444;" id="caly-sac-accept">${t('steamAutoCrackAccept')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(sacOverlay);

                const removeSacModal = () => sacOverlay.remove();

                sacOverlay.onclick = (e) => { if (e.target === sacOverlay) removeSacModal(); };
                sacOverlay.querySelector('#caly-sac-close').onclick = removeSacModal;
                sacOverlay.querySelector('#caly-sac-cancel').onclick = removeSacModal;

                sacOverlay.querySelector('#caly-sac-support').onclick = () => {
                    window.calyOpenExternal('https://github.com/SteamAutoCracks/Steam-auto-crack');
                };

                sacOverlay.querySelector('#caly-sac-accept').onclick = () => {
                    removeSacModal();
                    fetch(`${API_URL}/steamautocrack/open`, { method: 'POST' }).then(r => r.json()).then(data => {
                        if (data.status === 'not_found') alert("SteamAutoCrack não encontrado. Verifique se o executável existe.");
                    });
                };
            };

            overlay.querySelector('#caly-open-recommendations').onclick = () => {
                const recOverlay = document.createElement('div');
                recOverlay.className = 'caly-overlay';
                recOverlay.style.zIndex = '10001';
                recOverlay.innerHTML = `
                    <div class="caly-modal">
                        <div class="caly-header">
                            <div class="caly-title">Recomendações e Avisos</div>
                            <div style="cursor:pointer; padding:5px; color:#a1a1aa;" id="caly-rec-close">✕</div>
                        </div>
                        <div class="caly-body">
                            <div style="padding:24px; font-size:14px; color:#d4d4d8; line-height:1.6;">
                                <p>O desenvolvimento deste plugin foi pensado para ser usado com o <span onclick="window.calyOpenExternal('https://www.steamtools.net/')" style="color:#3b82f6; text-decoration:none; font-weight:bold; cursor:pointer;">Steam tools</span>.</p>
                                <p style="color:#94a3b8; font-size:12px; margin-bottom:16px;">⚠️ Aviso: Nem o criador deste plugin nem o Steam tools dão suporte um ao outro.</p>
                                
                                <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05); margin:16px 0;">
                                
                                <p>Este plugin também foi pensado para ser usado com outro plugin, o <span onclick="window.calyOpenExternal('https://github.com/madoiscool/ltsteamplugin')" style="color:#3b82f6; text-decoration:none; font-weight:bold; cursor:pointer;">lua tools</span>.</p>
                                <p style="color:#94a3b8; font-size:12px; margin-bottom:16px;">⚠️ Aviso: O dono do Steam Toolkit MRM não dá suporte ao plugin lua tools e o lua tools não dá suporte ao Steam Toolkit MRM.</p>
                                
                                <br>
                                <p>Comunidade exclusiva do lua tools: <span onclick="window.calyOpenExternal('https://discord.gg/luatools')" style="color:#3b82f6; text-decoration:none; font-weight:bold; cursor:pointer;">discord lua tools</span></p>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(recOverlay);

                const removeRecModal = () => recOverlay.remove();
                recOverlay.onclick = (e) => { if (e.target === recOverlay) removeRecModal(); };
                recOverlay.querySelector('#caly-rec-close').onclick = removeRecModal;
            };

            fetchBackups(overlay.querySelector('#caly-list-container'), overlay.querySelector('#caly-usage'));
        }

        async function renderConfigView(container, overlay) {
            const res = await fetch(`${API_URL}/settings`);
            const settings = await res.json();

            const presets = [
                { name: "Violet", p: "#8b5cf6", pd: "#6d28d9", bg: "#13131a", h: "rgba(19, 19, 26, 0.95)" },
                { name: "Ocean", p: "#0ea5e9", pd: "#0369a1", bg: "#0f172a", h: "rgba(15, 23, 42, 0.95)" },
                { name: "Crimson", p: "#ef4444", pd: "#b91c1c", bg: "#1a0505", h: "rgba(26, 5, 5, 0.95)" },
                { name: "Forest", p: "#22c55e", pd: "#15803d", bg: "#051a05", h: "rgba(5, 26, 5, 0.95)" }
            ];

            container.innerHTML = `
                <div class="caly-config-body">
                    <div class="caly-config-row">
                        <span class="caly-config-label">${t('limit')}</span>
                        <div class="caly-slider-container">
                            <input type="range" class="caly-slider" id="caly-limit-range" min="1" max="20" value="${settings.backup_limit || 5}">
                            <span style="font-weight:900; width:20px">${settings.backup_limit || 5}</span>
                        </div>
                    </div>
                    <div class="caly-config-row">
                        <span class="caly-config-label">${t('language')}</span>
                        <select class="caly-select" id="caly-lang-select">
                            <option value="pt" ${currentTheme.language === 'pt' ? 'selected' : ''}>Português (PT)</option>
                            <option value="en" ${currentTheme.language === 'en' ? 'selected' : ''}>English (US)</option>
                        </select>
                    </div>
                    <div class="caly-config-row">
                        <span class="caly-config-label">${t('primaryColor')}</span>
                        <input type="color" class="caly-color-input" id="caly-color-primary" value="${currentTheme.primary}">
                    </div>
                    <div class="caly-config-row">
                        <span class="caly-config-label">${t('presets')}</span>
                        <div class="caly-preset-container">
                            ${presets.map(p => `<div class="caly-preset-circle" style="background:${p.p}" title="${p.name}" data-preset='${JSON.stringify(p)}'></div>`).join('')}
                        </div>
                    </div>
                    <div class="caly-config-row" style="flex-direction:column; align-items:flex-start; gap:8px;">
                        <span class="caly-config-label">${t('backupPath')}</span>
                        <div class="caly-input-group">
                            <input type="text" class="caly-input" id="caly-path-input" value="${settings.backup_path || ''}" placeholder="C:\\Exemplo\\Pasta">
                            <button class="caly-history-btn" id="caly-history-toggle">
                                ${t('history')} ▾
                            </button>
                            <div class="caly-history-dropdown" id="caly-history-list"></div>
                        </div>
                    </div>
                    <div style="margin-top:auto">
                        <button class="caly-btn" style="width:100%; justify-content:center; padding:10px;" id="caly-save-settings">${t('save')}</button>
                    </div>
                </div>
            `;

            const slider = container.querySelector('#caly-limit-range');
            slider.oninput = (e) => { slider.nextElementSibling.textContent = e.target.value; };

            container.querySelector('#caly-color-primary').oninput = (e) => {
                applyTheme({ ...currentTheme, primary: e.target.value, primaryDark: e.target.value });
            };

            container.querySelectorAll('.caly-preset-circle').forEach(el => {
                el.onclick = () => {
                    const preset = JSON.parse(el.dataset.preset);
                    const newTheme = { ...currentTheme, primary: preset.p, primaryDark: preset.pd, bg: preset.bg, header: preset.h };
                    applyTheme(newTheme);
                    container.querySelector('#caly-color-primary').value = newTheme.primary;
                };
            });

            // History Logic
            const historyBtn = container.querySelector('#caly-history-toggle');
            const historyList = container.querySelector('#caly-history-list');
            const pathInput = container.querySelector('#caly-path-input');

            historyBtn.onclick = () => {
                const isVisible = historyList.style.display === 'block';
                historyList.style.display = isVisible ? 'none' : 'block';
                if (!isVisible) {
                    historyList.innerHTML = '';
                    const history = settings.backup_history || [];
                    if (history.length === 0) {
                        historyList.innerHTML = '<div class="caly-history-item" style="color:#64748b; cursor:default;">Empty</div>';
                    } else {
                        history.forEach(path => {
                            const item = document.createElement('div');
                            item.className = 'caly-history-item';
                            item.textContent = path;
                            item.onclick = () => {
                                pathInput.value = path;
                                historyList.style.display = 'none';
                            };
                            historyList.appendChild(item);
                        });
                    }
                }
            };

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!historyBtn.contains(e.target) && !historyList.contains(e.target)) {
                    historyList.style.display = 'none';
                }
            }, { once: true });


            container.querySelector('#caly-save-settings').onclick = async () => {
                const btn = container.querySelector('#caly-save-settings');
                const newLimit = parseInt(slider.value);
                const col = container.querySelector('#caly-color-primary').value;
                const lang = container.querySelector('#caly-lang-select').value;
                const newPath = container.querySelector('#caly-path-input').value.trim();
                const oldPath = settings.backup_path;

                btn.disabled = true;
                btn.textContent = "⏳...";

                let shouldMove = false;
                if (newPath && oldPath && newPath !== oldPath) {
                    shouldMove = confirm(t('moveBackupsConfirm'));
                }

                await fetch(`${API_URL}/settings/update`, {
                    method: 'POST',
                    body: JSON.stringify({
                        backup_limit: newLimit,
                        language: lang,
                        backup_path: newPath || null
                    })
                });

                if (shouldMove) {
                    btn.textContent = t('movingBackups');
                    await fetch(`${API_URL}/backups/move`, {
                        method: 'POST',
                        body: JSON.stringify({ old_path: oldPath, new_path: newPath })
                    });
                }

                currentTheme = { ...currentTheme, primary: col, primaryDark: col, language: lang };
                saveTheme(currentTheme);
                overlay.remove();
                showRestoreModal(); // Reabrir para atualizar textos
            };
        }

        async function triggerBackup(btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="caly-spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> ${t('backingUp')}`;
            btn.disabled = true;
            try {
                const res = await fetch(`${API_URL}/backup/create`, { method: 'POST' });
                const data = await res.json();
                if (data.status === 'ok') {
                    const overlay = document.getElementById('caly-overlay');
                    if (overlay) {
                        fetchBackups(overlay.querySelector('#caly-list-container'), overlay.querySelector('#caly-usage'));
                    }
                } else {
                    alert(`Error: ${data.message || 'Unknown error'}`);
                }
            } catch (e) {
                alert(`Error: ${e.message}`);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }

        async function fetchBackups(container, usageBar) {
            try {
                const [bRes, sRes] = await Promise.all([fetch(`${API_URL}/list`), fetch(`${API_URL}/settings`)]);
                const backups = await bRes.json();
                const settings = await sRes.json();
                const limit = settings.backup_limit || 5;

                if (usageBar) {
                    const pct = Math.min((backups.length / limit) * 100, 100);
                    usageBar.style.width = `${pct}%`;
                    usageBar.title = `${backups.length} de ${limit} ${t('slotsUsed')}`;
                }
                const usageText = document.getElementById('caly-usage-text');
                if (usageText) {
                    usageText.textContent = `${backups.length} / ${limit} ${t('slotsUsed')}`;
                }

                if (!backups || backups.length === 0) {
                    container.innerHTML = `<div style="padding:60px 20px; text-align:center; color:#64748b; font-size:13px">${t('noBackups')}</div>`;
                    return;
                }

                container.innerHTML = '';
                // Backups are already sorted by backend, but let's reverse to show newest first
                backups.reverse().forEach(backup => {
                    const folder = backup.folder;
                    const item = document.createElement('div');
                    item.className = 'caly-item';
                    if (backup.pinned) item.classList.add('pinned');

                    let displayName = backup.custom_name || folder.replace('BackupSteamMRM-', '').replace(/_/g, ' ').substring(0, 16).replace(/-/g, '/');

                    item.innerHTML = `
                        <div style="flex:1; overflow:hidden;">
                            <span class="caly-date" title="${folder}">${displayName}</span>
                            <span class="caly-path">${folder}</span>
                        </div>
                        <div class="caly-actions">
                             <button class="caly-btn-ghost" title="${t('pin')}" style="${backup.pinned ? 'color:var(--caly-primary); border-color:var(--caly-primary);' : ''}">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                            </button>
                             <button class="caly-btn-ghost" title="${t('rename')}">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                             <div style="width:1px; height:12px; background:rgba(255,255,255,0.1); margin:0 4px;"></div>
                            <button class="caly-btn" title="${t('restore')}">${t('restore')}</button>
                            <button class="caly-btn-red" title="${t('delete')}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    `;

                    // Event Listeners
                    const btns = item.querySelectorAll('button');
                    // Pin
                    btns[0].onclick = () => triggerPin(folder, !backup.pinned, btns[0]);
                    // Rename
                    btns[1].onclick = () => triggerRename(folder, backup.custom_name);
                    // Restore
                    btns[2].onclick = () => triggerRestore(folder, btns[2], item);
                    // Delete
                    btns[3].onclick = () => triggerDelete(folder, btns[3], item);

                    container.appendChild(item);
                });
            } catch (e) { container.innerHTML = `<div style="padding:20px; text-align:center; color:#ef4444">${t('connectionError')} ${e}</div>`; }
        }

        async function triggerPin(folder, newPinnedStatus, btn) {
            try {
                // Optimistic UI update
                btn.style.color = newPinnedStatus ? 'var(--caly-primary)' : '';
                btn.style.borderColor = newPinnedStatus ? 'var(--caly-primary)' : '';

                await fetch(`${API_URL}/backups/update_meta`, {
                    method: 'POST',
                    body: JSON.stringify({ folder: folder, pinned: newPinnedStatus })
                });
                // Refresh to ensure sync
                const overlay = document.querySelector('.caly-overlay');
                if (overlay) fetchBackups(overlay.querySelector('#caly-list-container'), overlay.querySelector('#caly-usage'));
            } catch (e) { alert(t('connectionError') + e); }
        }

        function triggerRename(folder, currentName) {
            // Usar modal próprio pois prompt() pode ser bloqueado no contexto do Millennium/Steam
            const existingRenameModal = document.getElementById('caly-rename-modal-overlay');
            if (existingRenameModal) existingRenameModal.remove();

            const renameOverlay = document.createElement('div');
            renameOverlay.id = 'caly-rename-modal-overlay';
            renameOverlay.className = 'caly-overlay';
            renameOverlay.style.zIndex = '10002';
            renameOverlay.innerHTML = `
                <div class="caly-modal" style="width:400px;">
                    <div class="caly-header">
                        <div class="caly-title">${t('rename')}</div>
                        <div style="cursor:pointer; padding:5px; color:#a1a1aa;" id="caly-rename-close">✕</div>
                    </div>
                    <div style="padding:20px; display:flex; flex-direction:column; gap:12px; background:#18181b;">
                        <label style="font-size:13px; color:#a1a1aa;">${t('renamePrompt')}</label>
                        <input id="caly-rename-input" class="caly-input" type="text" value="${(currentName || '').replace(/"/g, '&quot;')}" placeholder="" />
                        <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:4px;">
                            <button class="caly-btn-ghost" id="caly-rename-cancel">${t('renameCancel')}</button>
                            <button class="caly-btn" id="caly-rename-save">${t('renameSave')}</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(renameOverlay);

            const input = renameOverlay.querySelector('#caly-rename-input');
            // Focar e selecionar tudo no input
            setTimeout(() => { input.focus(); input.select(); }, 50);

            const closeRenameModal = () => renameOverlay.remove();

            const doRename = async () => {
                const newName = input.value.trim();
                closeRenameModal();
                try {
                    await fetch(`${API_URL}/backups/update_meta`, {
                        method: 'POST',
                        body: JSON.stringify({ folder: folder, custom_name: newName })
                    });
                    const overlay = document.querySelector('.caly-overlay');
                    if (overlay) fetchBackups(overlay.querySelector('#caly-list-container'), overlay.querySelector('#caly-usage'));
                } catch (e) { alert(t('connectionError') + e); }
            };

            renameOverlay.querySelector('#caly-rename-close').onclick = closeRenameModal;
            renameOverlay.querySelector('#caly-rename-cancel').onclick = closeRenameModal;
            renameOverlay.querySelector('#caly-rename-save').onclick = doRename;
            // Guardar ao pressionar Enter
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doRename(); if (e.key === 'Escape') closeRenameModal(); });
        }

        async function triggerRestore(folder, btn, item) {
            if (!confirm(`${t('restoreConfirm')}${folder}`)) return;
            btn.textContent = "⏳"; btn.disabled = true;
            try {
                const response = await fetch(`${API_URL}/restore/${folder}`, { method: 'POST' });
                if (response.ok) {
                    document.querySelector('.caly-body').innerHTML = `
                        <div style="padding:40px; text-align:center;">
                            <div style="font-size:18px; margin-bottom:10px; color:#c4b5fd">${t('restoring')}</div>
                            <div style="font-size:14px; color:#94a3b8">${t('restoringSub')}</div>
                            <div style="margin-top:15px; font-size:12px; color:#64748b">${t('restoringSteam')}</div>
                        </div>
                    `;
                } else { alert(t('connectionError')); btn.textContent = t('restore'); btn.disabled = false; }
            } catch (e) { alert(t('connectionError') + e); btn.textContent = t('restore'); btn.disabled = false; }
        }

        async function triggerDelete(folder, btn, item) {
            if (!confirm(`${t('deleteConfirm')}${folder}`)) return;
            btn.textContent = "⏳"; btn.disabled = true;
            try {
                const response = await fetch(`${API_URL}/delete/${folder}`, { method: 'POST' });
                if (response.ok) {
                    item.style.transition = 'all 0.3s ease-out'; item.style.opacity = '0';
                    item.style.transform = 'translateX(20px)';
                    setTimeout(() => {
                        item.remove();
                        // Update usage bar
                        const overlay = document.querySelector('.caly-overlay');
                        if (overlay) fetchBackups(overlay.querySelector('#caly-list-container'), overlay.querySelector('#caly-usage'));
                    }, 300);
                } else {
                    let errorMsg = t('connectionError');
                    try {
                        const data = await response.json();
                        // Traduzir mensagem de backup fixado
                        if (data.message === 'Backup is pinned') {
                            errorMsg = t('pinnedError');
                        } else {
                            errorMsg = data.message || errorMsg;
                        }
                    } catch (_) { }
                    alert(errorMsg);
                    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
                    btn.disabled = false;
                }
            } catch (e) { alert(t('connectionError') + e); btn.disabled = false; }
        }

        async function checkStartupStatus() {
            try {
                const res = await fetch(`${API_URL}/check_restore`);
                const data = await res.json();
                if (data.restored === true) showSuccessModal();
            } catch (e) { }
        }

        function showSuccessModal() {
            removeOverlay();
            ensureCalyStyles();
            const overlay = document.createElement('div');
            overlay.className = 'caly-overlay';
            overlay.innerHTML = `
                <div class="caly-modal success">
                    <div class="caly-header"><div class="caly-title">${t('successTitle')}</div><div style="cursor:pointer; padding:5px" id="caly-close">✕</div></div>
                    <div class="caly-body"><div style="padding:40px; text-align:center;"><div style="font-size:40px; color:#22c55e; margin-bottom:10px">✓</div><div style="font-size:16px; color:#fff; margin-bottom:5px;">${t('successDesc')}</div><div style="font-size:13px; color:#94a3b8">${t('successSub')}</div><button class="caly-btn" id="caly-ok-btn" style="margin-top:20px; background: #22c55e; border-color: #16a34a;">${t('understood')}</button></div></div>
                </div>
            `;
            document.body.appendChild(overlay);
            overlay.onclick = (e) => { if (e.target === overlay) removeOverlay(); };
            overlay.querySelector('#caly-close').onclick = removeOverlay;
            overlay.querySelector('#caly-ok-btn').onclick = removeOverlay;
        }

        // ===================================================================
        // MÓDULO: Botão "Fix Multijogador" em páginas de jogo da Steam
        // ===================================================================

        var searchCache = {}; // Armazena { status: 'loading'|'found'|'notfound', url: string|null }

        function renderButtonState(btn, cacheEntry) {
            if (!cacheEntry || cacheEntry.status === 'loading') {
                btn.className = 'of-loading';
                btn.disabled = true;
                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:calySpin 1s linear infinite"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> ' + t('fixSearching');
                btn.onclick = null;
            } else if (cacheEntry.status === 'found') {
                btn.className = 'of-found';
                btn.disabled = false;
                var defaultHtml = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> ' + t('fixAvailable');
                var clickedHtml = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> ' + t('fixOpened');

                btn.innerHTML = defaultHtml;
                btn.onclick = function () {
                    window.calyOpenExternal(cacheEntry.url);
                    btn.innerHTML = clickedHtml;
                    btn.style.opacity = '0.7';
                    // Reverte após 3 segundos
                    setTimeout(function () {
                        if (document.getElementById('mrm-onlinefix-btn') === btn) {
                            btn.innerHTML = defaultHtml;
                            btn.style.opacity = '1';
                        }
                    }, 3000);
                };
            } else {
                btn.className = 'of-notfound';
                btn.disabled = true;
                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> ' + t('fixNotFound');
                btn.onclick = null;
            }
        }

        function triggerSearch(rawGameName) {
            if (searchCache[rawGameName]) return; // Já iniciou pesquisa ou concluiu

            searchCache[rawGameName] = { status: 'loading', url: null };
            console.log('[SteamMRM] OnlineFix: iniciando pesquisa -> ' + rawGameName);

            var url = API_URL + '/onlinefix/search';
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.timeout = 30000; // 30 segundos

            function pushStateToDOM() {
                var btn = document.getElementById('mrm-onlinefix-btn');
                var titleEl = document.getElementById('appHubAppName') || document.querySelector('.apphub_AppName');
                if (btn && titleEl) {
                    var currentName = (titleEl.textContent || titleEl.innerText || '').trim();
                    if (currentName === rawGameName) {
                        renderButtonState(btn, searchCache[rawGameName]);
                    }
                }
            }

            xhr.onload = function () {
                console.log('[SteamMRM] OnlineFix: HTTP ' + xhr.status + ' resposta=' + xhr.responseText.substring(0, 100));
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data.found && data.url) {
                        searchCache[rawGameName] = { status: 'found', url: data.url };
                    } else {
                        searchCache[rawGameName] = { status: 'notfound', url: null };
                    }
                } catch (e) {
                    searchCache[rawGameName] = { status: 'notfound', url: null };
                }
                pushStateToDOM();
            };

            xhr.onerror = function () { searchCache[rawGameName] = { status: 'notfound', url: null }; pushStateToDOM(); };
            xhr.ontimeout = function () { searchCache[rawGameName] = { status: 'notfound', url: null }; pushStateToDOM(); };
            xhr.onabort = function () { searchCache[rawGameName] = { status: 'notfound', url: null }; pushStateToDOM(); };

            var body = JSON.stringify({ game_name: rawGameName });
            xhr.send(body);
        }

        function injectOnlineFixButton(rawGameName) {
            if (document.getElementById('mrm-onlinefix-wrapper')) return;
            ensureCalyStyles();

            var wrapper = document.createElement('div');
            wrapper.id = 'mrm-onlinefix-wrapper';
            wrapper.style.cssText = 'margin-top:8px;width:100%;box-sizing:border-box;';

            var btn = document.createElement('button');
            btn.id = 'mrm-onlinefix-btn';
            wrapper.appendChild(btn);

            // Garante que a pesquisa está iniciada
            triggerSearch(rawGameName);
            // Renderiza o estado atual (seja loading se acabou de criar, ou found se já existia na cache)
            renderButtonState(btn, searchCache[rawGameName]);

            var sels = [
                '.queue_actions_ctn',
                '#queueActionsCtn',
                '.game_area_purchase_game_wrapper',
                '.game_area_purchase',
                '#game_purchase_action',
                '.game_purchase_action',
                '.game_purchase_action_bg',
                '#buyGameOuterCol',
                '.game_area_purchase_game',
                '#appHubAppName'
            ];
            var anchor = null;
            for (var i = 0; i < sels.length; i++) {
                anchor = document.querySelector(sels[i]);
                if (anchor) break;
            }
            if (!anchor) { console.warn('[SteamMRM] OnlineFix: sem âncora'); return; }

            // Se a âncora for a barra horizontal de "Lista de Desejos", injetamos DENTRO dela
            if (anchor.classList && anchor.classList.contains('queue_actions_ctn') || anchor.id === 'queueActionsCtn') {
                wrapper.style.cssText = 'display:inline-block; margin-left:8px; vertical-align:top; width:auto; height:32px;';
                btn.style.width = 'auto';
                btn.style.marginTop = '0';
                btn.style.padding = '0 15px'; // Mais compacto para caber na barra
                btn.style.fontSize = '12px';
                btn.style.height = '100%';
                btn.style.lineHeight = '32px';
                btn.style.whiteSpace = 'nowrap'; // EVITA QUEBRA DE TEXTO

                // Procurar os botões do lado esquerdo (Desejos, Seguir, Ignorar + setinha)
                // O último deles costuma ser a setinha do ignorar ou o próprio botão ignorar
                var leftControls = anchor.querySelectorAll('.wishlist_add_to_wishlist_area, .queue_control_button');
                if (leftControls.length > 0) {
                    var lastControl = leftControls[leftControls.length - 1];
                    lastControl.insertAdjacentElement('afterend', wrapper);
                } else {
                    anchor.appendChild(wrapper);
                }
            } else {
                // Comportamento original de fallback (bloco inteiro abaixo da área de compra)
                anchor.insertAdjacentElement('afterend', wrapper);
            }

            console.log('[SteamMRM] OnlineFix: botao injetado/re-injetado para ' + rawGameName);
        }

        function watchStorePages() {
            var lastGameName = '';

            function tryInject() {
                var titleEl = document.getElementById('appHubAppName')
                    || document.querySelector('.apphub_AppName');
                if (!titleEl) return;

                var rawName = (titleEl.textContent || titleEl.innerText || '').trim();
                if (!rawName) return;

                if (rawName !== lastGameName) {
                    lastGameName = rawName;
                    var old = document.getElementById('mrm-onlinefix-wrapper');
                    if (old) old.remove();
                }

                // A grande mudanca: se o botao nao estiver no DOM, INJETA SEMPRE.
                // O Steam reconstrói a UI dinamicamente. Esta logica garante que nao o perdemos.
                // O estado visual sera recuperado da cache.
                if (!document.getElementById('mrm-onlinefix-wrapper')) {
                    injectOnlineFixButton(rawName);
                }
            }

            // Estratégia 1: MutationObserver (mais robusto para re-renders do Steam)
            try {
                new MutationObserver(function () {
                    // Nota: nao verificar !btn aqui, porque tryInject ja lida com isso perfeitamente
                    tryInject();
                }).observe(document.documentElement, { childList: true, subtree: true });
                console.log('[SteamMRM] OnlineFix: MutationObserver ativo.');
            } catch (e) {
                console.warn('[SteamMRM] OnlineFix: MutationObserver falhou:', e.message);
            }

            // Estratégia 2: setInterval como rede de segurança
            setInterval(tryInject, 2000);

            setTimeout(tryInject, 800);
        }

        // ===================================================================
        // INIT
        // ===================================================================
        const init = () => {
            if (document.body) {
                createFloatingButton();
                checkStartupStatus();
                watchStorePages();
            } else {
                setTimeout(init, 500);
            }
        };
        init();

    } catch (e) { console.error("[Steam Toolkit MRM] Erro frontend:", e); }
})();
