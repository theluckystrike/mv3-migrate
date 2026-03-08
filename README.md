# mv3-migrate

[![npm version](https://img.shields.io/npm/v/mv3-migrate.svg)](https://www.npmjs.com/package/mv3-migrate)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Last Commit](https://img.shields.io/github/last-commit/theluckystrike/mv3-migrate)](https://github.com/theluckystrike/mv3-migrate/commits/main)
[![CI](https://github.com/theluckystrike/mv3-migrate/actions/workflows/ci.yml/badge.svg)](https://github.com/theluckystrike/mv3-migrate/actions/workflows/ci.yml)

A CLI tool and TypeScript library for automatically migrating Chrome extensions from Manifest V2 to Manifest V3.

## What is mv3-migrate?

mv3-migrate helps you upgrade your Chrome extensions to Manifest V3, Google's latest extension platform. It analyzes your extension for MV2-specific patterns, generates detailed migration reports, and can automatically convert your `manifest.json` to the MV3 format.

### What gets migrated?

| MV2 Pattern | MV3 Conversion |
|-------------|----------------|
| `manifest_version: 2` | `manifest_version: 3` |
| `background.scripts` | `background.service_worker` |
| `background.page` | `background.service_worker` |
| `background.persistent` | Removed (not applicable) |
| `browser_action` | `action` |
| `page_action` | `action` |
| Host permissions in `permissions` | Moved to `host_permissions` |
| `webRequestBlocking` | `declarativeNetRequest` |
| CSP as string | CSP as object with `extension_pages` |
| `web_accessible_resources` (array) | Object format with `resources` + `matches` |

## Install

```bash
npm install -g mv3-migrate
```

Or run directly with npx (no installation required):

```bash
npx mv3-migrate analyze ./my-extension
```

## Usage

The CLI has two commands: `analyze` and `migrate`.

### Analyze your extension

Scan an MV2 extension directory and get a detailed migration report:

```bash
mv3-migrate analyze ./my-extension
```

Save the report to a file:

```bash
mv3-migrate analyze ./my-extension -o migration-report.md
```

### Migrate your manifest

Preview changes with a dry run:

```bash
mv3-migrate migrate ./my-extension --dry-run
```

Apply the migration. A backup of the original `manifest.json` is created automatically:

```bash
mv3-migrate migrate ./my-extension
```

Skip the backup if you prefer:

```bash
mv3-migrate migrate ./my-extension --no-backup
```

## Usage Examples

### Before: MV2 manifest.json

```json
{
  "manifest_version": 2,
  "name": "My Extension",
  "version": "1.0",
  "background": {
    "scripts": ["background.js"],
    "persistent": true
  },
  "browser_action": {
    "default_icon": "icon.png",
    "default_title": "My Extension"
  },
  "permissions": [
    "storage",
    "https://*/*",
    "webRequestBlocking"
  ],
  "content_security_policy": "script-src 'self' https://example.com; object-src 'self'"
}
```

### After: MV3 manifest.json

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0",
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_icon": "icon.png",
    "default_title": "My Extension"
  },
  "permissions": [
    "storage",
    "declarativeNetRequest"
  ],
  "host_permissions": [
    "https://*/*"
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self' https://example.com; object-src 'self'"
  }
}
```

> ⚠️ **Note:** Some changes require manual work after migration:
> - Background scripts must be converted to service workers (event-driven, no DOM)
> - `webRequest` blocking must be migrated to `declarativeNetRequest` rules

## Library API

Use mv3-migrate programmatically in your own tools:

```typescript
import { analyzeExtension, migrateManifest, generateReport } from 'mv3-migrate';
import * as fs from 'fs';

// Analyze an extension directory
const analysis = analyzeExtension('./my-extension');
console.log(`Found ${analysis.stats.totalIssues} issues`);
console.log(`  Critical: ${analysis.stats.critical}`);
console.log(`  Warnings: ${analysis.stats.warning}`);

// Generate a markdown report
const report = generateReport(analysis);
fs.writeFileSync('report.md', report);

// Migrate a manifest object
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf-8'));
const result = migrateManifest(manifest);

console.log('Changes applied:', result.changes);
console.log('Warnings:', result.warnings);
```

### Exported Types

- **`AnalysisResult`** — Full analysis with issues and statistics
- **`MigrationIssue`** — Single issue with severity, category, description, and action
- **`MigrationResult`** — Migrated manifest, list of changes, and warnings

## Project Structure

```
mv3-migrate/
├── src/
│   ├── analyzer.ts         # Analyzes MV2 extensions for migration issues
│   ├── cli.ts              # CLI entry point (commander)
│   ├── index.ts            # Library exports
│   ├── report.ts           # Generates markdown reports
│   └── transforms/
│       └── manifest.ts     # Manifest V2 → V3 conversion logic
├── package.json
├── tsconfig.json
└── README.md
```

## Development

```bash
# Clone and install
git clone https://github.com/theluckystrike/mv3-migrate.git
cd mv3-migrate
npm install

# Build
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Watch mode for development
npm run dev
```

## Related Projects

- [chrome-extension-starter-mv3](https://github.com/theluckystrike/chrome-extension-starter-mv3) — Start fresh with an MV3 template
- [chrome-storage-plus](https://github.com/theluckystrike/chrome-storage-plus) — Enhanced Chrome storage wrapper
- [tab-manager-api](https://github.com/theluckystrike/tab-manager-api) — Chrome tabs API wrapper

## License

MIT. See [LICENSE](LICENSE) for details.

---

Built at [zovo.one](https://zovo.one) by [theluckystrike](https://github.com/theluckystrike)
