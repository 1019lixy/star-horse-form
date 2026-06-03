import fs from 'fs';

function extractKV(content) {
  const result = {};
  // Match patterns like "key": "value" or "key": `value`
  const re = /"([^"]+)":\s*(?:`([^`]*)`|"([^"]*)")/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const key = m[1];
    const val = m[2] || m[3] || '';
    result[key] = val;
  }
  return result;
}

const zhContent = fs.readFileSync('src/lang/zh_CN.ts', 'utf-8');
const enContent = fs.readFileSync('src/lang/en_US.ts', 'utf-8');

const zhKV = extractKV(zhContent);
const enKV = extractKV(enContent);

const zhKeys = Object.keys(zhKV);
const enKeys = Object.keys(enKV);

// Check for Chinese characters in en_US values
const chineseRe = /[\u4e00-\u9fff]/;

console.log('=== Keys in zh_CN but missing from en_US ===');
const missingInEn = zhKeys.filter(k => !enKV.hasOwnProperty(k));
missingInEn.forEach(k => console.log(`  "${k}": "${zhKV[k]}"`));
console.log(`Total: ${missingInEn.length}\n`);

console.log('=== Keys in en_US but missing from zh_CN ===');
const missingInZh = enKeys.filter(k => !zhKV.hasOwnProperty(k));
missingInZh.forEach(k => console.log(`  "${k}": "${enKV[k]}"`));
console.log(`Total: ${missingInZh.length}\n`);

console.log('=== en_US values that still contain Chinese ===');
const chineseInEn = enKeys.filter(k => chineseRe.test(enKV[k]));
chineseInEn.forEach(k => console.log(`  "${k}": en="${enKV[k]}" zh="${zhKV[k] || 'N/A'}"`));
console.log(`Total: ${chineseInEn.length}\n`);

console.log('=== Keys where en_US value might not match zh_CN value ===');
// For keys that exist in both, check if the English seems to match the Chinese
// We can't do semantic matching, but we can flag suspicious entries
const bothKeys = zhKeys.filter(k => enKV.hasOwnProperty(k));
console.log(`Total keys in both files: ${bothKeys.length}`);

// Output all key-value pairs for review
const output = {};
bothKeys.forEach(k => {
  output[k] = { zh: zhKV[k], en: enKV[k] };
});

fs.writeFileSync('lang_comparison.json', JSON.stringify(output, null, 2), 'utf-8');
console.log('\nFull comparison written to lang_comparison.json');
