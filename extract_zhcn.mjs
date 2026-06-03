// 提取zh_CN.ts的所有key-value对，输出为JSON
import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('e:/lixycode/dynamicform/src/lang/zh_CN.ts', 'utf-8');

// 提取所有key-value对
const result = {};
const lines = content.split('\n');
let i = 0;

while (i < lines.length) {
  const line = lines[i].trim();

  // 跳过注释、空行、export default、大括号
  if (!line || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*') || line === 'export default {' || line === '};' || line === '{') {
    i++;
    continue;
  }

  // 匹配 "key": value 格式
  const kvMatch = line.match(/^"([^"]+)":\s*(.+),?$/);
  if (kvMatch) {
    const key = kvMatch[1];
    let value = kvMatch[2].replace(/,\s*$/, '').trim();

    // 处理模板字符串（反引号）
    if (value.startsWith('`')) {
      // 收集整个模板字符串
      let fullValue = value;
      while (!fullValue.endsWith('`') || fullValue === '`') {
        i++;
        fullValue += '\n' + lines[i];
      }
      result[key] = fullValue;
    } else if (value.startsWith('"') && value.endsWith('"')) {
      result[key] = value.slice(1, -1);
    } else if (value.startsWith('Config.')) {
      result[key] = value; // 保留特殊值
    } else {
      result[key] = value;
    }
  }

  i++;
}

writeFileSync('e:/lixycode/dynamicform/src/lang/zh_cn_keys.json', JSON.stringify(result, null, 2), 'utf-8');
console.log(`Total keys: ${Object.keys(result).length}`);
