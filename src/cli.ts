#!/usr/bin/env node

/**
 * mv3-migrate CLI
 * Automatically migrate Chrome extensions from Manifest V2 to Manifest V3
 */

import { Command } from 'commander';
import { analyzeExtension } from './analyzer';
import { generateReport } from './report';
import { migrateManifest } from './transforms/manifest';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

const program = new Command();

program
    .name('mv3-migrate')
    .description('Automatically migrate Chrome extensions from Manifest V2 to Manifest V3')
    .version('0.1.0');

program
    .command('analyze')
    .description('Analyze an MV2 extension and generate a migration report')
    .argument('<dir>', 'Extension directory containing manifest.json')
    .option('-o, --output <file>', 'Save report to file')
    .action(async (dir: string, options) => {
        const manifestPath = path.join(dir, 'manifest.json');

        if (!fs.existsSync(manifestPath)) {
            console.error(chalk.red(`❌ No manifest.json found in ${dir}`));
            process.exit(1);
        }

        console.log(chalk.blue('🔍 Analyzing extension...\n'));
        const analysis = analyzeExtension(dir);
        const report = generateReport(analysis);

        if (options.output) {
            fs.writeFileSync(options.output, report);
            console.log(chalk.green(`✅ Report saved to ${options.output}`));
        } else {
            console.log(report);
        }
    });

program
    .command('migrate')
    .description('Migrate manifest.json from MV2 to MV3')
    .argument('<dir>', 'Extension directory containing manifest.json')
    .option('--dry-run', 'Preview changes without modifying files')
    .option('--backup', 'Create backup of original files', true)
    .action(async (dir: string, options) => {
        const manifestPath = path.join(dir, 'manifest.json');

        if (!fs.existsSync(manifestPath)) {
            console.error(chalk.red(`❌ No manifest.json found in ${dir}`));
            process.exit(1);
        }

        console.log(chalk.blue('🚀 Starting MV2 → MV3 migration...\n'));

        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

        if (manifest.manifest_version === 3) {
            console.log(chalk.yellow('⚠️  Extension is already MV3'));
            process.exit(0);
        }

        const migrated = migrateManifest(manifest);

        if (options.dryRun) {
            console.log(chalk.yellow('📋 Dry run — proposed manifest.json:\n'));
            console.log(JSON.stringify(migrated.manifest, null, 2));
            console.log('\n' + chalk.yellow('Changes:'));
            migrated.changes.forEach((c) => console.log(`  • ${c}`));
        } else {
            if (options.backup) {
                const backupPath = manifestPath + '.mv2.backup';
                fs.copyFileSync(manifestPath, backupPath);
                console.log(chalk.gray(`📦 Backup saved to ${backupPath}`));
            }

            fs.writeFileSync(manifestPath, JSON.stringify(migrated.manifest, null, 2));
            console.log(chalk.green('✅ manifest.json migrated to MV3'));
            console.log('\nChanges applied:');
            migrated.changes.forEach((c) => console.log(`  ✓ ${c}`));

            if (migrated.warnings.length > 0) {
                console.log(chalk.yellow('\n⚠️  Manual action required:'));
                migrated.warnings.forEach((w) => console.log(`  • ${w}`));
            }
        }
    });

program.parse();
