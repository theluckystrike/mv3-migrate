# mv3-migrate

[![npm version](https://img.shields.io/npm/v/mv3-migrate.svg)](https://www.npmjs.com/package/mv3-migrate)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![CI](https://github.com/theluckystrike/mv3-migrate/actions/workflows/ci.yml/badge.svg)](https://github.com/theluckystrike/mv3-migrate/actions/workflows/ci.yml)

Automatically migrate Chrome extensions from Manifest V2 to Manifest V3. Analyze issues, convert manifests, and generate migration reports from the command line or as a library.

Built by [Zovo](https://zovo.one). We migrated 18+ extensions to Manifest V3 with this exact tool.

<!-- TODO: Add screenshot -->

## Install

```bash
npm install -g mv3-migrate
```

Or run directly with npx.

```bash
npx mv3-migrate analyze ./my-extension
```

## Usage

The CLI has two commands, analyze and migrate.

### Analyze your extension

Scan an MV2 extension directory and get a detailed migration report.

```bash
mv3-migrate analyze ./my-extension
```

Save the report to a file.

```bash
mv3-migrate analyze ./my-extension -o migration-report.md
```

### Migrate your manifest

Preview changes with a dry run.

```bash
mv3-migrate migrate ./my-extension --dry-run
```

Apply the migration. A backup of the original manifest.json is created by default.

```bash
mv3-migrate migrate ./my-extension
```

Skip the backup if you want.

```bash
mv3-migrate migrate ./my-extension --no-backup
```

## What Gets Migrated

| MV2 Pattern | MV3 Conversion |
|-------------|----------------|
| `manifest_version: 2` | `manifest_version: 3` |
| `background.scripts` | `background.service_worker` |
| `background.page` | `background.service_worker` |
| `background.persistent` | Removed |
| `browser_action` | `action` |
| `page_action` | `action` |
| Host permissions in `permissions` | Moved to `host_permissions` |
| `webRequestBlocking` | `declarativeNetRequest` |
| CSP as string | CSP as object with `extension_pages` |
| `web_accessible_resources` (flat array) | Object format with `resources` and `matches` |

## Library API

Use mv3-migrate programmatically in your own tools.

```typescript
import { analyzeExtension, migrateManifest, generateReport } from 'mv3-migrate';

// Analyze an extension directory
const analysis = analyzeExtension('./my-extension');
console.log(`Found ${analysis.stats.totalIssues} issues`);

// Generate a markdown report
const report = generateReport(analysis);
fs.writeFileSync('report.md', report);

// Migrate a manifest object
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf-8'));
const result = migrateManifest(manifest);
console.log('Changes:', result.changes);
console.log('Warnings:', result.warnings);
```

### Exported types

- `AnalysisResult` contains the full analysis with issues and stats
- `MigrationIssue` represents a single issue with severity, category, description, and action
- `MigrationResult` holds the migrated manifest, list of changes, and warnings

## Development

```bash
git clone https://github.com/theluckystrike/mv3-migrate.git
cd mv3-migrate
npm install
npm run build
npm test
```

Run the linter.

```bash
npm run lint
```

Watch mode for development.

```bash
npm run dev
```

## Related Projects

- [chrome-extension-starter-mv3](https://github.com/theluckystrike/chrome-extension-starter-mv3) - Start fresh with an MV3 template
- [chrome-storage-plus](https://github.com/theluckystrike/chrome-storage-plus) - Enhanced Chrome storage wrapper
- [tab-manager-api](https://github.com/theluckystrike/tab-manager-api) - Chrome tabs API wrapper
- [json-toolkit-cli](https://github.com/theluckystrike/json-toolkit-cli) - JSON CLI toolkit

## License

MIT. See [LICENSE](LICENSE) for details.

---

Built by [theluckystrike](https://github.com/theluckystrike) — [zovo.one](https://zovo.one)
