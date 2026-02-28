/**
 * Extension Analyzer
 * Parse manifest.json and detect MV2 patterns that need migration
 */

import * as fs from 'fs';
import * as path from 'path';

export interface AnalysisResult {
    manifestVersion: number;
    extensionName: string;
    issues: MigrationIssue[];
    stats: {
        totalIssues: number;
        critical: number;
        warning: number;
        info: number;
    };
}

export interface MigrationIssue {
    severity: 'critical' | 'warning' | 'info';
    category: string;
    description: string;
    action: string;
    file?: string;
    line?: number;
}

export function analyzeExtension(extensionDir: string): AnalysisResult {
    const manifestPath = path.join(extensionDir, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const issues: MigrationIssue[] = [];

    // Check manifest version
    if (manifest.manifest_version === 2) {
        issues.push({
            severity: 'critical',
            category: 'Manifest Version',
            description: 'Extension uses Manifest V2',
            action: 'Update manifest_version to 3',
        });
    }

    // Background page → Service Worker
    if (manifest.background?.scripts || manifest.background?.page) {
        issues.push({
            severity: 'critical',
            category: 'Background Scripts',
            description: manifest.background.page
                ? 'Uses background page (background.page)'
                : `Uses background scripts: ${manifest.background.scripts?.join(', ')}`,
            action: 'Convert to service worker (background.service_worker)',
        });
    }

    // browserAction → action
    if (manifest.browser_action) {
        issues.push({
            severity: 'critical',
            category: 'Browser Action',
            description: 'Uses browser_action (MV2 API)',
            action: 'Rename browser_action to action',
        });
    }

    // pageAction → action
    if (manifest.page_action) {
        issues.push({
            severity: 'critical',
            category: 'Page Action',
            description: 'Uses page_action (MV2 API)',
            action: 'Rename page_action to action',
        });
    }

    // webRequestBlocking permission
    if (manifest.permissions?.includes('webRequestBlocking')) {
        issues.push({
            severity: 'critical',
            category: 'Web Request Blocking',
            description: 'Uses webRequestBlocking permission',
            action: 'Migrate to declarativeNetRequest API',
        });
    }

    // Content Security Policy
    if (typeof manifest.content_security_policy === 'string') {
        issues.push({
            severity: 'warning',
            category: 'Content Security Policy',
            description: 'CSP is a string (MV2 format)',
            action: 'Convert to object format with extension_pages property',
        });
    }

    // Web-accessible resources
    if (manifest.web_accessible_resources && Array.isArray(manifest.web_accessible_resources)) {
        if (manifest.web_accessible_resources.length > 0 && typeof manifest.web_accessible_resources[0] === 'string') {
            issues.push({
                severity: 'warning',
                category: 'Web Accessible Resources',
                description: 'Uses string array format (MV2)',
                action: 'Convert to object format with resources and matches properties',
            });
        }
    }

    // Host permissions
    if (manifest.permissions) {
        const hostPerms = manifest.permissions.filter(
            (p: string) => p.includes('://') || p === '<all_urls>'
        );
        if (hostPerms.length > 0) {
            issues.push({
                severity: 'warning',
                category: 'Host Permissions',
                description: `Host permissions in permissions array: ${hostPerms.join(', ')}`,
                action: 'Move host permissions to host_permissions array',
            });
        }
    }

    // Check for chrome.browserAction usage in source files
    const srcFiles = findJsFiles(extensionDir);
    for (const file of srcFiles) {
        const content = fs.readFileSync(file, 'utf-8');

        if (content.includes('chrome.browserAction')) {
            issues.push({
                severity: 'warning',
                category: 'API Usage',
                description: `Uses chrome.browserAction API`,
                action: 'Replace with chrome.action',
                file: path.relative(extensionDir, file),
            });
        }

        if (content.includes('chrome.webRequest.onBeforeRequest') && content.includes('blocking')) {
            issues.push({
                severity: 'critical',
                category: 'API Usage',
                description: 'Uses blocking webRequest',
                action: 'Migrate to declarativeNetRequest',
                file: path.relative(extensionDir, file),
            });
        }
    }

    const stats = {
        totalIssues: issues.length,
        critical: issues.filter((i) => i.severity === 'critical').length,
        warning: issues.filter((i) => i.severity === 'warning').length,
        info: issues.filter((i) => i.severity === 'info').length,
    };

    return {
        manifestVersion: manifest.manifest_version,
        extensionName: manifest.name || 'Unknown',
        issues,
        stats,
    };
}

function findJsFiles(dir: string): string[] {
    const files: string[] = [];
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.name === 'node_modules' || entry.name === '.git') continue;
            if (entry.isDirectory()) {
                files.push(...findJsFiles(fullPath));
            } else if (/\.(js|ts|jsx|tsx)$/.test(entry.name)) {
                files.push(fullPath);
            }
        }
    } catch {
        // Ignore permission errors
    }
    return files;
}
