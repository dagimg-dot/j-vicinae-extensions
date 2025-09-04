# J-Vicinae Extensions

A monorepo containing various extensions for [Vicinae](https://github.com/vicinaehq/vicinae)

## Extensions

### 1. Power Menu
Essential power commands at your fingertips! Provides quick access to system power management functions.

### 2. GNOME Settings
Access GNOME Control Center settings panels for easy access.

### 3. Floww
Access [Floww CLI](https://github.com/dagimg-dot/floww) commands for easy access.

## Structure

```
j-vicinae-extensions/
├── extensions/
│   └── power-menu/          # Power management extension
|   └── gnome-settings/      # GNOME settings extension
|   └── floww/               # Floww CLI extension
├── package.json             # Root package.json with workspace config
├── pnpm-workspace.yaml      # pnpm workspace configuration
├── tsconfig.json           # Root TypeScript configuration
└── README.md               # This file
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd j-vicinae-extensions
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

#### Working with All Extensions
- **Build all extensions**: `pnpm build`
- **Lint and format**: `pnpm check` (check only) or `pnpm check:fix` (auto-fix)
- **Format only**: `pnpm format` (check only) or `pnpm format:fix` (auto-fix)
- **Lint only**: `pnpm lint` (check only) or `pnpm lint:fix` (auto-fix)

**Examples:**
```bash
pnpm --filter power-menu build
```

### Individual Extension Development

#### Using pnpm --filter (Recommended)
Stay in the root directory and use pnpm's built-in filtering:

```bash
# Build a specific extension
pnpm --filter power-menu build

# Start development mode for a specific extension
pnpm --filter power-menu dev

# Check and fix code quality
pnpm run check:fix
```