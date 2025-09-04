# Floww Vicinae Extension

A Vicinae extension for managing and applying Floww CLI workflows across workspaces.

## Features

- **Workflow Discovery**: Automatically scans `~/.config/floww/workflows/` directory
- **Search & Filter**: Search workflows by name and description
- **One-Click Application**: Apply workflows with a single click
- **Multi-Format Support**: Supports YAML, JSON, and TOML workflow files
- **Error Handling**: Graceful handling of missing CLI or configuration
- **Status Feedback**: Toast notifications for success/error states
- **Workflow Validation**: Validate workflows before applying

## Prerequisites

- [Floww CLI](https://github.com/dagimg-dot/floww) must be installed
- Floww configuration must be initialized (`floww init`)

## Installation

1. Install the extension through Vicinae
2. Ensure Floww CLI is installed and configured
3. Create some workflows using `floww add`

## Usage

1. Open Vicinae and search for "floww"
2. Browse your available workflows
3. Click on a workflow to apply it
4. Use the search bar to filter workflows by name or description

## Workflow File Support

The extension supports multiple workflow file formats:

- **YAML** (`.yaml`, `.yml`)
- **JSON** (`.json`)
- **TOML** (`.toml`)

## Actions

- **Apply Workflow**: Execute the selected workflow
- **Validate Workflow**: Check if the workflow is valid
- **Copy Workflow Name**: Copy the workflow name to clipboard
- **Show in Finder**: Open the workflow file location

## Error Handling

The extension handles various error scenarios:

- Floww CLI not installed
- Configuration directory missing
- No workflows found
- Workflow file parsing errors
- CLI execution failures

## Development

```bash
# Install dependencies
pnpm install

# Build the extension
pnpm run build

# Run in development mode
pnpm run dev
```

## File Structure

```
src/
├── floww.tsx              # Main component
├── types/
│   └── workflow.ts        # TypeScript interfaces
├── utils/
│   ├── floww-cli.ts       # CLI interaction utilities
│   ├── config-parser.ts   # Parse workflow files
│   └── file-system.ts     # File system operations
└── components/
    └── WorkflowItem.tsx   # Individual workflow item component
```

## License

MIT