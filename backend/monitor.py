import os
import time
import shutil
import winreg
import threading
import json
from datetime import datetime
from config import BACKUP_ROOT, BACKUP_TARGETS
from ui import show_notification

def get_running_appid():
    try:
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam")
        val, _ = winreg.QueryValueEx(key, "RunningAppID")
        winreg.CloseKey(key)
        return int(val)
    except:
        return 0

def create_backup(trigger="auto"):
    """
    Cria um backup imediatamente.
    trigger: 'auto' (fechamento de jogo) ou 'manual' (usuário clicou no botão)
    """
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    folder_name = f"BackupSteamMRM-{timestamp}"
    
    # Reload config to get latest path
    import config
    config.reload_config()
    dest_folder = os.path.join(config.BACKUP_ROOT, folder_name)
    
    success_count = 0
    print(f"[Steam Toolkit MRM] Iniciando backup ({trigger}) em: {dest_folder}")

    for target in BACKUP_TARGETS:
        src = target["src"]
        dst = os.path.join(dest_folder, target["name"])
        
        try:
            if os.path.exists(src):
                if os.path.isdir(src):
                    shutil.copytree(src, dst, dirs_exist_ok=True)
                else:
                    os.makedirs(os.path.dirname(dst), exist_ok=True)
                    shutil.copy2(src, dst)
                
                success_count += 1
            else:
                print(f"[Steam Toolkit MRM] ALERTA: Pasta não encontrada: {src}")
        except Exception as e:
            print(f"[Steam Toolkit MRM] Erro ao copiar {target['name']}: {e}")

    if success_count > 0:
        # Salvar metadados iniciais
        try:
            with open(os.path.join(dest_folder, "meta.json"), "w") as f:
                json.dump({"trigger": trigger, "timestamp": timestamp, "pinned": False, "custom_name": None}, f)
        except: pass

        msg = "Backup realizado com sucesso." if trigger == "manual" else "Backup automático realizado."
        show_notification("Steam Toolkit MRM", msg)
        
        # Auto-Cleanup: Limite Dinâmico
        # Pule se o backup foi manual? Geralmente sim, ou mantém a regra global.
        # O usuário pediu "Aquiles que não seriam deletados automaticamente", implicando "Pin".
        # Vamos rodar o cleanup mas respeitando o PIN (implementado aqui).
        perform_cleanup()
    
    return True

def perform_cleanup():
    try:
        settings_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "settings.json")
        limit = 5
        if os.path.exists(settings_path):
            with open(settings_path, "r") as f:
                limit = json.load(f).get("backup_limit", 5)

        import config
        config.reload_config()
        root = config.BACKUP_ROOT
        
        if not os.path.exists(root): return

        backups = []
        for d in os.listdir(root):
            path = os.path.join(root, d)
            if os.path.isdir(path) and d.startswith("BackupSteamMRM-"):
                # Check pinned status
                is_pinned = False
                meta_file = os.path.join(path, "meta.json")
                if os.path.exists(meta_file):
                    try:
                        with open(meta_file, "r") as mf:
                            if json.load(mf).get("pinned", False): is_pinned = True
                    except: pass
                
                if not is_pinned:
                    backups.append(path)

        if len(backups) > limit:
            # Ordenar por data de criação (mais antigos primeiro)
            backups.sort(key=os.path.getctime)
            
            while len(backups) > limit:
                oldest_backup = backups.pop(0)
                print(f"[Steam Toolkit MRM] Auto-Cleanup: Removendo backup antigo {oldest_backup}")
                shutil.rmtree(oldest_backup)
    except Exception as e:
        print(f"[Steam Toolkit MRM] Erro no Auto-Cleanup: {e}")

class BackupManager(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        self.running = True
        self.last_appid = 0
        self.was_running = False

    def stop(self):
        self.running = False

    def run(self):
        print("[Steam Toolkit MRM] Monitor ativo.")
        while self.running:
            current_appid = get_running_appid()

            if self.was_running and current_appid == 0:
                print("[Steam Toolkit MRM] Jogo fechado. Iniciando protocolo de backup...")
                time.sleep(5) 
                create_backup(trigger="auto")
                self.was_running = False
            
            elif current_appid > 0:
                self.was_running = True
                self.last_appid = current_appid

            time.sleep(2)