import os
import json
import threading
import urllib.parse
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from config import BACKUP_ROOT, SERVER_PORT, STEAM_PATH

SETTINGS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "settings.json")

def load_settings():
    try:
        with open(SETTINGS_FILE, "r") as f: return json.load(f)
    except: return {"backup_limit": 5}

def save_settings(data):
    try:
        with open(SETTINGS_FILE, "w") as f: json.dump(data, f, indent=4)
    except Exception as e: print(f"[backup SteamMRM] Error saving settings: {e}")

class backupSteamMRMRequestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With")
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
                    backups = [d for d in os.listdir(BACKUP_ROOT) if os.path.isdir(os.path.join(BACKUP_ROOT, d)) and d.startswith("BackupSteamMRM")]
                    backups.sort()
                except: pass
            
            self.wfile.write(json.dumps(backups).encode())

        elif self.path == '/settings':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(load_settings()).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path.startswith('/restore/'):
            backup_name = self.path.replace('/restore/', '')
            backup_name = urllib.parse.unquote(backup_name)
            
            print(f"[Backup SteamMRM] COMANDO RECEBIDO: Restaurar {backup_name}")
            
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'{"status": "accepted"}')

            threading.Thread(target=trigger_external_restore, args=(backup_name,), daemon=True).start()

        elif self.path.startswith('/delete/'):
            import shutil
            backup_name = self.path.replace('/delete/', '')
            backup_name = urllib.parse.unquote(backup_name)
            
            print(f"[backup SteamMRM] COMANDO RECEBIDO: Apagar {backup_name}")
            backup_path = os.path.join(BACKUP_ROOT, backup_name)
            
            try:
                if os.path.exists(backup_path) and backup_name.startswith("BackupSteamMRM-"):
                    shutil.rmtree(backup_path)
                    print(f"[backup SteamMRM] Backup {backup_name} apagado com sucesso.")
                    self.send_response(200)
                else:
                    self.send_response(404)
            except Exception as e:
                print(f"[backup SteamMRM] Erro ao apagar backup: {e}")
                self.send_response(500)
            
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'{"status": "done"}')

        elif self.path == '/settings/update':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                new_data = json.loads(post_data.decode('utf-8'))
                current = load_settings()
                current.update(new_data)
                save_settings(current)
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(b'{"status": "saved"}')
            except Exception as e:
                self.send_response(400)
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
                    print(f"[backup SteamMRM] Abrindo Ludusavi em: {ludu_exe}")
                    subprocess.Popen([ludu_exe], creationflags=0x00000008) # DETACHED_PROCESS
                    self.wfile.write(b'{"status": "ok"}')
                else:
                    print(f"[backup SteamMRM] ERRO: Ludusavi nao encontrado em {ludu_exe}")
                    self.wfile.write(b'{"status": "not_found"}')
            except Exception as e:
                print(f"[backup SteamMRM] Erro ao abrir Ludusavi: {e}")
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode())

    def log_message(self, format, *args): return

def trigger_external_restore(backup_folder_name):
    backup_src = os.path.join(BACKUP_ROOT, backup_folder_name)
    steam_exe = os.path.join(STEAM_PATH, "steam.exe")
    temp_bat = os.path.join(os.environ["TEMP"], "caly_restore.bat")
    flag_file = os.path.join(BACKUP_ROOT, "restore_success.flag")

    print(f"[backup SteamMRM] Gerando script AUTO-ELEVAVEL em: {temp_bat}")

    bat_content = [
        "@echo off",
        "title backup SteamMRM - Verificando Permissoes...",
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
        "title backup SteamMRM - RESTAURANDO...",
        "echo.",
        "echo  =========================================",
        "echo      backup SteamMRM - PROTOCOLO DE RESTAURO",
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
        
        print("[backup SteamMRM] Executing BAT via os.startfile...")
        os.startfile(temp_bat)
        
    except Exception as e:
        print(f"[backup SteamMRM] ERRO AO LANÇAR BAT: {e}")

def start_server():
    server_address = ('127.0.0.1', SERVER_PORT)
    httpd = HTTPServer(server_address, backupSteamMRMRequestHandler)
    print(f"[backup SteamMRM] API Server rodando na porta {SERVER_PORT}")
    httpd.serve_forever()