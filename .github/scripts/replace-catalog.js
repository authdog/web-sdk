// .github/scripts/replace-catalog.js
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const defaultPkgPath = path.join(__dirname, '../../examples/nextjs-app/package.json');
const pkgPath = process.argv[2] || defaultPkgPath;
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const rootPackageJsonPath = path.join(__dirname, '../../package.json');
const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));
const rootCatalog = rootPackageJson.catalog || rootPackageJson.workspaces?.catalog;
const rootCatalogs = rootPackageJson.catalogs || rootPackageJson.workspaces?.catalogs;

function getCatalogVersion(pkgName, selector) {
  // Resolve from the Bun workspace catalogs first.
  if (!selector) {
    // catalog:
    if (rootCatalog && rootCatalog[pkgName]) {
      return rootCatalog[pkgName];
    }
  } else {
    // catalog:<selector>
    if (
      rootCatalogs &&
      rootCatalogs[selector] &&
      rootCatalogs[selector][pkgName]
    ) {
      return rootCatalogs[selector][pkgName];
    }
  }
  // Fallback to npm metadata via bunx so CI stays Bun-first.
  try {
    if (!selector) {
      return execSync(`bunx npm view ${pkgName} version`).toString().trim();
    } else {
      try {
        return execSync(`bunx npm view ${pkgName} dist-tags.${selector}`).toString().trim();
      } catch (e) {
        return execSync(`bunx npm view ${pkgName}@${selector} version`).toString().trim();
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
        deps[dep] = /^[~^><=*]/.test(version) ? version : `^${version}`;
        console.log(`Set ${dep} to ${deps[dep]} (from catalog:${selector})`);
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