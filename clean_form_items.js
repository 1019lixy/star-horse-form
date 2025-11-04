const fs = require('fs');
const path = require('path');

// 读取文件
const filePath = path.join(__dirname, 'src/components/system/items/form/composables/formItems.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 要删除的字段列表
const fieldsToRemove = [
  'idFormItems', 'version', 'tenantId', 'createdBy', 'createdTime', 
  'updatedBy', 'updatedTime', 'dataNo', 'statusCode', 'statusName', 
  'isDel', 'local', 'idFormFields', 'idFormActions'
];

// 使用正则表达式匹配并删除每个字段及其值
fieldsToRemove.forEach(field => {
  // 匹配模式："field": value,
  // 注意处理最后一个字段（没有逗号）的情况
  const regex = new RegExp(`\\s*"${field}":\s*["'\{\[\]\}\w\s\-:.,+/\\\\]*?(,|(?=\s*}))`, 'g');
  content = content.replace(regex, '$1');
});

// 清理多余的逗号
content = content.replace(/,\s*}/g, '}');
content = content.replace(/,\s*\]/g, ']');

// 写回文件
fs.writeFileSync(filePath, content, 'utf8');
console.log('所有指定字段已成功删除');