import { readFileSync } from 'fs';
const zhContent = readFileSync('e:/lixycode/dynamicform/src/lang/zh_CN.ts', 'utf-8');
const enContent = readFileSync('e:/lixycode/dynamicform/src/lang/en_US.ts', 'utf-8');

function extractKV(content) {
  const result = {};
  const re = /"([^"]+)":\s*(?:`([^`]*)`|"([^"]*)"|Config\.[a-zA-Z]+)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const key = m[1];
    const val = m[2] || m[3] || m[0].split(':')[1].trim();
    result[key] = val;
  }
  return result;
}

const zh = extractKV(zhContent);
const en = extractKV(enContent);

const zhKeys = Object.keys(zh);
const enKeys = Object.keys(en);

const missingInEn = zhKeys.filter(k => !enKeys.includes(k));
const extraInEn = enKeys.filter(k => !zhKeys.includes(k));
const chineseInEn = enKeys.filter(k => {
  const val = en[k];
  return /[\u4e00-\u9fff]/.test(val);
});

console.log('=== Keys in zh_CN but missing in en_US ===');
console.log('Count:', missingInEn.length);
missingInEn.forEach(k => console.log('  ' + k + ': ' + zh[k]));

console.log('\n=== Keys in en_US but not in zh_CN ===');
console.log('Count:', extraInEn.length);
extraInEn.forEach(k => console.log('  ' + k + ': ' + en[k]));

console.log('\n=== Keys in en_US with Chinese values (untranslated) ===');
console.log('Count:', chineseInEn.length);
chineseInEn.forEach(k => console.log('  ' + k + ': ' + en[k]));

console.log('\n=== Summary ===');
console.log('zh_CN keys:', zhKeys.length);
console.log('en_US keys:', enKeys.length);
