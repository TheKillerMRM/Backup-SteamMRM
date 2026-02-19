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
from tkinter import filedialog

# ─── CONSTANTS ───────────────────────────────────────────────────────
APP_NAME = "Backup SteamMRM"
VERSION  = "v5.0.0"
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

def detect_steam_path():
    """Try to auto-detect Steam path from registry."""
    try:
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam")
        path, _ = winreg.QueryValueEx(key, "SteamPath")
        winreg.CloseKey(key)
        path = path.replace("/", "\\")
        if os.path.exists(os.path.join(path, "steam.exe")):
            return path
    except Exception:
        pass
    # Common fallback paths
    for fallback in [
        r"C:\Program Files (x86)\Steam",
        r"C:\Program Files\Steam",
        r"D:\Steam",
        r"D:\Program Files (x86)\Steam",
        r"E:\Steam",
    ]:
        if os.path.exists(os.path.join(fallback, "steam.exe")):
            return fallback
    return ""

def is_steam_running():
    try:
        out = subprocess.check_output('tasklist /FI "IMAGENAME eq steam.exe"', shell=True).decode('latin-1')
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
        self.resizable(False, False)

        # Centre on screen
        w, h = 560, 520
        x = (self.winfo_screenwidth()  - w) // 2
        y = (self.winfo_screenheight() - h) // 2
        self.geometry(f"{w}x{h}+{x}+{y}")

        self._build_ui()

        # Try to auto-detect
        detected = detect_steam_path()
        if detected:
            self.path_var.set(detected)
            self._log(f"Steam detectada automaticamente: {detected}", FG_DIM)

    # ── Build ────────────────────────────────────────────────────
    def _build_ui(self):
        # ── Header ────────────────────────────────────────────────
        header = tk.Frame(self, bg=BG)
        header.pack(fill="x", padx=28, pady=(28, 0))

        tk.Label(header, text="💜", font=("Segoe UI Emoji", 28), bg=BG, fg=FG).pack(side="left")
        title_box = tk.Frame(header, bg=BG)
        title_box.pack(side="left", padx=(12, 0))
        tk.Label(title_box, text=APP_NAME, font=("Segoe UI", 18, "bold"), bg=BG, fg=FG).pack(anchor="w")
        tk.Label(title_box, text=f"Instalador {VERSION}", font=("Segoe UI", 10), bg=BG, fg=FG_DIM).pack(anchor="w")

        # ── Separator ─────────────────────────────────────────────
        tk.Frame(self, height=1, bg=BORDER).pack(fill="x", padx=28, pady=(18, 18))

        # ── Path section ──────────────────────────────────────────
        path_frame = tk.Frame(self, bg=BG)
        path_frame.pack(fill="x", padx=28)

        tk.Label(path_frame, text="📁  Pasta da Steam", font=("Segoe UI", 11, "bold"), bg=BG, fg=FG).pack(anchor="w")
        tk.Label(path_frame, text="Selecione a pasta raiz onde a Steam está instalada (onde fica o steam.exe).",
                 font=("Segoe UI", 9), bg=BG, fg=FG_DIM, wraplength=500, justify="left").pack(anchor="w", pady=(2, 8))

        input_row = tk.Frame(path_frame, bg=BG)
        input_row.pack(fill="x")

        self.path_var = tk.StringVar()
        self.path_entry = tk.Entry(input_row, textvariable=self.path_var,
                                   font=("Segoe UI", 10), bg=BG_INPUT, fg=FG,
                                   insertbackground=FG, relief="flat",
                                   highlightthickness=1, highlightbackground=BORDER,
                                   highlightcolor=ACCENT)
        self.path_entry.pack(side="left", fill="x", expand=True, ipady=7)

        browse_btn = tk.Button(input_row, text="Procurar...", font=("Segoe UI", 9, "bold"),
                               bg=BG_CARD, fg=FG, relief="flat", cursor="hand2",
                               activebackground=ACCENT, activeforeground="#fff",
                               highlightthickness=0, padx=14, pady=6,
                               command=self._browse)
        browse_btn.pack(side="left", padx=(8, 0))

        # Validation hint
        self.hint_label = tk.Label(path_frame, text="", font=("Segoe UI", 9), bg=BG, fg=FG_DIM)
        self.hint_label.pack(anchor="w", pady=(4, 0))
        self.path_var.trace_add("write", self._on_path_change)

        # ── Log area ──────────────────────────────────────────────
        tk.Frame(self, height=1, bg=BORDER).pack(fill="x", padx=28, pady=(16, 12))
        tk.Label(self, text="📋  Progresso", font=("Segoe UI", 11, "bold"), bg=BG, fg=FG).pack(anchor="w", padx=28)

        log_frame = tk.Frame(self, bg=BG_CARD, highlightthickness=1,
                             highlightbackground=BORDER, highlightcolor=BORDER)
        log_frame.pack(fill="both", expand=True, padx=28, pady=(6, 0))

        self.log_text = tk.Text(log_frame, bg=BG_CARD, fg=FG_DIM, font=("Consolas", 9),
                                relief="flat", state="disabled", wrap="word",
                                highlightthickness=0, padx=10, pady=8)
        self.log_text.pack(fill="both", expand=True)
        self.log_text.tag_config("accent", foreground=ACCENT)
        self.log_text.tag_config("success", foreground=SUCCESS)
        self.log_text.tag_config("error", foreground=ERROR)
        self.log_text.tag_config("dim", foreground=FG_DIM)
        self.log_text.tag_config("normal", foreground=FG)

        self._log("Pronto. Selecione a pasta da Steam e clique em Instalar.", FG_DIM)

        # ── Progress bar ──────────────────────────────────────────
        self.progress_canvas = tk.Canvas(self, height=4, bg=BORDER, highlightthickness=0)
        self.progress_canvas.pack(fill="x", padx=28, pady=(8, 0))
        self.progress_rect = None

        # ── Bottom bar ────────────────────────────────────────────
        bottom = tk.Frame(self, bg=BG)
        bottom.pack(fill="x", padx=28, pady=(12, 20))

        self.install_btn = tk.Button(bottom, text="⬇  Instalar", font=("Segoe UI", 11, "bold"),
                                     bg=ACCENT, fg="#fff", relief="flat", cursor="hand2",
                                     activebackground=ACCENT_H, activeforeground="#fff",
                                     highlightthickness=0, padx=28, pady=9,
                                     command=self._start_install)
        self.install_btn.pack(side="right")

        self.cancel_btn = tk.Button(bottom, text="Cancelar", font=("Segoe UI", 10),
                                    bg=BG_CARD, fg=FG_DIM, relief="flat", cursor="hand2",
                                    activebackground=BG_INPUT, activeforeground=FG,
                                    highlightthickness=0, padx=18, pady=8,
                                    command=self.destroy)
        self.cancel_btn.pack(side="right", padx=(0, 8))

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

    def _set_progress(self, pct):
        self.progress_canvas.delete("all")
        w = self.progress_canvas.winfo_width()
        if w <= 1: w = 504  # fallback
        fill_w = int(w * (pct / 100))
        self.progress_canvas.create_rectangle(0, 0, fill_w, 4, fill=ACCENT, outline="")

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

            # Step 1: Stop Steam
            self._log_step("Verificando Steam...", 5)
            if is_steam_running():
                self._log_step("Fechando a Steam...", 10)
                subprocess.run('taskkill /F /IM steam.exe', shell=True, capture_output=True)
                time.sleep(2)
                self._log("   Steam fechada.", FG_DIM)
            else:
                self._log("   Steam não estava em execução.", FG_DIM)

            # Step 2: Remove old version
            self._log_step("Preparando pasta do plugin...", 20)
            if os.path.exists(plugin_dir):
                shutil.rmtree(plugin_dir)
                self._log("   Versão anterior removida.", FG_DIM)
            os.makedirs(plugin_dir, exist_ok=True)

            # Step 3: Copy assets
            self._log_step("Copiando ficheiros...", 30)
            total = len(ASSETS)
            for i, asset in enumerate(ASSETS):
                src = resource_path(asset)
                dst = os.path.join(plugin_dir, asset)
                if not os.path.exists(src):
                    self._log(f"   ⚠ '{asset}' não encontrado (ignorado).", ERROR)
                    continue
                if os.path.isdir(src):
                    shutil.copytree(src, dst)
                else:
                    shutil.copy2(src, dst)
                pct = 30 + int(((i + 1) / total) * 50)
                self._log(f"   ✓ {asset}", SUCCESS)
                self._update_progress(pct)

            # Step 4: Verify installation
            self._log_step("Verificando instalação...", 85)
            critical = ['main.py', 'plugin.json']
            all_ok = True
            for f in critical:
                if not os.path.exists(os.path.join(plugin_dir, f)):
                    self._log(f"   ❌ {f} não foi copiado!", ERROR)
                    all_ok = False

            if not all_ok:
                self._log("\n❌ A instalação pode estar incompleta.", ERROR)
                self._set_buttons_safe(True)
                return

            self._log("   Todos os ficheiros verificados. ✓", FG_DIM)

            # Step 5: Restart Steam
            self._log_step("Reiniciando Steam...", 95)
            steam_exe = os.path.join(steam_path, "steam.exe")
            if os.path.exists(steam_exe):
                subprocess.Popen([steam_exe], start_new_session=True)
                self._log("   Steam reiniciada.", FG_DIM)

            # Done!
            self._update_progress(100)
            self._log("")
            self._log(f"🎉 {APP_NAME} {VERSION} instalado com sucesso!", SUCCESS)
            self._log(f"   Local: {plugin_dir}", FG_DIM)

            # Change install button to close
            self.after(0, lambda: self._finish_ui())

        except Exception as e:
            self._log(f"\n❌ Erro durante a instalação: {e}", ERROR)
            self._set_buttons_safe(True)

    def _log_step(self, msg, pct):
        self._log(f"\n▸ {msg}", ACCENT)
        self._update_progress(pct)

    def _update_progress(self, pct):
        self.after(0, lambda: self._set_progress(pct))

    def _set_buttons_safe(self, enabled):
        self.after(0, lambda: self._set_buttons(enabled))

    def _finish_ui(self):
        self.install_btn.config(text="✓  Concluído", bg=SUCCESS, state="disabled")
        self.cancel_btn.config(text="Fechar", command=self.destroy)


# ═══════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    app = InstallerApp()
    app.mainloop()
