<template>
  <el-card class="box-card" style="height: 100%;width: 100%">
    <h3>功能建设中。。。</h3>
<!--    <div ref="editorContainer" style="height:100%;"></div>-->
  </el-card>
</template>
<script setup lang="ts">
import {onMounted, ref} from "vue";
/*import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import * as monaco from 'monaco-editor';*/

/*const editorContainer = ref<any>(null)
const editor = ref<any>(null)*/
onMounted(() => {
 /* self.MonacoEnvironment = {
    getWorker(_: string, label: string) {
      if (label === 'json') {
        return new jsonWorker()
      }
      if (['css', 'scss', 'less'].includes(label)) {
        return new cssWorker()
      }
      if (['html', 'handlebars', 'razor'].includes(label)) {
        return new htmlWorker()
      }
      if (['typescript', 'javascript'].includes(label)) {
        return new tsWorker()
      }
      return new EditorWorker()
    },
  }
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  })
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
  });

  editor.value = monaco.editor.create(editorContainer.value, {
    theme: "hc-black", // 主题
    language: "java",
    // renderLineHighlight: "gutter",
    // folding: true, // 是否折叠
    // roundedSelection: false,
    // foldingHighlight: true, // 折叠等高线
    // foldingStrategy: "indentation", // 折叠方式  auto | indentation
    // showFoldingControls: "always", // 是否一直显示折叠 always | mouseover
    // disableLayerHinting: true, // 等宽优化
    // emptySelectionClipboard: false, // 空选择剪切板
    // selectionClipboard: false, // 选择剪切板
    // automaticLayout: true, // 自动布局
    // codeLens: true, // 代码镜头
    // scrollBeyondLastLine: false, // 滚动完最后一行后再滚动一屏幕
    // colorDecorators: true, // 颜色装饰器
    // accessibilitySupport: "on", // 辅助功能支持  "auto" | "off" | "on"
    // lineNumbers: "on", // 行号 取值： "on" | "off" | "relative" | "interval" | function
    // lineNumbersMinChars: 5, // 行号最小字符   number
    // readOnly: false, //是否只读  取值 true | false
  })*/
})

</script>
<style lang="scss" scoped>
:deep(.el-card__body) {
  height: 100%;
}
</style>
