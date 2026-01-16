const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '../src');
// Exclude these from i18n checks
const I18N_EXCLUDES = ['i18n', 'assets', '__tests__', '__mocks__'];

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        walk(filepath, callback);
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      callback(filepath);
    }
  });
}

const issues = {
  bom: [],
  largeFiles: [],
  hardcodedChinese: [],
};

walk(SRC_DIR, (filepath) => {
  const buffer = fs.readFileSync(filepath);

  // 1. Check for BOM (EF BB BF)
  if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    issues.bom.push(path.relative(SRC_DIR, filepath));
  }

  const content = buffer.toString('utf8');
  const lines = content.split('\n');

  // 2. Check File Size (> 300 lines)
  if (lines.length > 300) {
    issues.largeFiles.push({
      file: path.relative(SRC_DIR, filepath),
      lines: lines.length,
    });
  }

  // 3. Check for Hardcoded Chinese Characters
  // Regex for Chinese range
  const relativePath = path.relative(SRC_DIR, filepath);
  const pathParts = relativePath.split(path.sep);

  // Skip i18n definition files and tests
  const isExcluded = pathParts.some((part) => I18N_EXCLUDES.includes(part));

  if (!isExcluded) {
    lines.forEach((line, index) => {
      // Very prompt way to strip comments:
      // Remove // comment
      let cleanLine = line.replace(/\/\/.*/, '');
      // Remove /* */ block comment (simple inline check)
      cleanLine = cleanLine.replace(/\/\*.*?\*\//g, '');

      // Ignore console.log/error/warn usually ok, but strictly we might want to flag
      // For this check, let's flag everything.

      if (/[\u4e00-\u9fa5]/.test(cleanLine)) {
        // Ignore import lines? No, imports usually don't have Chinese unless file name is Chinese (which is bad practice but possible)
        issues.hardcodedChinese.push({
          file: relativePath,
          line: index + 1,
          content: line.trim(),
        });
      }
    });
  }
});

console.log(JSON.stringify(issues, null, 2));
