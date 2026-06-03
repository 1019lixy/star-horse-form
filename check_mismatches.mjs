import fs from 'fs';

const zhContent = fs.readFileSync('src/lang/zh_CN.ts', 'utf8');
const enContent = fs.readFileSync('src/lang/en_US.ts', 'utf8');

// Extract key-value pairs from both files
function extractKV(content) {
  const result = {};
  const re = /"([^"]+)":\s*(?:`([^`]*)`|"([^"]*)")/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const key = m[1];
    const val = m[2] || m[3] || '';
    result[key] = val;
  }
  return result;
}

const zhKV = extractKV(zhContent);
const enKV = extractKV(enContent);

// Find keys where en_US value doesn't match zh_CN meaning
// We'll check: if en value contains Chinese, or if en value equals zh value
const mismatches = [];
for (const [key, zhVal] of Object.entries(zhKV)) {
  const enVal = enKV[key];
  if (!enVal) {
    mismatches.push({ key, zh: zhVal, en: '', issue: 'MISSING' });
  } else if (/[\u4e00-\u9fff]/.test(enVal)) {
    mismatches.push({ key, zh: zhVal, en: enVal, issue: 'CHINESE_IN_EN' });
  } else if (zhVal === enVal && !/^[a-zA-Z0-9\s\.\,\:\;\!\?\@\#\$\%\^\&\*\(\)\-\_\=\+\[\]\{\}\/\\\<\>\~\`\"\'\|]+$/.test(zhVal)) {
    // Same value but not purely English/punctuation
    mismatches.push({ key, zh: zhVal, en: enVal, issue: 'SAME_VALUE' });
  }
}

// Output mismatches for manual review
console.log('Total keys in zh_CN:', Object.keys(zhKV).length);
console.log('Total keys in en_US:', Object.keys(enKV).length);
console.log('Mismatches found:', mismatches.length);
console.log('\n=== MISMATCHES ===');
mismatches.forEach(m => {
  console.log(`[${m.issue}] ${m.key}: zh="${m.zh}" en="${m.en}"`);
});
