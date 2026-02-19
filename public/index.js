(function () {
    'use strict';

    console.log("[backup SteamMRM] Script carregado!");

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
            const blocks = [
                "/search", "/discussions", "/points", "/inventory", "/profiles/",
                "store.steampowered.com/app/", "store.steampowered.com/sub/", "store.steampowered.com/bundle/"
            ];

            const isAllowed = allows.some(a => url.includes(a)) || url === "about:blank";
            const isBlocked = blocks.some(b => url.includes(b));

            // Especial: Garantir que na loja seja APENAS a home
            if (url.includes("store.steampowered.com")) {
                const path = window.location.pathname;
                return path === "/" || path === "" || path.includes("/home");
            }

            return isAllowed && !isBlocked;
        }

        // --- ABORTO IMEDIATO SE FOR CONTEXTO INVÁLIDO ---
        if (!isAllowedContext()) return;

        // Dicionário de Traduções
        const TRANSLATIONS = {
            "pt": {
                title: "Backup SteamMRM v5",
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
                poweredByText: "Backend",
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
                history: "Histórico",
                pinned: "Fixado"
            },
            "en": {
                title: "Backup SteamMRM v5",
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
                poweredByText: "Backend",
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
                history: "History",
                pinned: "Pinned"
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
                .caly-preset-circle { 
                    width: 20px; height: 20px; border-radius: 50%; cursor: pointer; border: 2px solid transparent;
                    transition: transform 0.2s;
                }
                .caly-preset-circle.selected { border-color: #fff; transform: scale(1.1); }
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
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
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
                    
                     <div style="padding: 12px 24px; background: rgba(0,0,0,0.4); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 10px; color: #64748b;">${t('poweredByText')} <b>Ludusavi</b> &amp; <b>CalyRecall</b></div>
                        <div style="font-size: 10px; color: #4b5563;">${t('byText')} <span style="color:var(--caly-primary); font-weight:700;">TheKillerMRM</span></div>
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
                }
            };

            overlay.querySelector('#caly-refresh').onclick = () => {
                const btn = overlay.querySelector('#caly-refresh');
                const svg = btn.querySelector('svg');
                svg.classList.add('caly-spin');
                fetchBackups(overlay.querySelector('#caly-list-container'), overlay.querySelector('#caly-usage')).finally(() => {
                    setTimeout(() => svg.classList.remove('caly-spin'), 500);
                });
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

        async function triggerBackup(btn) {
            btn.disabled = true;
            btn.innerHTML = `⏳ ${t('backingUp')}`;
            try {
                const res = await fetch(`${API_URL}/backups/create`, { method: 'POST' });
                const data = await res.json();
                if (data.status === 'success') {
                    // Refresh list
                    const overlay = document.querySelector('.caly-overlay');
                    if (overlay) {
                        fetchBackups(overlay.querySelector('#caly-list-container'), overlay.querySelector('#caly-usage'));
                    }
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (e) { alert(t('connectionError') + e); }
            finally {
                btn.disabled = false;
                btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> ${t('backupNow')}`;
            }
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

        async function triggerRename(folder, currentName) {
            const newName = prompt(t('renamePrompt'), currentName || "");
            if (newName === null) return; // Cancelled

            try {
                await fetch(`${API_URL}/backups/update_meta`, {
                    method: 'POST',
                    body: JSON.stringify({ folder: folder, custom_name: newName })
                });
                const overlay = document.querySelector('.caly-overlay');
                if (overlay) fetchBackups(overlay.querySelector('#caly-list-container'), overlay.querySelector('#caly-usage'));
            } catch (e) { alert(t('connectionError') + e); }
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
                    const data = await response.json();
                    alert(data.message || t('connectionError'));
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

        const init = () => { if (document.body) { createFloatingButton(); checkStartupStatus(); } else { setTimeout(init, 500); } };
        init();

    } catch (e) { console.error("[backup SteamMRM] Erro frontend:", e); }
})();