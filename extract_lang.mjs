import fs from 'fs';

const zh = fs.readFileSync('src/lang/zh_CN.ts', 'utf8');
const en = fs.readFileSync('src/lang/en_US.ts', 'utf8');

// Extract key-value pairs, handling both single-line and multi-line values
function extractKV(content) {
  const result = {};
  // Match "key": "value" or "key": `value`
  const re = /"([^"]+)":\s*(?:`([^`]*)`|"([^"]*)")/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const key = m[1];
    const val = m[2] || m[3] || '';
    result[key] = val;
  }
  return result;
}

const zhKV = extractKV(zh);
const enKV = extractKV(en);

// Output all keys with both zh and en values for comparison
const allKeys = Object.keys(zhKV).sort();
const output = [];
for (const key of allKeys) {
  const zhVal = zhKV[key];
  const enVal = enKV[key] || '';
  output.push({ key, zh: zhVal, en: enVal });
}

fs.writeFileSync('lang_comparison.json', JSON.stringify(output, null, 2), 'utf8');
console.log('Total keys in zh_CN: ' + allKeys.length);
console.log('Keys missing in en_US: ' + allKeys.filter(k => !enKV[k]).length);
console.log('Written to lang_comparison.json');
