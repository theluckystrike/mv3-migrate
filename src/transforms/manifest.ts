/**
 * Manifest Transformer
 * Converts MV2 manifest.json to MV3 format
 */

export interface MigrationResult {
    manifest: Record<string, unknown>;
    changes: string[];
    warnings: string[];
}

export function migrateManifest(manifest: Record<string, unknown>): MigrationResult {
    const result = JSON.parse(JSON.stringify(manifest)); // Deep clone
    const changes: string[] = [];
    const warnings: string[] = [];

    // 1. Update manifest_version
    result.manifest_version = 3;
    changes.push('Updated manifest_version from 2 to 3');

    // 2. Background scripts → Service Worker
    if (result.background) {
        const bg = result.background as Record<string, unknown>;
        if (bg.scripts) {
            const scripts = bg.scripts as string[];
            if (scripts.length === 1) {
                result.background = { service_worker: scripts[0] };
                changes.push(`Converted background.scripts to background.service_worker: ${scripts[0]}`);
            } else {
                result.background = { service_worker: scripts[0] };
                changes.push(`Converted background.scripts to service_worker (using first file: ${scripts[0]})`);
                warnings.push(
                    `Multiple background scripts (${scripts.join(', ')}) detected. You need to combine them into a single service worker file.`
                );
            }
        } else if (bg.page) {
            result.background = { service_worker: 'service-worker.js' };
            changes.push('Converted background.page to background.service_worker');
            warnings.push(
                `Background page (${bg.page}) needs manual conversion to service worker (service-worker.js)`
            );
        }

        // Remove persistent flag
        if ('persistent' in (result.background as Record<string, unknown>)) {
            delete (result.background as Record<string, unknown>).persistent;
            changes.push('Removed background.persistent (not applicable in MV3)');
        }
    }

    // 3. browser_action → action
    if (result.browser_action) {
        result.action = result.browser_action;
        delete result.browser_action;
        changes.push('Renamed browser_action to action');
    }

    // 4. page_action → action
    if (result.page_action) {
        result.action = result.page_action;
        delete result.page_action;
        changes.push('Renamed page_action to action');
    }

    // 5. Host permissions extraction
    if (result.permissions && Array.isArray(result.permissions)) {
        const perms = result.permissions as string[];
        const hostPerms = perms.filter((p) => p.includes('://') || p === '<all_urls>');
        const apiPerms = perms.filter((p) => !p.includes('://') && p !== '<all_urls>');

        if (hostPerms.length > 0) {
            result.permissions = apiPerms;
            result.host_permissions = hostPerms;
            changes.push(`Moved ${hostPerms.length} host permissions to host_permissions`);
        }

        // Remove webRequestBlocking
        if (apiPerms.includes('webRequestBlocking')) {
            result.permissions = apiPerms.filter((p) => p !== 'webRequestBlocking');
            if (!result.permissions.includes('declarativeNetRequest')) {
                result.permissions.push('declarativeNetRequest');
            }
            changes.push('Replaced webRequestBlocking with declarativeNetRequest');
            warnings.push(
                'webRequest blocking rules need manual migration to declarativeNetRequest rules. See: https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest'
            );
        }
    }

    // 6. Content Security Policy → object format
    if (typeof result.content_security_policy === 'string') {
        result.content_security_policy = {
            extension_pages: result.content_security_policy,
        };
        changes.push('Converted content_security_policy to object format');
    }

    // 7. Web Accessible Resources → object format
    if (result.web_accessible_resources && Array.isArray(result.web_accessible_resources)) {
        const resources = result.web_accessible_resources;
        if (resources.length > 0 && typeof resources[0] === 'string') {
            result.web_accessible_resources = [
                {
                    resources: resources,
                    matches: ['<all_urls>'],
                },
            ];
            changes.push('Converted web_accessible_resources to object format');
            warnings.push(
                'web_accessible_resources matches set to <all_urls>. Consider restricting to specific URL patterns.'
            );
        }
    }

    return { manifest: result, changes, warnings };
}
