// .github/scripts/replace-catalog.js
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const pkgPath = path.join(__dirname, '../../apps/nextjs-app/package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

function getCatalogVersion(pkgName, selector) {
  try {
    if (!selector) {
      // Default: get latest version
      return execSync(`npm view ${pkgName} version`).toString().trim();
    } else {
      // Try as dist-tag first
      try {
        return execSync(`npm view ${pkgName} dist-tags.${selector}`).toString().trim();
      } catch (e) {
        // Fallback: try as version
        return execSync(`npm view ${pkgName}@${selector} version`).toString().trim();
      }
    }
  } catch (e) {
    console.error(`Failed to get version for ${pkgName} (selector: ${selector})`);
    return null;
  }
}

function replaceCatalogVersions(deps) {
  for (const dep in deps) {
    const match = typeof deps[dep] === 'string' && deps[dep].startsWith('catalog:')
      ? deps[dep].match(/^catalog:(.*)$/)
      : null;
    if (match) {
      const selector = match[1] || '';
      const version = getCatalogVersion(dep, selector);
      if (version) {
        deps[dep] = `^${version}`;
        console.log(`Set ${dep} to ^${version} (from catalog:${selector})`);
      }
    }
  }
}

function removeWorkspaceDeps(deps) {
  for (const dep of Object.keys(deps)) {
    if (typeof deps[dep] === 'string' && deps[dep].startsWith('workspace:')) {
      console.log(`Removing devDependency ${dep} (was ${deps[dep]})`);
      delete deps[dep];
    }
  }
}

replaceCatalogVersions(pkg.dependencies || {});
replaceCatalogVersions(pkg.devDependencies || {});
replaceCatalogVersions(pkg.peerDependencies || {});
replaceCatalogVersions(pkg.optionalDependencies || {});
removeWorkspaceDeps(pkg.devDependencies || {});

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log('Updated package.json: replaced catalog: and removed workspace: devDependencies.');