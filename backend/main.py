import os
import threading
import sys
import traceback

# Tentativa de importação flexível
try:
    import Millennium
except ImportError:
    import millennium as Millennium

# Configuração de Log para arquivo para debugar erros invisíveis
def log(msg):
    try:
        root = os.path.dirname(os.path.abspath(__file__))
        with open(os.path.join(root, "caly_debug.log"), "a", encoding="utf-8") as f:
            f.write(f"[{threading.current_thread().name}] {msg}\n")
        print(f"[Steam Toolkit MRM] {msg}")
    except:
        pass

log("--- PLUGIN STARTUP ---")

class Plugin:
    def __init__(self):
        self.monitor = None

    def _load(self):
        log("Chamando Millennium.ready() imediatamente.")
        # Chamamos o ready() IMEDIATAMENTE. Se o plugin demorar ou falhar, o menu Millennium não trava.
        try:
            Millennium.ready()
        except Exception as e:
            log(f"Erro ao chamar ready(): {e}")

        # Rodamos o resto da inicialização em uma thread separada para não travar o loader da Steam
        threading.Thread(target=self.delayed_init, name="CalyInitThread", daemon=True).start()

    def delayed_init(self):
        log("Iniciando inicialização em segundo plano...")
        try:
            # Garante que o Python enxergue os outros arquivos da pasta backend
            backend_dir = os.path.dirname(os.path.realpath(__file__))
            if backend_dir not in sys.path:
                sys.path.append(backend_dir)

            from monitor import BackupManager
            from server import start_server
            import Millennium 

            def find_plugin_root():
                current = os.path.abspath(__file__)
                for _ in range(4):
                    current = os.path.dirname(current)
                    if os.path.exists(os.path.join(current, "plugin.json")):
                        return current
                return os.path.dirname(os.path.abspath(__file__))

            plugin_root = find_plugin_root()
            js_path = os.path.join(plugin_root, "public", "index.js")
            
            if os.path.exists(js_path):
                log(f"Injetando UI: {js_path}")
                Millennium.add_browser_js(js_path)
            else:
                log(f"ERRO: UI não encontrada em {js_path}")

            log("Iniciando Monitor...")
            self.monitor = BackupManager()
            self.monitor.start()

            log("Iniciando Servidor API...")
            self.server_thread = threading.Thread(target=start_server, daemon=True)
            self.server_thread.start()
            
            log("Inicialização concluída com sucesso.")

        except Exception as e:
            log(f"ERRO CRÍTICO NA INICIALIZAÇÃO: {e}")
            log(traceback.format_exc())

    def _unload(self):
        log("Descarregando plugin...")
        if self.monitor:
            self.monitor.stop()

# Nome padrão esperado pelo Millennium
plugin = Plugin()

# Hooks globais para redundância
def _load():
    plugin._load()

def _unload():
    plugin._unload()