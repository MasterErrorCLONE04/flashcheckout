const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file.startsWith('.')) return;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

function estimateTokens(text) {
  // A good estimate for code (which has many spaces, brackets, short keywords)
  // is around 3.2 to 3.5 characters per token. 
  // Let's provide a range or a reasonable average like 3.3.
  if (!text) return 0;
  return Math.ceil(text.length / 3.3);
}

function main() {
  const targetDir = path.resolve(__dirname, '..', 'components');
  if (!fs.existsSync(targetDir)) {
    console.error(`Error: Directory ${targetDir} does not exist.`);
    process.exit(1);
  }

  console.log(`Analyzing directory: ${targetDir}`);
  console.log('--------------------------------------------------------------------------------');

  const files = walk(targetDir);
  const fileDetails = [];
  let totalChars = 0;
  let totalTokens = 0;
  let totalLines = 0;

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const chars = content.length;
      const tokens = estimateTokens(content);
      const lines = content.split('\n').length;
      const relPath = path.relative(targetDir, file);

      fileDetails.push({
        relPath,
        chars,
        tokens,
        lines
      });

      totalChars += chars;
      totalTokens += tokens;
      totalLines += lines;
    } catch (e) {
      console.error(`Error reading file ${file}:`, e.message);
    }
  });

  // Sort files by estimated tokens descending
  fileDetails.sort((a, b) => b.tokens - a.tokens);

  console.log(`${'File Path'.padEnd(55)} | ${'Lines'.padStart(6)} | ${'Characters'.padStart(10)} | ${'Est. Tokens'.padStart(12)}`);
  console.log('-'.repeat(91));
  fileDetails.forEach(f => {
    console.log(`${f.relPath.replace(/\\/g, '/').padEnd(55)} | ${f.lines.toString().padStart(6)} | ${f.chars.toLocaleString().padStart(10)} | ${f.tokens.toLocaleString().padStart(12)}`);
  });
  console.log('-'.repeat(91));
  console.log(`Total Files:         ${fileDetails.length}`);
  console.log(`Total Lines:         ${totalLines.toLocaleString()}`);
  console.log(`Total Characters:    ${totalChars.toLocaleString()}`);
  console.log(`Estimated Tokens:    ${totalTokens.toLocaleString()} (approx 3.3 chars/token)`);
  console.log(`Estimated (4 chars):  ${Math.ceil(totalChars / 4).toLocaleString()} tokens`);
}

main();
