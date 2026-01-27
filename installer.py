import os
import sys
import winreg
import shutil
import subprocess
import tkinter as tk
from tkinter import filedialog, messagebox
import time

def get_resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)

def get_steam_path_from_registry():
    try:
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam")
        path, _ = winreg.QueryValueEx(key, "SteamPath")
        winreg.CloseKey(key)
        return path.replace("/", "\\")
    except Exception:
        return None

def is_steam_running():
    try:
        output = subprocess.check_output('tasklist /FI "IMAGENAME eq steam.exe"', shell=True).decode('latin-1')
        return "steam.exe" in output.lower()
    except:
        return False

def stop_steam():
    if is_steam_running():
        print("[*] Fechando a Steam para liberar arquivos...")
        subprocess.run('taskkill /F /IM steam.exe', shell=True, capture_output=True)
        time.sleep(2)

def start_steam(steam_path):
    steam_exe = os.path.join(steam_path, "steam.exe")
    if os.path.exists(steam_exe):
        print("[*] Reiniciando a Steam...")
        subprocess.Popen([steam_exe], start_new_session=True)

def install():
    # Hide root window
    root = tk.Tk()
    root.withdraw()

    print("============================================")
    print("   Instalador Backup SteamMRM (Offline)")
    print("============================================\n")

    steam_path = get_steam_path_from_registry()
    
    if not steam_path or not os.path.exists(os.path.join(steam_path, "steam.exe")):
        messagebox.showinfo("Instalador", "Não foi possível detectar a pasta da Steam automaticamente. Por favor, selecione a pasta raiz da Steam (onde fica o steam.exe).")
        steam_path = filedialog.askdirectory(title="Selecione a pasta raiz da Steam")
        
    if not steam_path:
        print("Instalação cancelada.")
        return

    if not os.path.exists(os.path.join(steam_path, "steam.exe")):
        messagebox.showerror("Erro", f"O arquivo steam.exe não foi encontrado em: {steam_path}\nInstalação abortada.")
        return

    plugin_dir = os.path.join(steam_path, "plugins", "backup SteamMRM")
    
    try:
        stop_steam()

        if os.path.exists(plugin_dir):
            print("[*] Removendo versão antiga...")
            shutil.rmtree(plugin_dir)

        os.makedirs(plugin_dir, exist_ok=True)

        # List of assets to copy
        assets = ['backend', 'public', 'ludusavi', 'main.py', 'plugin.json', 'settings.json']
        
        for asset in assets:
            src = get_resource_path(asset)
            if not os.path.exists(src):
                print(f"[!] Aviso: Asset '{asset}' não encontrado no pacote.")
                continue
                
            dst = os.path.join(plugin_dir, asset)
            if os.path.isdir(src):
                shutil.copytree(src, dst)
            else:
                shutil.copy2(src, dst)
            print(f"[*] Copiado: {asset}")

        print("\n============================================")
        print("   backup SteamMRM INSTALADO COM SUCESSO! 💜")
        print("============================================")
        
        messagebox.showinfo("Sucesso", "Backup SteamMRM instalado com sucesso!\nA Steam será reiniciada.")
        
        start_steam(steam_path)

    except Exception as e:
        messagebox.showerror("Erro Crítico", f"Ocorreu um erro durante a instalação:\n{str(e)}")
        print(f"\nERRO: {e}")

if __name__ == "__main__":
    install()
