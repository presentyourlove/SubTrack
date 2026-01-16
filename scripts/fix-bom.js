const fs = require('fs');
const path = require('path');

const DIRS = [
  path.resolve(__dirname, '../src'),
  path.resolve(__dirname, '../docs'),
  path.resolve(__dirname, '../'),
];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.expo') {
        walk(fullPath);
      }
    } else if (/\.(ts|tsx|js|jsx|json|md)$/.test(file)) {
      const buf = fs.readFileSync(fullPath);
      if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
        console.log(`Removing BOM from ${fullPath}`);
        fs.writeFileSync(fullPath, buf.slice(3));
      }
    }
  });
}

DIRS.forEach((d) => walk(d));
console.log('BOM removal check complete.');
