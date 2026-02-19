# Backup SteamMRM v5.0.1
import os
import sys
import threading

# 1. Tenta carregar o Millennium e envia o sinal de pronto IMEDIATAMENTE
try:
    import Millennium
    Millennium.ready()
except:
    try:
        import millennium as Millennium
        Millennium.ready()
    except:
        pass

# 2. Injeta o UI (Rápido)
def _load():
    try:
        root = os.path.dirname(os.path.abspath(__file__))
        js_path = os.path.join(root, "public", "index.js")
        if os.path.exists(js_path):
            import Millennium
            Millennium.add_browser_js(js_path)
    except:
        pass
    
    # 3. Se a lógica existir, inicia em thread separada muito depois
    threading.Thread(target=start_backend_deferred, daemon=True).start()

def start_backend_deferred():
    import time
    time.sleep(2) # Espera a Steam estabilizar
    try:
        root = os.path.dirname(os.path.abspath(__file__))
        backend_path = os.path.join(root, "backend")
        if backend_path not in sys.path:
            sys.path.append(backend_path)
        
        # Só importa a lógica agora
        from logic import backend_logic
        if backend_logic:
            backend_logic.start_background_tasks()
    except:
        pass

def _unload():
    try:
        from logic import backend_logic
        if backend_logic:
            backend_logic.stop()
    except:
        pass
