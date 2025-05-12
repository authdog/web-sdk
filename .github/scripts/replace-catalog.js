// .github/scripts/replace-catalog.js
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const pkgPath = path.join(__dirname, '../../apps/nextjs-app/package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

function getLatestVersion(pkgName) {
  try {
    // Query npm for the latest version
    return execSync(`npm view ${pkgName} version`).toString().trim();
  } catch (e) {
    console.error(`Failed to get version for ${pkgName}`);
    return null;
  }
}

function replaceCatalogVersions(deps) {
  for (const dep in deps) {
    if (deps[dep] === 'catalog:') {
      const latest = getLatestVersion(dep);
      if (latest) {
        deps[dep] = `^${latest}`;
        console.log(`Set ${dep} to ^${latest}`);
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