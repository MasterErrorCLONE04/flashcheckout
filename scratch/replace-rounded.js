const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../components/dashboard');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace rounded-xl and rounded-2xl with rounded-lg
  content = content.replace(/rounded-xl/g, 'rounded-lg');
  content = content.replace(/rounded-2xl/g, 'rounded-lg');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${path.basename(filePath)}`);
  }
}

function scanDir(directory) {
  const files = fs.readdirSync(directory);
  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(fullPath);
    }
  });
}

scanDir(dir);
console.log('Border radius replacement completed successfully.');
