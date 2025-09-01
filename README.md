# J-Vicinae Extensions

A monorepo containing various extensions for [Vicinae](https://github.com/vicinaehq/vicinae)

## Structure

```
j-vicinae-extensions/
├── extensions/
│   └── power-menu/          # Power management extension
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
- **Develop all extensions**: `pnpm dev`
- **Lint and format**: `pnpm check` (check only) or `pnpm check:fix` (auto-fix)
- **Format only**: `pnpm format` (check only) or `pnpm format:fix` (auto-fix)
- **Lint only**: `pnpm lint` (check only) or `pnpm lint:fix` (auto-fix)

#### Working with Specific Extensions
- **Build specific extension**: `pnpm --filter <extension-name> build`
- **Develop specific extension**: `pnpm --filter <extension-name> dev`
- **Check specific extension**: `biome check extensions/<extension-name>` or `biome check --write extensions/<extension-name>`
- **Format specific extension**: `biome format extensions/<extension-name>` or `biome format --write extensions/<extension-name>`
- **Lint specific extension**: `biome lint extensions/<extension-name>` or `biome lint --write extensions/<extension-name>`

**Examples:**
```bash
pnpm --filter power-menu build
pnpm --filter gnome-settings dev
biome check --write extensions/power-menu
```

### Individual Extension Development

#### Option 1: Using pnpm --filter (Recommended)
Stay in the root directory and use pnpm's built-in filtering:

```bash
# Build a specific extension
pnpm --filter power-menu build

# Start development mode for a specific extension
pnpm --filter power-menu dev

# Check and fix code quality for a specific extension
biome check --write extensions/power-menu
```

#### Option 2: Traditional Approach
Navigate to the extension directory and use the Vicinae CLI:

```bash
cd extensions/power-menu
pnpm dev    # Start development mode
pnpm build  # Build the extension
```

#### Option 3: Using Biome Directly
Target specific extensions with Biome from the root:

```bash
# Check specific extension
biome check extensions/power-menu

# Format specific extension
biome format --write extensions/power-menu

# Lint specific extension
biome lint --write extensions/power-menu
```

## Extensions

### 1. Power Menu
Essential power commands at your fingertips! Provides quick access to system power management functions.