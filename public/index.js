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
                title: "Backup SteamMRM",
                config: "Configurações",
                refresh: "Atualizar Lista",
                scanner: "Scanner",
                openLudusavi: "Abrir o Ludusavi",
                limit: "Limite de Backups",
                primaryColor: "Cor Principal",
                presets: "Presets Rápidos",
                save: "Salvar Configurações",
                loading: "Buscando backups...",
                noBackups: "Nenhum backup encontrado.",
                poweredByText: "Créditos para",
                byText: "por",
                universalEngine: "Motor Universal",
                restore: "RESTAURAR",
                delete: "APAGAR",
                language: "Idioma",
                restoreConfirm: "⚠️ ATENÇÃO ⚠️\n\nA Steam será FECHADA para restaurar o backup:\n",
                deleteConfirm: "Deseja realmente APAGAR este backup?\n",
                slotsUsed: "slots usados",
                ludusaviError: "Ludusavi não encontrado.",
                connectionError: "Erro de conexão: ",
                successTitle: "Recall Completo",
                successDesc: "Backup restaurado com sucesso!",
                successSub: "Seus arquivos voltaram no tempo.",
                understood: "Entendido",
                restoring: "Iniciando Protocolo Recall...",
                restoringSub: "Verifique a janela de Admin que abrirá.",
                restoringSteam: "Reiniciando Steam..."
            },
            "en": {
                title: "Backup SteamMRM",
                config: "Settings",
                refresh: "Refresh List",
                scanner: "Scanner",
                openLudusavi: "Open Ludusavi",
                limit: "Backup Limit",
                primaryColor: "Primary Color",
                presets: "Quick Presets",
                save: "Save Settings",
                loading: "Searching for backups...",
                noBackups: "No backups found.",
                poweredByText: "Credits for",
                byText: "by",
                universalEngine: "Universal Engine",
                restore: "RESTORE",
                delete: "DELETE",
                language: "Language",
                restoreConfirm: "⚠️ WARNING ⚠️\n\nSteam will be CLOSED to restore the backup:\n",
                deleteConfirm: "Do you really want to DELETE this backup?\n",
                slotsUsed: "slots used",
                ludusaviError: "Ludusavi not found.",
                connectionError: "Connection error: ",
                successTitle: "Recall Complete",
                successDesc: "Backup successfully restored!",
                successSub: "Your files have traveled back in time.",
                understood: "Understood",
                restoring: "Starting Recall Protocol...",
                restoringSub: "Check the Admin window that will open.",
                restoringSteam: "Restarting Steam..."
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
            // Remove o # se existir
            const hex = hexColor.replace('#', '');

            // Converte para RGB
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);

            // Calcula a luminosidade relativa (fórmula W3C)
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

            // Se a luminosidade for maior que 0.5, usa texto escuro, senão usa texto claro
            return luminance > 0.5 ? '#000000' : '#ffffff';
        }

        function applyTheme(theme) {
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
        }

        applyTheme(currentTheme);

        function ensureCalyStyles() {
            if (!document.head) return;
            if (document.getElementById('caly-styles')) return;

            const style = document.createElement('style');
            style.id = 'caly-styles';
            style.textContent = `
                @keyframes calyFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes calySlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                
                :root {
                    --caly-primary: #8b5cf6;
                    --caly-primary-dark: #6d28d9;
                    --caly-bg: linear-gradient(135deg, #13131a 0%, #1e1e2e 100%);
                    --caly-header: linear-gradient(90deg, #2e1065, #13131a);
                    --caly-glow: rgba(139, 92, 246, 0.4);
                    --caly-text-color: #ffffff;
                }

                #caly-fab {
                    position: fixed; bottom: 30px; right: 30px; width: 50px; height: 50px;
                    background: linear-gradient(135deg, var(--caly-primary), var(--caly-primary-dark));
                    border-radius: 50%; box-shadow: 0 0 20px var(--caly-glow);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 99999; cursor: pointer; border: 2px solid rgba(255,255,255,0.1);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); color: var(--caly-text-color);
                }
                #caly-fab:hover { transform: scale(1.1) rotate(15deg); box-shadow: 0 0 30px var(--caly-primary); }
                
                .caly-overlay {
                    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px);
                    z-index: 100000; display: flex; align-items: center; justify-content: center;
                    animation: calyFadeIn 0.2s ease-out;
                }
                .caly-modal {
                    background: var(--caly-bg);
                    border: 2px solid var(--caly-primary); border-radius: 8px; width: 500px; max-width: 90vw;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.9), 0 0 0 1px var(--caly-glow);
                    animation: calySlideUp 0.1s ease-out; color: #fff; font-family: "Motiva Sans", sans-serif;
                    overflow: hidden; display: flex; flex-direction: column;
                }
                .caly-header {
                    padding: 20px; background: var(--caly-header);
                    border-bottom: 2px solid var(--caly-glow); display: flex; justify-content: space-between; align-items: center;
                }
                .caly-title {
                    font-size: 22px; font-weight: 700; background: linear-gradient(135deg, #fff 0%, var(--caly-primary) 100%);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                }
                .caly-body { padding: 0; max-height: 60vh; overflow-y: auto; background: rgba(0,0,0,0.2); }
                .caly-view-container { display: flex; width: 200%; transition: transform 0.4s cubic-bezier(0.87, 0, 0.13, 1); }
                .caly-view { width: 50%; display: flex; flex-direction: column; }

                .caly-item {
                    padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05);
                    display: flex; justify-content: space-between; align-items: center; transition: background 0.2s;
                }
                .caly-item:hover { background: var(--caly-glow); }
                .caly-date { display: block; font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 4px; }
                .caly-path { display: block; font-size: 12px; color: #94a3b8; font-family: monospace; }
                
                .caly-btn {
                    background: linear-gradient(135deg, var(--caly-primary) 0%, var(--caly-primary-dark) 100%); border: 1px solid var(--caly-primary-dark);
                    color: var(--caly-text-color); padding: 8px 16px; border-radius: 4px; font-weight: 600; cursor: pointer;
                    text-decoration: none; font-size: 13px; transition: all 0.2s;
                }
                .caly-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px var(--caly-glow); }
                .caly-btn:disabled { filter: grayscale(1); cursor: not-allowed; opacity: 0.7; }
                
                .caly-btn-red {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border: 1px solid #b91c1c;
                    color: white; padding: 8px 16px; border-radius: 4px; font-weight: 600; cursor: pointer;
                    text-decoration: none; font-size: 13px; transition: all 0.2s; margin-right: 8px;
                }
                .caly-btn-red:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); }

                .caly-storage-bar { height: 4px; background: rgba(255,255,255,0.05); overflow: hidden; position: relative; }
                .caly-storage-fill { 
                    height: 100%; background: var(--caly-primary); width: 0%; 
                    transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
                    box-shadow: 0 0 10px var(--caly-primary);
                }

                @keyframes calySpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .caly-spin { animation: calySpin 0.8s linear infinite; }
                
                .caly-refresh-btn {
                    background: transparent; border: 1px solid var(--caly-glow);
                    color: var(--caly-primary); padding: 5px 10px; border-radius: 4px; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; transition: all 0.2s;
                }
                .caly-refresh-btn:hover { background: var(--caly-glow); border-color: var(--caly-primary); color: white; }

                .caly-settings-btn {
                    background: transparent; border: none; 
                    color: #94a3b8; cursor: pointer; padding: 0; width: 32px; height: 32px;
                    display: flex; align-items: center; justify-content: center; transition: all 0.2s;
                }
                .caly-settings-btn svg { width: 22px; height: 22px; }
                .caly-settings-btn:hover { 
                    color: var(--caly-primary);
                    filter: drop-shadow(0 0 8px var(--caly-glow));
                }
                .caly-settings-btn.active { color: var(--caly-primary); }
               
                .caly-config-body { padding: 25px; display: flex; flex-direction: column; gap: 20px; }
                .caly-config-row { display: flex; justify-content: space-between; align-items: center; }
                .caly-config-label { font-size: 14px; font-weight: 600; color: #e2e8f0; }
                
                .caly-slider-container { flex: 1; margin: 0 15px; display: flex; align-items: center; gap: 15px; }
                .caly-slider { flex: 1; -webkit-appearance: none; background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; }
                .caly-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; background: var(--caly-primary); border-radius: 50%; cursor: pointer; box-shadow: 0 0 10px var(--caly-primary); }

                .caly-color-input { 
                    width: 40px; height: 30px; border: none; border-radius: 4px; cursor: pointer; background: none; 
                    padding: 0; outline: none;
                }
                .caly-select {
                    background: #1e1e2e; color: #fff; border: 1px solid var(--caly-primary); 
                    padding: 4px 8px; border-radius: 4px; outline: none; font-size: 12px;
                }
                .caly-preset-container { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
                .caly-preset-circle { 
                    width: 24px; height: 24px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.1);
                    transition: transform 0.2s;
                }
                .caly-preset-circle:hover { transform: scale(1.2); }
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
                        <div style="display:flex; align-items:center; gap:10px;">
                             <button class="caly-settings-btn" id="caly-toggle-view" title="${t('config')}">
                                <svg id="caly-nav-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path>
                                </svg>
                            </button>
                           <button class="caly-refresh-btn" id="caly-refresh" title="${t('refresh')}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                            </button>
                             <button class="caly-btn" id="caly-open-ludusavi" style="padding: 6px 12px; font-size: 11px; font-weight: 700;">${t('openLudusavi')}</button>
                            <div style="cursor:pointer; padding:5px" id="caly-close">✕</div>
                        </div>
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

            let isConfigOpen = false;
            overlay.querySelector('#caly-toggle-view').onclick = () => {
                isConfigOpen = !isConfigOpen;
                overlay.querySelector('#caly-slider').style.transform = isConfigOpen ? 'translateX(-50%)' : 'translateX(0)';
                overlay.querySelector('#caly-nav-icon').style.color = isConfigOpen ? 'var(--caly-primary)' : '#94a3b8';
                if (isConfigOpen) {
                    overlay.querySelector('#caly-toggle-view').classList.add('active');
                    renderConfigView(overlay.querySelector('#caly-config-container'), overlay);
                } else {
                    overlay.querySelector('#caly-toggle-view').classList.remove('active');
                }
            };

            overlay.querySelector('#caly-refresh').onclick = () => {
                const svg = overlay.querySelector('#caly-refresh svg');
                svg.classList.add('caly-spin');
                fetchBackups(overlay.querySelector('#caly-list-container'), overlay.querySelector('#caly-usage')).finally(() => {
                    setTimeout(() => svg.classList.remove('caly-spin'), 500);
                });
            };

            overlay.querySelector('#caly-open-ludusavi').onclick = () => {
                fetch(`${API_URL}/ludusavi/open`, { method: 'POST' }).then(r => r.json()).then(data => {
                    if (data.status === 'not_found') alert(t('ludusaviError'));
                });
            };

            fetchBackups(overlay.querySelector('#caly-list-container'), overlay.querySelector('#caly-usage'));
        }

        async function renderConfigView(container, overlay) {
            const res = await fetch(`${API_URL}/settings`);
            const settings = await res.json();

            const presets = [
                { name: "Violet", p: "#8b5cf6", pd: "#6d28d9", bg: "linear-gradient(135deg, #13131a 0%, #1e1e2e 100%)", h: "linear-gradient(90deg, #2e1065, #13131a)" },
                { name: "Ocean", p: "#0ea5e9", pd: "#0369a1", bg: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", h: "linear-gradient(90deg, #1e3a8a, #0f172a)" },
                { name: "Crimson", p: "#ef4444", pd: "#b91c1c", bg: "linear-gradient(135deg, #1a0505 0%, #2d0a0a 100%)", h: "linear-gradient(90deg, #7f1d1d, #1a0505)" },
                { name: "Forest", p: "#22c55e", pd: "#15803d", bg: "linear-gradient(135deg, #051a05 0%, #0a2d0a 100%)", h: "linear-gradient(90deg, #14532d, #051a05)" }
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
                    <div>
                        <span class="caly-config-label">${t('presets')}</span>
                        <div class="caly-preset-container">
                            ${presets.map(p => `<div class="caly-preset-circle" style="background:${p.p}" title="${p.name}" data-preset='${JSON.stringify(p)}'></div>`).join('')}
                        </div>
                    </div>
                    <div style="margin-top:auto">
                        <button class="caly-btn" style="width:100%" id="caly-save-settings">${t('save')}</button>
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

            container.querySelector('#caly-save-settings').onclick = async () => {
                const newLimit = parseInt(slider.value);
                const col = container.querySelector('#caly-color-primary').value;
                const lang = container.querySelector('#caly-lang-select').value;

                await fetch(`${API_URL}/settings/update`, {
                    method: 'POST',
                    body: JSON.stringify({ backup_limit: newLimit, language: lang })
                });

                currentTheme = { ...currentTheme, primary: col, primaryDark: col, language: lang };
                saveTheme(currentTheme);
                overlay.remove();
                showRestoreModal(); // Reabrir para atualizar textos
            };
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

                if (!backups || backups.length === 0) {
                    container.innerHTML = `<div style="padding:60px 20px; text-align:center; color:#64748b; font-size:13px">${t('noBackups')}</div>`;
                    return;
                }

                container.innerHTML = '';
                backups.reverse().forEach(folder => {
                    const item = document.createElement('div');
                    item.className = 'caly-item';
                    let dateStr = folder.replace('BackupSteamMRM-', '').replace(/_/g, ' ').substring(0, 16).replace(/-/g, '/');
                    item.innerHTML = `<div><span class="caly-date">${dateStr}</span><span class="caly-path">${folder}</span></div>`;
                    const btns = document.createElement('div');
                    btns.style.display = 'flex';
                    const bDel = document.createElement('button');
                    bDel.className = 'caly-btn-red'; bDel.textContent = t('delete');
                    bDel.onclick = () => triggerDelete(folder, bDel, item);
                    const bRes = document.createElement('button');
                    bRes.className = 'caly-btn'; bRes.textContent = t('restore');
                    bRes.onclick = () => triggerRestore(folder, bRes, item);
                    btns.append(bDel, bRes);
                    item.appendChild(btns);
                    container.appendChild(item);
                });
            } catch (e) { container.innerHTML = `<div style="padding:20px; text-align:center; color:#ef4444">${t('connectionError')} ${e}</div>`; }
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
                    setTimeout(() => item.remove(), 300);
                } else { alert(t('connectionError')); btn.textContent = t('delete'); btn.disabled = false; }
            } catch (e) { alert(t('connectionError') + e); btn.textContent = t('delete'); btn.disabled = false; }
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
                    <div class="caly-body"><div style="padding:40px; text-align:center;"><div class="caly-success-icon">✓</div><div style="font-size:16px; color:#fff; margin-bottom:5px;">${t('successDesc')}</div><div style="font-size:13px; color:#94a3b8">${t('successSub')}</div><button class="caly-btn" id="caly-ok-btn" style="margin-top:20px; background: #22c55e; border-color: #16a34a;">${t('understood')}</button></div></div>
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