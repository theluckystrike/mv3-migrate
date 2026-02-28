# mv3-migrate — Manifest V3 Migration Tool for Chrome Extensions

[![npm version](https://img.shields.io/npm/v/mv3-migrate.svg)](https://www.npmjs.com/package/mv3-migrate)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

> **Built by [Zovo](https://zovo.one)** — we migrated 18+ extensions to Manifest V3 with this exact tool

**Automatically migrate your Chrome extension from Manifest V2 to Manifest V3.** Analyze issues, convert manifests, and generate migration reports — all from the command line.

🔍 **Need a production MV3 extension to reference?** Check out [Tab Suspender Pro](https://chrome.google.com/webstore/detail/tab-suspender-pro) or [JSON Formatter Pro](https://chrome.google.com/webstore/detail/json-formatter-pro) — both built on MV3 from the ground up.

## 📦 Install

```bash
npm install -g mv3-migrate
# or use directly with npx
npx mv3-migrate analyze ./my-extension
```

## 🚀 Usage

### Analyze Your Extension

Get a detailed migration report before making any changes:

```bash
mv3-migrate analyze ./my-extension
```

Output:
```
🔍 Analyzing extension...

# MV3 Migration Report: My Extension

| Severity | Count |
|----------|-------|
| 🔴 Critical | 3 |
| 🟡 Warning | 2 |
| 🔵 Info | 0 |

## 🔴 Critical Issues (Must Fix)

### Manifest Version
- Issue: Extension uses Manifest V2
- Action: Update manifest_version to 3

### Background Scripts
- Issue: Uses background scripts: background.js
- Action: Convert to service worker (background.service_worker)

### Browser Action
- Issue: Uses browser_action (MV2 API)
- Action: Rename browser_action to action
```

Save the report:
```bash
mv3-migrate analyze ./my-extension -o migration-report.md
```

### Migrate Your Manifest

```bash
# Preview changes (dry run)
mv3-migrate migrate ./my-extension --dry-run

# Apply migration with backup
mv3-migrate migrate ./my-extension --backup

# Apply without backup
mv3-migrate migrate ./my-extension --no-backup
```

### What Gets Migrated

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
| CSP as string | CSP as object |
| `web_accessible_resources` (array) | Object format with `matches` |

## 📚 Library API

```typescript
import { analyzeExtension, migrateManifest, generateReport } from 'mv3-migrate';

// Analyze
const analysis = analyzeExtension('./my-extension');
console.log(`Found ${analysis.stats.totalIssues} issues`);

// Generate report
const report = generateReport(analysis);
fs.writeFileSync('report.md', report);

// Migrate manifest
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf-8'));
const result = migrateManifest(manifest);
console.log('Changes:', result.changes);
console.log('Warnings:', result.warnings);
```

## 🔗 Related Projects

- [chrome-extension-starter-mv3](https://github.com/theluckystrike/chrome-extension-starter-mv3) — Start fresh with an MV3 template
- [chrome-storage-plus](https://github.com/theluckystrike/chrome-storage-plus) — Enhanced Chrome storage wrapper
- [tab-manager-api](https://github.com/theluckystrike/tab-manager-api) — Chrome tabs API wrapper
- [json-toolkit-cli](https://github.com/theluckystrike/json-toolkit-cli) — JSON CLI toolkit

## 📄 License

MIT — [Zovo](https://zovo.one)
