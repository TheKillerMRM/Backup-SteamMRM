<div align="center">

# 🟣 backup SteamMRM 🟣 


<p align="center">
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3BxdGp6Z3V4ZnV4ZnV4ZnV4ZnV4ZnV4ZnV4ZnV4ZnV4ZnV4eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LMcB8XjhG7ck/giphy.gif" width="100%" height="4" alt="divider">
</p>

<h3>Proteja seu legado. Viaje no tempo.</h3>

<p align="left">
O <strong>backup SteamMRM</strong> é um ecossistema de segurança para sua Steam. Ele monitora sua sessão de jogo em tempo real e, através da integração nativa com o potente motor do <strong>Ludusavi</strong>, permite backups individuais cirúrgicos de cada save. No momento em que você fecha um jogo, o protocolo <em>Recall</em> é ativado, criando um snapshot automático.
<br><br>
Precisa de um backup manual ou quer gerenciar saves específicos? Use o novo botão de acesso rápido para abrir a interface do Ludusavi diretamente pela Steam. E com o sistema de <strong>Restore</strong>, você reverte para qualquer ponto da história com apenas dois cliques.
</p>

</div>

---

## ⚡ Funcionalidades

| Recurso | Descrição |
| :--- | :--- |
| 🕵️ **Monitoramento Passivo** | Detecta automaticamente o encerramento de processos de jogos (AppID). Zero impacto na performance. |
| 🎮 **Integração Ludusavi** | Motor de backup de saves integrado. Acesse a interface completa com um botão dedicado. |
| 🎨 **Customização Visual** | Altere as cores da interface e o tema principal para combinar com seu setup. |
| 🌍 **Multi-idioma** | Suporte total para troca de idiomas (Português e Inglês). |
| 🔄 **Time Travel (Restore)** | Restaure backups antigos instantaneamente através de uma interface visual integrada. |
| 🧹 **Auto-Cleanup** | Mantenha o controle total: defina o número máximo de backups para gerenciar seu espaço. |
| 📦 **Backup Cirúrgico** | Salva apenas o que importa (userdata, stats, cache, configs), ignorando o "lixo" temporário. |
| 🔔 **Notificações Nativas** | Feedback visual discreto via Windows Toast ao concluir operações. |
| 🗃️ **Histórico Organizado** | Cria pastas timestamped para você voltar no tempo quando quiser. |

---

## 🕰️ Como usar o Restore

O backup SteamMRM agora possui uma interface visual dedicada. Veja como é simples voltar no tempo:

### 1. O Botão de Acesso
No canto inferior direito da sua Steam, procure pelo **Botão Roxo com Ícone de Relógio**. Ele é o seu portal para os backups.

<div align="center">
  <img src="https://i.imgur.com/gReSM17.png" alt="Botão backup SteamMRM" width="35%">
</div>

### 2. Escolha o Ponto de Restauração
Ao clicar, uma lista com todos os seus backups organizados por data irá aparecer. Basta selecionar o momento para o qual deseja voltar. Você também encontrará o botão **"Abrir o Ludusavi"** nesta tela.

<div align="center">
  <img src="https://i.imgur.com/3eMjHhO.png" alt="Menu de Restore e Ludusavi" width="60%">
</div>

### 3. Confirmação Visual
Pronto! O backup SteamMRM fará a substituição cirúrgica dos arquivos e te avisará quando estiver tudo seguro.

<div align="center">
  <img src="https://i.imgur.com/dD5YAs7.png" alt="Sucesso" width="50%">
</div>

---

## 🛡️ O Protocolo de Segurança (Backup Targets)

O **backup SteamMRM** foi configurado para "congelar" o estado das seguintes pastas críticas:

> **📂 1. Userdata (`/userdata`)**
> * Contém todos os seus saves locais, configurações de controle e preferências de nuvem.
>
> **📊 2. Estatísticas (`/appcache/stats`)**
> * Preserva os arquivos de métricas e estatísticas dos seus jogos.
>
> **📦 3. Depot Cache (`/depotcache`)**
> * Arquivos de manifesto e cache de download cruciais para a integridade dos jogos.
>
> **🔌 4. Configurações de Plugins (`/config/stplug-in`)**
> * Backup específico para configurações de plugins injetados na Steam.

---

## 🚀 Como Instalar

⚠️ **Pré-requisito:** Tenha o [Millennium](https://steambrew.app/) instalado.

### ⚡ Método Recomendado (Automático)
Instale em segundos sem precisar baixar arquivos manualmente.

1. Pressione a tecla `Windows` e digite **PowerShell**.
2. Clique com o botão direito no ícone e selecione **"Executar como Administrador"**.
3. Copie e cole o comando abaixo e aperte `Enter`:

```powershell
irm https://raw.githubusercontent.com/BruxinCore/backup SteamMRM/refs/heads/main/install.ps1 | iex

```

### 🛠️ Método Manual

1. Baixe a última versão do **backup SteamMRM**.
2. Extraia a pasta `backup SteamMRM` para dentro do diretório de plugins:

```bash
C:\Program Files (x86)\Steam\plugins\

```

*(Nota: Certifique-se de que a pasta se chama apenas `backup SteamMRM`)*

3. Reinicie a Steam.

---

## 📂 Onde ficam meus backups?

Todos os snapshots são armazenados localmente em:

```text
Steam/
└── millennium/
    └── backups/
        ├── BackupSteamMRM-2026-01-24_14-30-00/
        ├── BackupSteamMRM-2026-01-24_18-45-12/
        └── ...
```

---

## 🌎 README (English Summary)

**Backup SteamMRM** is a passive security plugin for Steam (via Millennium) that monitors your game sessions. 

### Key Features:
- **Auto Backup:** Triggers an instant snapshot of your save data and configs once a game is closed.
- **Visual Restore:** A dedicated UI within Steam to revert to any previous backup in two clicks.
- **Smart Targets:** Focuses on `userdata`, `stats`, `depotcache`, and plugin configurations.
- **Auto-Cleanup:** Automatically manages storage space by keeping only your most recent backups.

### How to Install:
Run the following in **PowerShell (Admin)**:
```powershell
irm https://raw.githubusercontent.com/BruxinCore/BackupSteamMRM/main/install.ps1 | iex
```

---

<div align="center">
  <p>Desenvolvido com ❤️ por TheKillerMRM</p>
</div>

---

## 🤝 Créditos e Inspirações

Este projeto foi possível graças ao trabalho incrível de outros desenvolvedores. Um agradecimento especial a:

- **[CalyRecall](https://github.com/BruxinCore/CalyRecall)** por [BruxinCore](https://github.com/BruxinCore) - Inspiração principal para o protocolo de backup e lógica de monitoramento.
- **[Ludusavi](https://github.com/mtkennerly/ludusavi)** por [mtkennerly](https://github.com/mtkennerly) - Pelo motor de backup de saves e suporte a múltiplos jogos que serviu de base tecnológica para este plugin.

*Obrigado por contribuírem para a comunidade open-source!*
