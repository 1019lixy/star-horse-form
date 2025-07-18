<template>
  <el-card class="box-card" style="height: 100%; width: 100%">
    <el-tabs v-model="general" v-if="visible" type="border-card">
      <el-tab-pane name="a" label="未接收">
        <pre>
          1. 点击“新建工作流”，进入新建工作流页面。
          2. 接入催办，撤回。

        </pre>

        <!--        <a href="https://blog.csdn.net/oa2000/article/details/106612615">工作流操作说明</a><br/>
        <a href="https://gitee.com/mengxin-no1/meeting-jie">在线会议</a><br/>
        <a href="https://tsai996.github.io/lowflow-design/">lowflow-design</a><br/>
        <a href="https://gitee.com/noear/liquor">Java 动态编译、表达式、脚本工具</a><br/>-->
      </el-tab-pane>
      <el-tab-pane name="b" label="办理中"></el-tab-pane>
      <el-tab-pane name="c" label="已办结"></el-tab-pane>
      <el-tab-pane name="d" label="关注中"></el-tab-pane>
      <el-tab-pane name="e" label="已挂起"></el-tab-pane>
      <el-tab-pane name="f" label="委托中"></el-tab-pane>
      <el-tab-pane name="g" label="全部工作"></el-tab-pane>
    </el-tabs>
  </el-card>
</template>
<script setup lang="ts">
import piniaCompInstance from "@/store";
import { useNavBarListStore } from "@/store/NavBarList";
import { computed, onMounted, ref } from "vue";
const viewListStore = useNavBarListStore(piniaCompInstance);
const navTagsList = computed(() => viewListStore.navTagsList);
let general = ref<string>("a");
let visible = ref<boolean>(true);
let matchList = ref<Array<any>>([
  // {
  //   id: "001",
  //   title: "验证。。。",
  //   start: "2024-10-29 00:00:00",
  //   end: "2024-10-30 18:59:59",
  //   backgroundColor: "#d8377a",
  //   borderColor: "#d8377a",
  // }
]);
onMounted(() => {
  // monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
  // monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
  //   noSemanticValidation: true,
  //   noSyntaxValidation: true,
  // })
  // monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  //   target: monaco.languages.typescript.ScriptTarget.ES2020,
  //   allowNonTsExtensions: true,
  // });
  // editor.value = monaco.editor.create(editorContainer.value, {
  //   theme: "hc-black", // 主题
  //   language: "javascript",
  //
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
  // });
});
</script>
<style lang="scss" scoped></style>
