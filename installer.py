"""
Backup SteamMRM v5 — Professional Installer
Builds with: pyinstaller --onefile --windowed --name "Install_Backup_SteamMRM" --add-data "backend;backend" --add-data "public;public" --add-data "ludusavi;ludusavi" --add-data "main.py;." --add-data "plugin.json;." --add-data "settings.json;." installer.py
"""
import os
import sys
import winreg
import shutil
import subprocess
import threading
import time
import tkinter as tk
from tkinter import filedialog, ttk

# ─── CONSTANTS ───────────────────────────────────────────────────────
APP_NAME = "Backup SteamMRM"
VERSION  = "v5.0.1"
PLUGIN_FOLDER = "Backup SteamMRM"
ASSETS = ['backend', 'public', 'ludusavi', 'main.py', 'plugin.json', 'settings.json']

# ─── COLOURS ─────────────────────────────────────────────────────────
BG        = "#0e0e12"
BG_CARD   = "#18181f"
BG_INPUT  = "#1e1e28"
FG        = "#e2e2ea"
FG_DIM    = "#6b6b80"
ACCENT    = "#8b5cf6"
ACCENT_H  = "#a78bfa"
SUCCESS   = "#22c55e"
ERROR     = "#ef4444"
BORDER    = "#2a2a3a"

# ─── UTILS ───────────────────────────────────────────────────────────
def resource_path(relative_path):
    try:
        base = sys._MEIPASS
    except AttributeError:
        base = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base, relative_path)

def detect_steam_path_safe():
    """Try to auto-detect Steam path safely."""
    detected = ""
    try:
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam")
        path, _ = winreg.QueryValueEx(key, "SteamPath")
        winreg.CloseKey(key)
        path = path.replace("/", "\\")
        if os.path.exists(os.path.join(path, "steam.exe")):
            detected = path
    except Exception:
        pass

    if not detected:
        # Common fallback paths
        for fallback in [
            r"C:\Program Files (x86)\Steam",
            r"C:\Program Files\Steam",
            r"D:\Steam",
            r"D:\Program Files (x86)\Steam",
            r"E:\Steam",
        ]:
            if os.path.exists(os.path.join(fallback, "steam.exe")):
                detected = fallback
                break
    return detected

def is_steam_running():
    try:
        # Prevent console window flashing
        startupinfo = subprocess.STARTUPINFO()
        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        
        out = subprocess.check_output(
            'tasklist /FI "IMAGENAME eq steam.exe"', 
            shell=True, 
            startupinfo=startupinfo,
            stderr=subprocess.DEVNULL
        ).decode('latin-1', errors='ignore')
        return "steam.exe" in out.lower()
    except Exception:
        return False


# ═══════════════════════════════════════════════════════════════════
#  GUI
# ═══════════════════════════════════════════════════════════════════

class InstallerApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title(f"Instalar {APP_NAME} {VERSION}")
        self.configure(bg=BG)
        self.resizable(False, True)

        # Centre on screen
        w, h = 580, 640
        x = (self.winfo_screenwidth()  - w) // 2
        y = (self.winfo_screenheight() - h) // 2
        self.geometry(f"{w}x{h}+{x}+{y}")

        # Loading state
        self.loading_label = tk.Label(self, text="A carregar...", font=("Segoe UI", 12), bg=BG, fg=FG_DIM)
        self.loading_label.pack(expand=True)
        
        # Schedule UI build to allow window to show first
        self.after(100, self._init_app)

    def _init_app(self):
        self.loading_label.destroy()
        self._build_ui()
        
        # Async detection
        threading.Thread(target=self._async_detect, daemon=True).start()

    def _async_detect(self):
        try:
            detected = detect_steam_path_safe()
            if detected:
                # Thread-safe update
                self.after(0, lambda: self._set_path(detected))
        except:
            pass

    def _set_path(self, path):
        self.path_var.set(path)
        self._log(f"Steam detectada automaticamente: {path}", FG_DIM)

    # ── Build ────────────────────────────────────────────────────
    def _build_ui(self):
        # ── Bottom bar (Packed FIRST to ensure visibility) ────────
        bottom = tk.Frame(self, bg=BG)
        bottom.pack(side="bottom", fill="x", padx=32, pady=(20, 32))

        self.install_btn = tk.Button(bottom, text="⬇  Instalar", font=("Segoe UI", 11, "bold"),
                                     bg=ACCENT, fg="#fff", relief="flat", cursor="hand2",
                                     activebackground=ACCENT_H, activeforeground="#fff",
                                     highlightthickness=0, padx=32, pady=10,
                                     command=self._start_install)
        self.install_btn.pack(side="right")

        self.cancel_btn = tk.Button(bottom, text="Cancelar", font=("Segoe UI", 10),
                                    bg=BG_CARD, fg=FG_DIM, relief="flat", cursor="hand2",
                                    activebackground=BG_INPUT, activeforeground=FG,
                                    highlightthickness=0, padx=20, pady=9,
                                    command=self.destroy)
        self.cancel_btn.pack(side="right", padx=(0, 12))

        # ── Header ────────────────────────────────────────────────
        header = tk.Frame(self, bg=BG)
        header.pack(side="top", fill="x", padx=32, pady=(28, 0))

        tk.Label(header, text="💜", font=("Segoe UI Emoji", 32), bg=BG, fg=FG).pack(side="left")
        title_box = tk.Frame(header, bg=BG)
        title_box.pack(side="left", padx=(16, 0))
        tk.Label(title_box, text=APP_NAME, font=("Segoe UI", 20, "bold"), bg=BG, fg=FG).pack(anchor="w")
        tk.Label(title_box, text=f"Instalador {VERSION}", font=("Segoe UI", 11), bg=BG, fg=FG_DIM).pack(anchor="w")

        # ── Separator ─────────────────────────────────────────────
        tk.Frame(self, height=1, bg=BORDER).pack(fill="x", padx=32, pady=(20, 20))

        # ── Path section ──────────────────────────────────────────
        path_frame = tk.Frame(self, bg=BG)
        path_frame.pack(fill="x", padx=32)

        tk.Label(path_frame, text="📁  Pasta da Steam", font=("Segoe UI", 12, "bold"), bg=BG, fg=FG).pack(anchor="w")
        tk.Label(path_frame, text="Selecione a pasta raiz onde a Steam está instalada (onde fica o steam.exe).",
                 font=("Segoe UI", 9), bg=BG, fg=FG_DIM, wraplength=500, justify="left").pack(anchor="w", pady=(4, 10))

        input_row = tk.Frame(path_frame, bg=BG)
        input_row.pack(fill="x")

        self.path_var = tk.StringVar()
        self.path_entry = tk.Entry(input_row, textvariable=self.path_var,
                                   font=("Segoe UI", 10), bg=BG_INPUT, fg=FG,
                                   insertbackground=FG, relief="flat",
                                   highlightthickness=1, highlightbackground=BORDER,
                                   highlightcolor=ACCENT)
        self.path_entry.pack(side="left", fill="x", expand=True, ipady=8, padx=(0, 10))

        browse_btn = tk.Button(input_row, text="Procurar...", font=("Segoe UI", 9, "bold"),
                               bg=BG_CARD, fg=FG, relief="flat", cursor="hand2",
                               activebackground=ACCENT, activeforeground="#fff",
                               highlightthickness=0, padx=16, pady=7,
                               command=self._browse)
        browse_btn.pack(side="left")

        # Validation hint
        self.hint_label = tk.Label(path_frame, text="", font=("Segoe UI", 9), bg=BG, fg=FG_DIM)
        self.hint_label.pack(anchor="w", pady=(6, 0))
        self.path_var.trace_add("write", self._on_path_change)

        # ── Progress bar (Moved up) ──────────────────────────────
        # Put progress bar below path section, before log
        progress_frame = tk.Frame(self, bg=BG)
        progress_frame.pack(fill="x", padx=32, pady=(16, 0))
        
        self.progress_var = tk.DoubleVar()
        style = ttk.Style()
        style.theme_use('default')
        style.configure("Custom.Horizontal.TProgressbar", thickness=6, background=ACCENT, troughcolor=BORDER, borderwidth=0)
        
        self.progress = ttk.Progressbar(progress_frame, style="Custom.Horizontal.TProgressbar", 
                                        variable=self.progress_var, maximum=100)
        self.progress.pack(fill="x")

        # ── Log area ──────────────────────────────────────────────
        tk.Frame(self, height=1, bg=BORDER).pack(fill="x", padx=32, pady=(16, 12))
        
        log_header = tk.Frame(self, bg=BG)
        log_header.pack(fill="x", padx=32)
        tk.Label(log_header, text="📋  Progresso", font=("Segoe UI", 12, "bold"), bg=BG, fg=FG).pack(side="left")

        log_frame = tk.Frame(self, bg=BG_CARD, highlightthickness=1,
                             highlightbackground=BORDER, highlightcolor=BORDER)
        # Pack with expand=True to taking remaining space
        log_frame.pack(fill="both", expand=True, padx=32, pady=(10, 20))

        self.log_text = tk.Text(log_frame, bg=BG_CARD, fg=FG_DIM, font=("Consolas", 9),
                                relief="flat", state="disabled", wrap="word",
                                highlightthickness=0, padx=12, pady=10)
        self.log_text.pack(fill="both", expand=True)
        self.log_text.tag_config("accent", foreground=ACCENT)
        self.log_text.tag_config("success", foreground=SUCCESS)
        self.log_text.tag_config("error", foreground=ERROR)
        self.log_text.tag_config("dim", foreground=FG_DIM)
        self.log_text.tag_config("normal", foreground=FG)

        self._log("Pronto. Selecione a pasta da Steam e clique em Instalar.", FG_DIM)

    # ── Helpers ──────────────────────────────────────────────────
    def _browse(self):
        folder = filedialog.askdirectory(title="Selecione a pasta raiz da Steam")
        if folder:
            self.path_var.set(folder)

    def _on_path_change(self, *_):
        path = self.path_var.get().strip()
        if not path:
            self.hint_label.config(text="", fg=FG_DIM)
        elif os.path.exists(os.path.join(path, "steam.exe")):
            self.hint_label.config(text="✅  steam.exe encontrado!", fg=SUCCESS)
        else:
            self.hint_label.config(text="⚠  steam.exe não encontrado nesta pasta.", fg=ERROR)

    def _log(self, text, color=None):
        self.log_text.config(state="normal")
        tag = None
        if color == ACCENT:    tag = "accent"
        elif color == SUCCESS: tag = "success"
        elif color == ERROR:   tag = "error"
        elif color == FG_DIM:  tag = "dim"
        else:                  tag = "normal"
        self.log_text.insert("end", text + "\n", tag)
        self.log_text.see("end")
        self.log_text.config(state="disabled")

    def _set_buttons(self, enabled):
        state = "normal" if enabled else "disabled"
        self.install_btn.config(state=state)
        self.path_entry.config(state="normal" if enabled else "readonly")

    # ── Install logic ────────────────────────────────────────────
    def _start_install(self):
        steam_path = self.path_var.get().strip()
        if not steam_path:
            self._log("❌ Selecione a pasta da Steam primeiro.", ERROR)
            return
        if not os.path.exists(os.path.join(steam_path, "steam.exe")):
            self._log("❌ steam.exe não encontrado nesta pasta. Selecione a pasta correta.", ERROR)
            return

        self._set_buttons(False)
        threading.Thread(target=self._do_install, args=(steam_path,), daemon=True).start()

    def _do_install(self, steam_path):
        try:
            plugin_dir = os.path.join(steam_path, "plugins", PLUGIN_FOLDER)
            
            # Helper to run updates on main thread
            def safe_log(msg, color=None):
                self.after(0, lambda: self._log(msg, color))
            
            def safe_progress(val):
                self.after(0, lambda: self.progress_var.set(val))

            # Step 1: Stop Steam
            safe_log("\n▸ Verificando Steam...", ACCENT)
            safe_progress(5)
            
            if is_steam_running():
                safe_log("▸ Fechando a Steam...", ACCENT)
                safe_progress(10)
                
                # Use subprocess run safely
                subprocess.run('taskkill /F /IM steam.exe', shell=True, capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW)
                time.sleep(3)
                safe_log("   Steam fechada.", FG_DIM)
            else:
                safe_log("   Steam não estava em execução.", FG_DIM)

            # Step 2: Remove old version
            safe_log("\n▸ Preparando pasta do plugin...", ACCENT)
            safe_progress(20)
            
            if os.path.exists(plugin_dir):
                shutil.rmtree(plugin_dir)
                safe_log("   Versão anterior removida.", FG_DIM)
            os.makedirs(plugin_dir, exist_ok=True)

            # Step 3: Copy assets
            safe_log("\n▸ Copiando ficheiros...", ACCENT)
            safe_progress(30)
            
            total = len(ASSETS)
            for i, asset in enumerate(ASSETS):
                src = resource_path(asset)
                dst = os.path.join(plugin_dir, asset)
                
                if not os.path.exists(src):
                    safe_log(f"   ⚠ '{asset}' não encontrado (ignorado).", ERROR)
                    continue
                    
                if os.path.isdir(src):
                    shutil.copytree(src, dst)
                else:
                    shutil.copy2(src, dst)
                    
                pct = 30 + int(((i + 1) / total) * 50)
                safe_log(f"   ✓ {asset}", SUCCESS)
                safe_progress(pct)

            # Step 4: Verify installation
            safe_log("\n▸ Verificando instalação...", ACCENT)
            safe_progress(85)
            
            critical = ['main.py', 'plugin.json']
            all_ok = True
            for f in critical:
                if not os.path.exists(os.path.join(plugin_dir, f)):
                    safe_log(f"   ❌ {f} não foi copiado!", ERROR)
                    all_ok = False

            if not all_ok:
                safe_log("\n❌ A instalação pode estar incompleta.", ERROR)
                self.after(0, lambda: self._set_buttons(True))
                return

            safe_log("   Todos os ficheiros verificados. ✓", FG_DIM)

            # Step 5: Restart Steam
            safe_log("\n▸ Reiniciando Steam...", ACCENT)
            safe_progress(95)
            
            steam_exe = os.path.join(steam_path, "steam.exe")
            if os.path.exists(steam_exe):
                subprocess.Popen([steam_exe], start_new_session=True)
                safe_log("   Steam reiniciada.", FG_DIM)

            # Done!
            safe_progress(100)
            safe_log("")
            safe_log(f"🎉 {APP_NAME} {VERSION} instalado com sucesso!", SUCCESS)
            safe_log(f"   Local: {plugin_dir}", FG_DIM)

            self.after(0, lambda: self._finish_ui())

        except Exception as e:
            self.after(0, lambda: self._log(f"\n❌ Erro durante a instalação: {e}", ERROR))
            self.after(0, lambda: self._set_buttons(True))

    def _finish_ui(self):
        self.install_btn.config(text="✓  Concluído", bg=SUCCESS, state="disabled")
        self.cancel_btn.config(text="Fechar", command=self.destroy)


# ═══════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    app = InstallerApp()
    app.mainloop()
