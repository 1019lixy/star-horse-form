#说明
   ```此动态表单组件(StarHorseForm) 是基于star-horse-lowcode 核心组件打造,一直用在内部系统中,
现单独拆分出来作为独立的组件使用，本人会利用业余时间逐步优化,此组件在本人项目中使用已趋于稳定，可根据实际情况进行建模使用。
```

#配置方法

在main.js 中引入以下代码
```
//加载star-horse-lowcode 和star-horse-form 的css文件
import "star-horse-lowcode/assets/index.css"
import "star-horse-form/assets/index.css"
import "element-plus/dist/index.css"
import {createApp} from 'vue'
import App from './App.vue'
//加载star-horse-form 表单组件
import StartHorseForm from 'star-horse-form';

const app = createApp(App);
//挂载到实例中
app.use(StartHorseForm, {});
app.mount('#app')
```
#在组件中使用
   ```
<script setup>
  import {StarHorseFormDesign,FormConfig} from "star-horse-form";
  const optional:FormConfig={};
</script>
<template>
      <StarHorseFormDesign :optional="optional"/>
    </template>
<style scoped>
</style>
   ``` 
#更新日志:
### v1.2.0
```
 - 升级内部组件，清理无用代码
```
### v1.3.0
```
 - 修复对话框超出高度显示异常
```
### v1.4.0
```
 - 修复optional 可选项没有赋值时报错的bug
```
### v1.5.0
```
 - 修复配置关联关系,表单不能选中的bug
```
### v1.6.0
```
 - 修复头部按钮区域自定义按钮不显示问题
```
### v1.7.0
```
 - 修复在full模式下快捷菜单列表不显示问题
```
### v1.7.1
```
- 增加PreviewDialog和DbListComp 组件导出
```
### v1.7.2
```
- 增加FormView 组件导出
```
### v1.8.0
```
- 优化列表容器禁止在单元格内显示标签
```
### v1.9.0
```
- 增加dialog 组件
```
### v2.0.0
```
- 增加DataSourceComp，DbListComp,FormMenuShot,WebUrlComp组件导出
```
### v2.0.0
```
- 更新star-horse-lowcode 版本
```
### v2.1.0
```
- 更新star-horse-lowcode 版本
--修复其它bug
```
### v2.1.2
```
- 更新star-horse-lowcode 版本
--table和box 容器展示bug,可通过此二者容器构建复杂的表单
```
