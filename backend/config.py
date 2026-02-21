import os
import winreg

def get_steam_path():
    try:
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam")
        path, _ = winreg.QueryValueEx(key, "SteamPath")
        winreg.CloseKey(key)
        return path.replace("/", "\\")
    except Exception as e:
        print(f"[Steam Toolkit MRM] Erro ao buscar SteamPath no registro: {e}")
        # Fallback para pastas padrão comuns se o registro falhar
        paths = [
            r"C:\Program Files (x86)\Steam",
            r"C:\Program Files\Steam",
            os.path.join(os.environ.get("ProgramFiles(x86)", "C:\\Program Files (x86)"), "Steam")
        ]
        for p in paths:
            if os.path.exists(p):
                return p
        return os.getcwd()

STEAM_PATH = get_steam_path()
SETTINGS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "settings.json")
MILLENNIUM_PATH = os.path.join(STEAM_PATH, "millennium")

def get_backup_root():
    try:
        import json
        if os.path.exists(SETTINGS_FILE):
            with open(SETTINGS_FILE, "r") as f:
                settings = json.load(f)
                custom_path = settings.get("backup_path")
                if custom_path and os.path.exists(custom_path):
                    return custom_path
    except Exception as e:
        print(f"[Steam Toolkit MRM] Erro ao ler backup_path: {e}")
    
    # Default path
    path = os.path.join(MILLENNIUM_PATH, "backups")
    os.makedirs(path, exist_ok=True)
    return path

BACKUP_ROOT = get_backup_root()

def reload_config():
    global BACKUP_ROOT
    BACKUP_ROOT = get_backup_root()

BACKUP_TARGETS = [
    {"src": os.path.join(STEAM_PATH, "userdata"), "name": "userdata"},
    {"src": os.path.join(STEAM_PATH, "appcache", "stats"), "name": "appcache_stats"},
    {"src": os.path.join(STEAM_PATH, "depotcache"), "name": "depotcache"},
    {"src": os.path.join(STEAM_PATH, "config", "stplug-in"), "name": "stplug-in"}
]

UI_THEME = {
    "title": "Steam Toolkit MRM v5",
    "bg": "#101014",
    "accent": "#8b5cf6"
}

SERVER_PORT = 9999