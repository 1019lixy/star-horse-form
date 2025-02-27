<script setup lang="ts">
import {onMounted, ref} from 'vue';
// import * as monaco from 'monaco-editor';
// import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

const containerRef = ref();
// const editor = ref<IStandaloneCodeEditor>();
const init = () => {
  //
  // editor.value = monaco.editor.create(containerRef.value, {
  //   minimap: {
  //     enabled: false
  //   },
  //   language: 'java',
  //   folding: true,
  //   lineDecorationsWidth: 35,
  //   wordWrap: 'on',
  //   theme: 'vs-dark',
  //   colorDecorators: true,
  //   fontFamily: 'JetBrainsMono, Consolas, "Courier New",monospace, 微软雅黑',
  //   fontSize: 14,
  //   fontLigatures: true,
  //   renderWhitespace: 'none',
  //   // 自动调整大小
  //   automaticLayout: true,
  // });
  // editor.value.addAction({
  //   id: 'editor.action.triggerSuggest.extension',
  //   label: '触发代码提示',
  //   precondition: '!suggestWidgetVisible && !markersNavigationVisible && !parameterHintsVisible && !findWidgetVisible',
  //   run: () => {
  //     editor.value!.trigger(null, 'editor.action.triggerSuggest', {})
  //   }
  // });
  // // CommandsRegistry.registerCommand('editor.action.scrollUp1Line', () => {
  // //   this.editor.setScrollTop(this.editor.getScrollTop() - 22)
  // // })
  // editor.value.addCommand(
  //     monaco.KeyMod.Alt | monaco.KeyCode.US_SLASH,
  //     () => {
  //       let triggerParameterHints = editor.value!.getAction('editor.action.triggerParameterHints')!;
  //       let triggerSuggest = editor.value!.getAction('editor.action.triggerSuggest.extension')!;
  //       triggerParameterHints.run().then(() => {
  //         setTimeout(() => {
  //           if (triggerSuggest.isSupported()) {
  //             triggerSuggest.run()
  //           }
  //         }, 0)
  //       })
  //     },
  //     '!findWidgetVisible && !inreferenceSearchEditor && !editorHasSelection'
  // )

};
onMounted(() => {
  init();
});
</script>

<template>
  <div class="box" ref="containerRef"></div>
</template>

<style lang="scss" scoped>
.box {
  width: 100%;
  height: 100%;
  border: 1px #056768 solid;
  border-radius: 10px;
  position: relative;
}
</style>

