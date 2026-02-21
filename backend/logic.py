import os
import threading
import sys
import traceback

# Tentativa de importação flexível
try:
    import Millennium
except ImportError:
    import millennium as Millennium

# Configuração de Log para arquivo
def log(msg):
    try:
        # Tenta gravar na pasta backend
        root = os.path.dirname(os.path.abspath(__file__))
        with open(os.path.join(root, "backup_steam_debug.log"), "a", encoding="utf-8") as f:
            f.write(f"[{threading.current_thread().name}] {msg}\n")
        print(f"[Steam Toolkit MRM] {msg}")
    except:
        pass

class PluginLogic:
    def __init__(self):
        self.monitor = None

    def start_background_tasks(self):
        log("Iniciando tarefas em segundo plano...")
        try:
            # Importações dentro da thread para garantir que o path já esteja setado
            from monitor import BackupManager
            from server import start_server

            log("Encontrando raiz do plugin...")
            def find_plugin_root():
                current = os.path.abspath(__file__)
                for _ in range(4):
                    current = os.path.dirname(current)
                    if os.path.exists(os.path.join(current, "plugin.json")):
                        return current
                return os.path.dirname(os.path.abspath(__file__))

            # O Javascript agora é injetado pelo main.py raiz para ser mais confiável
            
            log("Iniciando Monitor...")
            self.monitor = BackupManager()
            self.monitor.start()

            log("Iniciando Servidor API...")
            self.server_thread = threading.Thread(target=start_server, daemon=True)
            self.server_thread.start()
            
            log("Tarefas de segundo plano iniciadas.")

        except Exception as e:
            log(f"ERRO NAS TAREFAS DE FUNDO: {e}")
            log(traceback.format_exc())

    def stop(self):
        log("Parando monitor...")
        if self.monitor:
            self.monitor.stop()

# Instância da lógica
backend_logic = PluginLogic()
