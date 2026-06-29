const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../components/StoreSettingsManager.tsx');

let content = fs.readFileSync(filePath, 'utf8');
let original = content;

// Replace rounded-xl and rounded-2xl with rounded-lg
content = content.replace(/rounded-xl/g, 'rounded-lg');
content = content.replace(/rounded-2xl/g, 'rounded-lg');

if (content !== original) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated StoreSettingsManager.tsx successfully.`);
} else {
  console.log(`No updates needed for StoreSettingsManager.tsx.`);
}
