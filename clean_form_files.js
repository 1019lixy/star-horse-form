import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 需要删除的属性列表
const propertiesToRemove = [
  'idFormItems', 'version', 'tenantId', 'createdBy', 'createdTime', 
  'updatedBy', 'updatedTime', 'dataNo', 'statusCode', 'statusName', 
  'isDel', 'local', 'idFormFields','idFormActions'
];

// 要处理的文件列表
const filesToProcess = [
  'src/components/system/items/form/composables/formContainer.ts',
  'src/components/system/items/form/composables/formExtendItems.ts',
  'src/components/system/items/form/composables/formItems.ts'
];

// 递归删除指定属性
function removeProperties(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => removeProperties(item));
  } else if (obj && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      if (!propertiesToRemove.includes(key)) {
        result[key] = removeProperties(obj[key]);
      }
    }
    return result;
  }
  return obj;
}

// 获取当前目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 处理每个文件
filesToProcess.forEach(filePath => {
  const absolutePath = path.join(__dirname, filePath);
  try {
    console.log(`处理文件: ${filePath}`);
    
    // 读取文件内容
    let content = fs.readFileSync(absolutePath, 'utf8');
    
    // 解析JSON内容
    let data;
    try {
      // 尝试直接解析
      data = JSON.parse(content);
    } catch (e) {
      // 如果解析失败，可能是因为文件内容不是纯JSON
      // 尝试更宽松的解析方式
      console.log(`尝试修复文件格式: ${filePath}`);
      // 移除可能的注释和额外字符
      content = content.replace(/\/\*[\s\S]*?\*\//g, '');
      content = content.replace(/\/\/.*$/gm, '');
      // 尝试再次解析
      data = JSON.parse(content);
    }
    
    // 删除指定属性
    const cleanedData = removeProperties(data);
    
    // 将清理后的数据写回文件
    fs.writeFileSync(absolutePath, JSON.stringify(cleanedData, null, 2), 'utf8');
    
    console.log(`文件处理完成: ${filePath}`);
  } catch (error) {
    console.error(`处理文件 ${filePath} 时出错:`, error.message);
  }
});

console.log('所有文件处理完成！');