const fs = require('fs');
const path = require('path');

function walkDir(dir, ext = ['.ts', '.vue', '.js']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(walkDir(filePath, ext));
    } else if (ext.some(e => file.endsWith(e))) {
      results.push(filePath);
    }
  }
  return results;
}

const files = walkDir('src/components/rule');
const allKeys = new Set();

// Match: i18n('key'), i18n("key"), 'rule.xxx': ..., "rule.xxx": ...
const keyRegex = /['"`](rule\.[a-zA-Z][\w.]*)['"`]/g;

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = keyRegex.exec(content))) {
    allKeys.add(m[1]);
  }
}

const z = fs.readFileSync('src/lang/zh_CN.ts', 'utf8');
const e = fs.readFileSync('src/lang/en_US.ts', 'utf8');

const checkPresence = (content, key) => {
  const patterns = [
    new RegExp(`['"]${key.replace(/\./g, '\\.')}['"]\\s*:`),
  ];
  return patterns.some(p => p.test(content));
};

const sortedKeys = [...allKeys].sort();
const missingZh = sortedKeys.filter(k => !checkPresence(z, k));
const missingEn = sortedKeys.filter(k => !checkPresence(e, k));

console.log('Total i18n keys in rule/ folder:', sortedKeys.length);
console.log('Missing in zh_CN.ts:', missingZh.length);
console.log('Missing in en_US.ts:', missingEn.length);
console.log('\n=== Missing in zh_CN.ts ===');
console.log(JSON.stringify(missingZh, null, 2));
console.log('\n=== Missing in en_US.ts ===');
console.log(JSON.stringify(missingEn, null, 2));
