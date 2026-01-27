import os
import time
import shutil
import winreg
import threading
import json
from datetime import datetime
from config import BACKUP_ROOT, BACKUP_TARGETS
from ui import show_notification

class BackupManager(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        self.running = True
        self.last_appid = 0
        self.was_running = False

    def get_running_appid(self):
        try:
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam")
            val, _ = winreg.QueryValueEx(key, "RunningAppID")
            winreg.CloseKey(key)
            return int(val)
        except:
            return 0

    def perform_backup(self, appid):
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        folder_name = f"BackupSteamMRM-{timestamp}"
        dest_folder = os.path.join(BACKUP_ROOT, folder_name)
        
        success_count = 0
        print(f"[backup SteamMRM] Iniciando backup em: {dest_folder}")

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
                    print(f"[backup SteamMRM] ALERTA: Pasta não encontrada: {src}")
            except Exception as e:
                print(f"[backup SteamMRM] Erro ao copiar {target['name']}: {e}")

        if success_count > 0:
            show_notification("Backup SteamMRM", f"Backup SteamMRM realizado com sucesso.")
            
            # Auto-Cleanup: Limite Dinâmico
            try:
                settings_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "settings.json")
                limit = 5
                if os.path.exists(settings_path):
                    with open(settings_path, "r") as f:
                        limit = json.load(f).get("backup_limit", 5)

                backups = [os.path.join(BACKUP_ROOT, d) for d in os.listdir(BACKUP_ROOT) 
                          if os.path.isdir(os.path.join(BACKUP_ROOT, d)) and d.startswith("BackupSteamMRM-")]
                
                if len(backups) > limit:
                    # Ordenar por data de criação (mais antigos primeiro)
                    backups.sort(key=os.path.getctime)
                    
                    while len(backups) > limit:
                        oldest_backup = backups.pop(0)
                        print(f"[backup SteamMRM] Auto-Cleanup: Removendo backup antigo {oldest_backup}")
                        shutil.rmtree(oldest_backup)
            except Exception as e:
                print(f"[backup SteamMRM] Erro no Auto-Cleanup: {e}")

    def stop(self):
        self.running = False

    def run(self):
        print("[backup SteamMRM] Monitor ativo.")
        while self.running:
            current_appid = self.get_running_appid()

            if self.was_running and current_appid == 0:
                print("[Backup SteamMRM] Jogo fechado. Iniciando protocolo de backup...")
                time.sleep(5) 
                self.perform_backup(self.last_appid)
                self.was_running = False
            
            elif current_appid > 0:
                self.was_running = True
                self.last_appid = current_appid

            time.sleep(2)