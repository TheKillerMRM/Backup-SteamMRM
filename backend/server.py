import os
import json
import threading
import urllib.parse
import sys
import re
from difflib import SequenceMatcher
from http.server import BaseHTTPRequestHandler, HTTPServer
from config import BACKUP_ROOT, SERVER_PORT, STEAM_PATH

# ---------------------------------------------------------------------------
# Auxiliar: limpa o nome de um jogo antes de comparar com resultados
# ---------------------------------------------------------------------------
_NOISE_WORDS = re.compile(
    r'\b(edition|deluxe|ultimate|complete|definitive|enhanced|remastered|'
    r'gold|premium|directors?\s*cut|game\s*of\s*the\s*year|goty|'
    r'anniversary|bundle|pack|collection|standard|limited)\b',
    re.IGNORECASE
)

def clean_game_name(name: str) -> str:
    """Remove símbolos especiais e palavras de marketing do nome do jogo."""
    # Remove tudo o que não for letra, número ou espaço (ex: emojis, pontuação, símbolos, ™, etc)
    name = re.sub(r'[^\w\s]', ' ', name)
    # Remove palavras de ruído (Edition, Deluxe, etc.)
    name = _NOISE_WORDS.sub('', name)
    # Colapsa espaços duplos
    name = re.sub(r'\s+', ' ', name).strip()
    return name.lower()

def score_match(query: str, candidate: str) -> float:
    """
    Retorna um score de 0.0 a 1.0 entre query e candidato.
    Usa fuzzy primeiro; se abaixo do threshold, penaliza matches de substring
    proporcional à diferença de tamanho (evita 'The Forest' dar match em
    'Sons Of The Forest').
    """
    q = clean_game_name(query)
    c = clean_game_name(candidate)
    if not q or not c:
        return 0.0
    # Score fuzzy base
    ratio = SequenceMatcher(None, q, c).ratio()
    if ratio >= 0.80:
        return ratio
    # Fallback substring: só válido se a query cobrir >= 70% do candidato
    # (evita que 'the forest' bata em 'sons of the forest')
    if q in c:
        size_ratio = len(q) / max(len(c), 1)
        if size_ratio >= 0.70:
            return 0.80  # Conta como match válido
    if c in q:
        size_ratio = len(c) / max(len(q), 1)
        if size_ratio >= 0.70:
            return 0.80
    return ratio

def names_match(query: str, candidate: str, threshold: float = 0.80) -> bool:
    """Retorna True se score_match >= threshold."""
    return score_match(query, candidate) >= threshold

SETTINGS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "settings.json")

def load_settings():
    try:
        with open(SETTINGS_FILE, "r") as f: return json.load(f)
    except: return {"backup_limit": 5}

def save_settings(data):
    try:
        with open(SETTINGS_FILE, "w") as f: json.dump(data, f, indent=4)
    except Exception as e: print(f"[Steam Toolkit MRM] Error saving settings: {e}")

class backupSteamMRMRequestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept, Origin")
        self.end_headers()

    def do_GET(self):
        if self.path == '/check_restore':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            flag_file = os.path.join(BACKUP_ROOT, "restore_success.flag")
            was_restored = False

            if os.path.exists(flag_file):
                was_restored = True
                try: os.remove(flag_file)
                except: pass
            
            self.wfile.write(json.dumps({"restored": was_restored}).encode())

        elif self.path == '/list':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            self.end_headers()
            
            backups = []
            if os.path.exists(BACKUP_ROOT):
                try:
                    for d in os.listdir(BACKUP_ROOT):
                        if os.path.isdir(os.path.join(BACKUP_ROOT, d)) and d.startswith("BackupSteamMRM"):
                            # Read Metadata
                            meta = {}
                            meta_file = os.path.join(BACKUP_ROOT, d, "meta.json")
                            if os.path.exists(meta_file):
                                try:
                                    with open(meta_file, "r") as f: meta = json.load(f)
                                except: pass
                            
                            backups.append({
                                "folder": d,
                                "custom_name": meta.get("custom_name"),
                                "pinned": meta.get("pinned", False),
                                "timestamp": meta.get("timestamp")
                            })
                    
                    # Sort by folder name (date)
                    backups.sort(key=lambda x: x["folder"])
                except: pass
            
            self.wfile.write(json.dumps(backups).encode())

        elif self.path == '/settings':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            data = load_settings()
            data["active_path"] = BACKUP_ROOT
            data["backup_history"] = data.get("backup_history", [])
            
            self.wfile.write(json.dumps(data).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == '/backup/create':
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                from monitor import create_backup
                result = create_backup(trigger="manual")
                self.wfile.write(json.dumps({"status": "ok", "success": result}).encode())
            except Exception as e:
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode())

        elif self.path.startswith('/restore/'):
            backup_name = self.path.replace('/restore/', '')
            backup_name = urllib.parse.unquote(backup_name)
            
            print(f"[Steam Toolkit MRM] COMANDO RECEBIDO: Restaurar {backup_name}")
            
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'{"status": "accepted"}')

            threading.Thread(target=trigger_external_restore, args=(backup_name,), daemon=True).start()

        elif self.path.startswith('/delete/'):
            import shutil
            backup_name = self.path.replace('/delete/', '')
            backup_name = urllib.parse.unquote(backup_name)
            
            print(f"[Steam Toolkit MRM] COMANDO RECEBIDO: Apagar {backup_name}")
            backup_path = os.path.join(BACKUP_ROOT, backup_name)
            
            try:
                # Check for PIN
                is_pinned = False
                meta_file = os.path.join(backup_path, "meta.json")
                if os.path.exists(meta_file):
                    with open(meta_file, "r") as f:
                        if json.load(f).get("pinned", False): is_pinned = True

                if is_pinned:
                    self.send_response(400) # Bad Request
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(b'{"status": "error", "message": "Backup is pinned"}')
                    return

                if os.path.exists(backup_path) and backup_name.startswith("BackupSteamMRM-"):
                    shutil.rmtree(backup_path)
                    print(f"[Steam Toolkit MRM] Backup {backup_name} apagado com sucesso.")
                    self.send_response(200)
                    self.end_headers()
                    self.wfile.write(b'{"status": "done"}')
                else:
                    self.send_response(404)
                    self.end_headers()
            except Exception as e:
                print(f"[Steam Toolkit MRM] Erro ao apagar backup: {e}")
                self.send_response(500)
                self.end_headers()
            
        elif self.path == '/settings/update':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                new_data = json.loads(post_data.decode('utf-8'))
                current = load_settings()
                
                # History Logic
                if "backup_path" in new_data:
                    old_path = current.get("backup_path")
                    if old_path and old_path != new_data["backup_path"]:
                        history = current.get("backup_history", [])
                        if old_path not in history:
                            history.append(old_path)
                            # Keep last 5 entries
                            current["backup_history"] = history[-5:]

                current.update(new_data)
                save_settings(current)
                
                # Recarrega a config global para que o resto do sistema veja o novo path
                import config
                config.reload_config()

                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(b'{"status": "saved"}')
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(str(e).encode())

        elif self.path == '/backups/create':
            try:
                from monitor import create_backup
                threading.Thread(target=create_backup, args=("manual",), daemon=True).start()
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(b'{"status": "started"}')
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())

        elif self.path == '/backups/update_meta':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                folder = data.get("folder")
                if folder:
                    backup_path = os.path.join(BACKUP_ROOT, folder)
                    if os.path.exists(backup_path):
                        meta_file = os.path.join(backup_path, "meta.json")
                        meta = {}
                        if os.path.exists(meta_file):
                            try:
                                with open(meta_file, "r") as f: meta = json.load(f)
                            except: pass
                        
                        if "custom_name" in data: meta["custom_name"] = data["custom_name"]
                        if "pinned" in data: meta["pinned"] = data["pinned"]

                        with open(meta_file, "w") as f: json.dump(meta, f)
                        
                        self.send_response(200)
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(b'{"status": "updated"}')
                        return

                self.send_response(400)
                self.end_headers()
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())

        elif self.path == '/ludusavi/open':
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            try:
                import subprocess
                # Caminho para o executável dentro da pasta do plugin
                plugin_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                ludu_exe = os.path.join(plugin_root, "ludusavi", "ludusavi.exe")
                
                if os.path.exists(ludu_exe):
                    print(f"[Steam Toolkit MRM] Abrindo Ludusavi em: {ludu_exe}")
                    subprocess.Popen([ludu_exe], creationflags=0x00000008) # DETACHED_PROCESS
                    self.wfile.write(b'{"status": "ok"}')
                else:
                    print(f"[Steam Toolkit MRM] ERRO: Ludusavi nao encontrado em {ludu_exe}")
                    self.wfile.write(b'{"status": "not_found"}')
            except Exception as e:
                print(f"[Steam Toolkit MRM] Erro ao abrir Ludusavi: {e}")
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode())

        elif self.path == '/steamautocrack/open':
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            try:
                import subprocess
                # Caminho para o executável dentro da pasta do plugin
                plugin_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                sac_exe = os.path.join(plugin_root, "SteamAutoCrack", "SteamAutoCrack.exe")
                
                if os.path.exists(sac_exe):
                    print(f"[Steam Toolkit MRM] Abrindo SteamAutoCrack em: {sac_exe}")
                    subprocess.Popen([sac_exe], creationflags=0x00000008) # DETACHED_PROCESS
                    self.wfile.write(b'{"status": "ok"}')
                else:
                    print(f"[Steam Toolkit MRM] ERRO: SteamAutoCrack nao encontrado em {sac_exe}")
                    self.wfile.write(b'{"status": "not_found"}')
            except Exception as e:
                print(f"[Steam Toolkit MRM] Erro ao abrir SteamAutoCrack: {e}")
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode())

        elif self.path == '/open_url':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                url = data.get('url')
                if url:
                    # Usa os.startfile no Windows para forçar a abertura em primeiro plano
                    os.startfile(url)
                    self.send_response(200)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(b'{"status": "ok"}')
                else:
                    self.send_response(400)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(b'{"status": "missing_url"}')
            except Exception as e:
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(str(e).encode())

        elif self.path == '/backups/open':
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            try:
                import config
                config.reload_config()
                path = config.BACKUP_ROOT
                if os.path.exists(path):
                    norm_path = os.path.normpath(path)
                    def open_and_focus(folder_path):
                        import ctypes
                        import subprocess
                        import time
                        user32 = ctypes.windll.user32
                        kernel32 = ctypes.windll.kernel32
                        subprocess.Popen(['explorer.exe', folder_path])
                        time.sleep(1.2)
                        folder_name = os.path.basename(folder_path)
                        WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
                        found = [None]
                        def callback(hwnd, lp):
                            length = user32.GetWindowTextLengthW(hwnd)
                            if length > 0:
                                buf = ctypes.create_unicode_buffer(length + 1)
                                user32.GetWindowTextW(hwnd, buf, length + 1)
                                if folder_name.lower() in buf.value.lower():
                                    if user32.IsWindowVisible(hwnd):
                                        found[0] = hwnd
                                        return False
                            return True
                        user32.EnumWindows(WNDENUMPROC(callback), 0)
                        if found[0]:
                            hwnd = found[0]
                            # Attach to the foreground thread to gain permission
                            fg_hwnd = user32.GetForegroundWindow()
                            fg_tid = user32.GetWindowThreadProcessId(fg_hwnd, None)
                            our_tid = kernel32.GetCurrentThreadId()
                            user32.AttachThreadInput(our_tid, fg_tid, True)
                            # Alt key trick - bypasses Windows foreground restriction
                            user32.keybd_event(0xA4, 0, 0, 0)  # Alt down
                            user32.keybd_event(0xA4, 0, 2, 0)  # Alt up
                            user32.ShowWindow(hwnd, 9)  # SW_RESTORE
                            user32.SetForegroundWindow(hwnd)
                            user32.BringWindowToTop(hwnd)
                            # Detach
                            user32.AttachThreadInput(our_tid, fg_tid, False)
                    threading.Thread(target=open_and_focus, args=(norm_path,), daemon=True).start()
                    self.wfile.write(b'{"status": "ok"}')
                else:
                    self.wfile.write(b'{"status": "not_found"}')
            except Exception as e:
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode())

        elif self.path == '/backups/move':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                old_path = data.get('old_path')
                new_path = data.get('new_path')
                
                if old_path and new_path and os.path.exists(old_path):
                    import shutil
                    os.makedirs(new_path, exist_ok=True)
                    for item in os.listdir(old_path):
                        if item.startswith("BackupSteamMRM"):
                            s = os.path.join(old_path, item)
                            d = os.path.join(new_path, item)
                            if os.path.isdir(s):
                                if os.path.exists(d):
                                    shutil.rmtree(d)
                                shutil.move(s, d)
                    
                    self.send_response(200)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(b'{"status": "success"}')
                else:
                    self.send_response(400)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(b'{"status": "invalid_paths"}')
            except Exception as e:
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(str(e).encode())

        elif self.path == '/onlinefix/search':
            # ------------------------------------------------------------------
            # Pesquisa no online-fix.me com bypass da Cloudflare via curl_cffi
            # ------------------------------------------------------------------
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            def search_onlinefix(game_name: str) -> dict:
                try:
                    from curl_cffi import requests as cffi_requests
                    from bs4 import BeautifulSoup

                    # Aplica a limpeza (remove emojis, pontuação, Edições, etc) ANTES de pesquisar no site
                    clean_query = clean_game_name(game_name)
                    # Codifica o nome limpo para URL
                    encoded = urllib.parse.quote_plus(clean_query)
                    search_url = (
                        "https://online-fix.me/index.php"
                        "?do=search&subaction=search&story=" + encoded
                    )

                    print(f"[Steam Toolkit MRM] OnlineFix: pesquisando original '{game_name}' limpo: '{clean_query}'")

                    # Simula Chrome para passar pela Cloudflare
                    resp = cffi_requests.get(
                        search_url,
                        impersonate="chrome",
                        timeout=20,
                        headers={"Accept-Language": "en-US,en;q=0.9"}
                    )

                    if resp.status_code != 200:
                        print("[Steam Toolkit MRM] OnlineFix: HTTP " + str(resp.status_code))
                        return {"found": False}

                    soup = BeautifulSoup(resp.text, "html.parser")

                    # -------------------------------------------------------
                    # Estrutura real do site (analisada via debug):
                    # Os resultados de pesquisa sao links com href='/games/...'
                    # O texto do link e o titulo do jogo em Russo/Ingles
                    # com sufixo Cirílico " по сети" (= "by network/online")
                    # Ex: "Elden Ring по сети"  ou  "ELDEN RING NIGHTREIGN по сети"
                    # -------------------------------------------------------

                    # Sufixos Cirílicos a remover antes do match
                    CYRILLIC_SUFFIXES = [
                        "\u043f\u043e \u0441\u0435\u0442\u0438",  # "по сети"
                        "po seti",
                        "online fix",
                        "fix",
                    ]

                    def strip_suffix(text):
                        """Remove sufixo Ciriílico e palavras de fix do título."""
                        t = text.strip()
                        for s in CYRILLIC_SUFFIXES:
                            if t.lower().endswith(s.lower()):
                                t = t[:-(len(s))].strip()
                        return t

                    candidates = []

                    # Seletor 1: links dentro da secção .news (resultados de pesquisa)
                    # Apanha todos os <a href='/games/...'> com texto
                    for a_tag in soup.select("a[href]"):
                        href = a_tag.get("href", "")
                        title = a_tag.get_text(strip=True)
                        # Filtra apenas links de jogos (URL contém /games/)
                        if "/games/" in href and title and len(title) > 3:
                            # Remover sufixo Ciriílico do título antes de guardar
                            clean_title = strip_suffix(title)
                            # Garantir URL absoluto
                            if href.startswith("/"):
                                href = "https://online-fix.me" + href
                            candidates.append((clean_title, href))

                    # Remover duplicados mantendo ordem
                    seen_hrefs = set()
                    unique_candidates = []
                    for title, href in candidates:
                        if href not in seen_hrefs:
                            seen_hrefs.add(href)
                            unique_candidates.append((title, href))
                    candidates = unique_candidates

                    print("[Steam Toolkit MRM] OnlineFix: " + str(len(candidates)) + " candidatos encontrados")

                    # Pontuar todos os candidatos e escolher o melhor
                    # (evita parar no primeiro substring match errado)
                    best_score = 0.0
                    best_href = None
                    for title, href in candidates:
                        sc = score_match(game_name, title)
                        if sc > best_score:
                            best_score = sc
                            best_href = href

                    if best_score >= 0.80 and best_href:
                        print("[Steam Toolkit MRM] OnlineFix: match encontrado (score=" + str(round(best_score,2)) + ") -> " + best_href)
                        return {"found": True, "url": best_href}

                    # Fallback: slug do URL com verificacao de tamanho relativo
                    game_slug = re.sub(r"[^a-z0-9]+", "-", clean_game_name(game_name)).strip("-")
                    best_slug_href = None
                    best_slug_ratio = 0.0
                    for title, href in candidates:
                        href_lower = href.lower()
                        if game_slug and len(game_slug) > 3 and game_slug in href_lower:
                            # Calcular ratio de tamanho do slug vs parte do href
                            slug_ratio = len(game_slug) / max(len(title), 1)
                            if slug_ratio > best_slug_ratio:
                                best_slug_ratio = slug_ratio
                                best_slug_href = href

                    if best_slug_href and best_slug_ratio >= 0.60:
                        print("[Steam Toolkit MRM] OnlineFix: match por slug (ratio=" + str(round(best_slug_ratio,2)) + ") -> " + best_slug_href)
                        return {"found": True, "url": best_slug_href}

                    print("[Steam Toolkit MRM] OnlineFix: sem match para '" + game_name + "'")
                    return {"found": False}

                except ImportError:
                    print("[Steam Toolkit MRM] OnlineFix: curl_cffi/bs4 nao encontrados.")
                    return {"found": False, "error": "missing_deps"}
                except Exception as e:
                    print("[Steam Toolkit MRM] OnlineFix: erro silencioso -> " + str(e))
                    return {"found": False}

            try:
                body = json.loads(post_data.decode('utf-8'))
                game_name = body.get('game_name', '').strip()
                if not game_name:
                    self.wfile.write(json.dumps({"found": False, "error": "missing_game_name"}).encode())
                else:
                    result = search_onlinefix(game_name)
                    self.wfile.write(json.dumps(result).encode())
            except Exception as e:
                print(f"[Steam Toolkit MRM] OnlineFix: erro ao processar request -> {e}")
                self.wfile.write(json.dumps({"found": False}).encode())

    def log_message(self, format, *args): return

def trigger_external_restore(backup_folder_name):
    backup_src = os.path.join(BACKUP_ROOT, backup_folder_name)
    steam_exe = os.path.join(STEAM_PATH, "steam.exe")
    temp_bat = os.path.join(os.environ["TEMP"], "caly_restore.bat")
    flag_file = os.path.join(BACKUP_ROOT, "restore_success.flag")

    print(f"[Steam Toolkit MRM] Gerando script AUTO-ELEVAVEL em: {temp_bat}")

    bat_content = [
        "@echo off",
        "title Steam Toolkit MRM - Verificando Permissoes...",
        "color 0D",
        "cls",
        "",
        ":: --- BLOC DE AUTO-ELEVACAO (VBS METHOD) ---",
        "net session >nul 2>&1",
        "if %errorLevel% == 0 (",
        "    goto :gotAdmin",
        ") else (",
        "    echo Solicitando Permissao de Administrador...",
        "    echo Set UAC = CreateObject^(\"Shell.Application\"^) > \"%temp%\\getadmin.vbs\"",
        "    echo UAC.ShellExecute \"%~s0\", \"\", \"\", \"runas\", 1 >> \"%temp%\\getadmin.vbs\"",
        "    \"%temp%\\getadmin.vbs\"",
        "    exit /B",
        ")",
        "",
        ":: --- INICIO DO PROCESSO REAL ---",
        ":gotAdmin",
        "if exist \"%temp%\\getadmin.vbs\" ( del \"%temp%\\getadmin.vbs\" )",
        "pushd \"%CD%\"",
        "CD /D \"%~dp0\"",
        "",
        "title Steam Toolkit MRM - RESTAURANDO...",
        "echo.",
        "echo  =========================================",
        "echo      Steam Toolkit MRM - PROTOCOLO DE RESTAURO",
        "echo  =========================================",
        "echo.",
        "echo  [1/4] Aguardando fechamento da Steam...",
        "timeout /t 3 /nobreak >nul",
        "",
        "echo  [2/4] Matando processos travados...",
        "taskkill /F /IM steam.exe >nul 2>&1",
        "timeout /t 2 /nobreak >nul",
        "",
        "echo  [3/4] Restaurando arquivos do backup...",
        f'set "BACKUP={backup_src}"',
        f'set "STEAM={STEAM_PATH}"',
        "",
        'echo    -> Userdata',
        'xcopy "%BACKUP%\\userdata\\*" "%STEAM%\\userdata\\" /E /H /C /I /Y /Q >nul 2>&1',
        "",
        'echo    -> Stats',
        'xcopy "%BACKUP%\\appcache_stats\\*" "%STEAM%\\appcache\\stats\\" /E /H /C /I /Y /Q >nul 2>&1',
        "",
        'echo    -> Depotcache',
        'xcopy "%BACKUP%\\depotcache\\*" "%STEAM%\\depotcache\\" /E /H /C /I /Y /Q >nul 2>&1',
        "",
        'echo    -> Configs',
        'xcopy "%BACKUP%\\stplug-in\\*" "%STEAM%\\config\\stplug-in\\" /E /H /C /I /Y /Q >nul 2>&1',
        "",
        "echo  [4/4] Finalizando...",
        f'echo 1 > "{flag_file}"',
        f'start "" "{steam_exe}"',
        "",
        '(goto) 2>nul & del "%~f0"'
    ]

    try:
        with open(temp_bat, "w") as f:
            f.write("\n".join(bat_content))
        
        print("[Steam Toolkit MRM] Executing BAT via os.startfile...")
        os.startfile(temp_bat)
        
    except Exception as e:
        print(f"[Steam Toolkit MRM] ERRO AO LANÇAR BAT: {e}")

def start_server():
    server_address = ('127.0.0.1', SERVER_PORT)
    httpd = HTTPServer(server_address, backupSteamMRMRequestHandler)
    print(f"[Steam Toolkit MRM] API Server rodando na porta {SERVER_PORT}")
    httpd.serve_forever()