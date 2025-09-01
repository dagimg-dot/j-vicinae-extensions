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

- **Build all extensions**: `pnpm build`
- **Develop all extensions**: `pnpm dev`
- **Lint and format**: `pnpm check` (check only) or `pnpm check:fix` (auto-fix)
- **Format only**: `pnpm format` (check only) or `pnpm format:fix` (auto-fix)
- **Lint only**: `pnpm lint` (check only) or `pnpm lint:fix` (auto-fix)

### Individual Extension Development

Navigate to any extension directory and use the Vicinae CLI:

```bash
cd extensions/power-menu
pnpm dev    # Start development mode
pnpm build  # Build the extension
```

## Extensions

### 1. Power Menu
Essential power commands at your fingertips! Provides quick access to system power management functions.