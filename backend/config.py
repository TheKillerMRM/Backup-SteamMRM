import os
import winreg

def get_steam_path():
    try:
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam")
        path, _ = winreg.QueryValueEx(key, "SteamPath")
        winreg.CloseKey(key)
        return path.replace("/", "\\")
    except Exception as e:
        print(f"[backup SteamMRM] Erro ao buscar SteamPath no registro: {e}")
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
MILLENNIUM_PATH = os.path.join(STEAM_PATH, "millennium") 
BACKUP_ROOT = os.path.join(MILLENNIUM_PATH, "backups")

# Garantir que a pasta de backup existe para evitar erros de IO
try:
    os.makedirs(BACKUP_ROOT, exist_ok=True)
except Exception as e:
    print(f"[backup SteamMRM] Erro ao criar BACKUP_ROOT: {e}")

BACKUP_TARGETS = [
    {"src": os.path.join(STEAM_PATH, "userdata"), "name": "userdata"},
    {"src": os.path.join(STEAM_PATH, "appcache", "stats"), "name": "appcache_stats"},
    {"src": os.path.join(STEAM_PATH, "depotcache"), "name": "depotcache"},
    {"src": os.path.join(STEAM_PATH, "config", "stplug-in"), "name": "stplug-in"}
]

UI_THEME = {
    "title": "Backup SteamMRM",
    "bg": "#101014",
    "accent": "#8b5cf6"
}

SERVER_PORT = 9999