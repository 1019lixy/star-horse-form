#说明
   ```此动态表单组件(StarHorseForm) 是基于star-horse-lowcode 核心组件打造,一直用在内部系统中,
现单独拆分出来作为独立的组件一起使用，在后期还会发布动态页面组件(StarHorsePage),是单独发布还是跟随此
组件发布目前还没考虑好,此组件由于是从内部项目中分离出来的，初期难免会有强业务的逻辑，或者和后端交互逻辑在里面，
本人会利用业余时间逐步进行优化,目前发布的版本不适合用于生产，如果现了解的，可以下载看看;
可用于生产的迭代在后期的迭代中会进行说明。
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