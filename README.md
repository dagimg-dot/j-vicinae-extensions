# J-Vicinae Extensions

A monorepo containing various extensions for [Vicinae](https://github.com/vicinaehq/vicinae)

## 🚀 Extensions

<div align="center">

| [<img src="extensions/power-menu/assets/power_menu.png" width="120" alt="Power Menu">](extensions/power-menu/) | [<img src="extensions/gnome-settings/assets/gnome_settings.png" width="120" alt="GNOME Settings">](extensions/gnome-settings/) | [<img src="extensions/floww/assets/floww.png" width="120" alt="Floww">](extensions/floww/) |
| :------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------: |
|                                                 **Power Menu**                                                 |                                                       **GNOME Settings**                                                       |                                         **Floww**                                          |
|                                  Essential power commands at your fingertips!                                  |                                          Lists and opens GNOME Control Center panels                                           |                        Manage and apply workflows across workspaces                        |

| [<img src="extensions/player-pilot/assets/player_pilot.png" width="120" alt="Player Pilot">](extensions/player-pilot/) |       |
| :--------------------------------------------------------------------------------------------------------------------: | :---: |
|                                                    **Player Pilot**                                                    |       |
|                                         Comprehensive media player controller                                          |       |

</div>

## 📋 Features Overview

### 🔋 Power Menu
- **8 Power Commands**: Power off, reboot, suspend, hibernate, logout, lock screen, UEFI boot, recovery mode
- **Customizable**: Configure lock and logout commands for different desktop environments
- **Quick Access**: Essential system controls at your fingertips

### ⚙️ GNOME Settings
- **Direct Access**: Open any GNOME Control Center panel directly
- **Organized**: Categorized settings for easy navigation
- **Searchable**: Find settings quickly with built-in search

### 🔄 Floww
- **Workflow Management**: List, search, and apply Floww workflows
- **Workspace Automation**: Streamline your development workflow
- **CLI Integration**: Seamless integration with Floww CLI

### 🎵 Player Pilot
- **Grid View**: See all media players in a clean, organized grid
- **Smart Filtering**: Filter players by name using preferences
- **Real-time Status**: Shows playing, paused, and stopped states
- **Rich Metadata**: Displays album art, song titles, artists, and albums
- **Individual Controls**: Play/pause, next, previous, and stop for each player

## 🛠️ Development

### Prerequisites
- Node.js 18+
- pnpm

### Installation
```bash
git clone <your-repo-url>
cd j-vicinae-extensions
pnpm install
```

### Commands
- **Build all**: `pnpm build`
- **Build specific**: `pnpm --filter <extension-name> build`
- **Dev mode**: `pnpm --filter <extension-name> dev`
- **Lint & format**: `pnpm check:fix`

### Structure
```
j-vicinae-extensions/
├── extensions/
│   ├── power-menu/          # Power management commands
│   ├── gnome-settings/      # GNOME Control Center access
│   ├── floww/               # Floww CLI integration
│   └── player-pilot/        # Media player controller
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

## 📝 License

MIT © dagimg-dot