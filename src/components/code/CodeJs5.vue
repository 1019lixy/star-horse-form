<template>
  <textarea ref="codemirror" v-model="code" style="font-size: 20px;"></textarea>
</template>
<script lang="ts" setup name="CodeJs">
import "@/api/codemirror_import";
import {onMounted, reactive, ref, watch} from "vue";
import {markRaw} from "@vue/reactivity";
import CodeMirror from "codemirror";
import {js_beautify} from "js-beautify";
const codemirror = ref();
const props = defineProps({
  value: {type: String, default: ""},
  funcName: {type: String, default: ""},
  fieldName: {type: String, default: ""},
  lang: {type: String, default: "javascript"},
  theme: {type: String, default: "monokai"},
  boxHeight: {type: String, default: "95%"}
});
const emits = defineEmits(["changeValue"]);
const code = ref("");
let editor = ref();
const exportCode = () => {
  return editor.value.getValue();
};
const completeAfter = (cm: any, pred: any) => {
  if (!pred || pred()) {
    setTimeout(function () {
      if (!cm.state.completionActive) {
        cm.showHint({
          completeSingle: false,
        });
      }
    }, 100);
  }
  return CodeMirror.Pass;
};
const dataFormat = () => {
  let val = editor.value.getValue();
  editor.value.setValue(js_beautify(val));
  editor.value.refresh();
};
const cmOptions = reactive({
  mode: props.lang, // 语言模式
  theme: props.theme, // 主题
  lineNumbers: true, // 显示行号
  smartIndent: true, //智能缩进
  indentUnit: 4, // 智能缩进单元长度为 4 个空格
  styleActiveLine: true, // 显示选中行的样式
  matchBrackets: true, //每当光标位于匹配的方括号旁边时，都会使其高亮显示
  autofocus: true,
  showCursorWhenSelecting: true,
  autoRefresh: true,
  autocorrect: true,
  spellcheck: true,
  autoCloseBrackets: true, // 在键入时自动关闭括号和引号
  hintOptions: {
    completeSingle: false,
  },
  lint: {
    esversion: 6
  },
  extraKeys: {
    //   // 自动补全的按键事件
    "Ctrl-Shift-F": dataFormat,
    ".": completeAfter,
    "Ctrl-Enter": "autocomplete",
    // "Alt-F": function (cm: any) {
    //   setFullScreen(cm, !cm.getOption("fullScreen"));
    // },
  },
  // 代码折叠
  gutters: [
    "CodeMirror-lint-markers",
    "CodeMirror-linenumbers",
    "CodeMirror-foldgutter",
  ],
  foldGutter: true, // 启用行槽中的代码折叠
  lineWrapping: true
});
const isFullScreen = (cm: any) => {
  return /\bCodeMirror-fullscreen\b/.test(cm.getWrapperElement().className);
};
const winHeight = () => {
  return window.innerHeight || (document.documentElement || document.body).clientHeight;
}
const setFullScreen = (cm: any, full: boolean) => {
  var wrap = cm.getWrapperElement(), scroll = cm.getScrollerElement();
  if (full) {
    wrap.className += " CodeMirror-fullscreen";
    scroll.style.height = winHeight() + "px";
    document.documentElement.style.overflow = "hidden";
  } else {
    wrap.className = wrap.className.replace(" CodeMirror-fullscreen", "");
    scroll.style.height = "";
    document.documentElement.style.overflow = "";
  }
  cm.refresh();
}
const init = () => {
  if (editor.value) {
    editor.value.toTextArea();
  }
  editor.value = markRaw(CodeMirror.fromTextArea(codemirror.value, cmOptions));
  editor.value.setSize("auto", props.boxHeight);
  editor.value.on("keyup", (cm: any, event: any) => {
    //A-Z 65-90
    //a-z 97-122
    if (!event.ctrlKey && event.keyCode >= 65 && event.keyCode <= 90) {
      // alert(22);
      cm.showHint({
        completeSingle: false,
      });
    }
  });
  // CodeMirror.connect(window, "resize", function() {
  //   let showing = document.body.getElementsByClassName("CodeMirror-fullscreen")[0];
  //   if (!showing) return;
  //   showing.CodeMirror.getScrollerElement().style.height = winHeight() + "px";
  // });
  setTimeout(() => {
    if (props.lang == "javascript" || props.lang == "js") {
      editor.value.setValue(js_beautify(props.value));
    } else {
      editor.value.setValue(props.value);
    }
    editor.value.refresh();
  }, 100);
};
watch(() => props.value, (newProps, oldProps) => {
  code.value = newProps;
  init();
}, {deep: true});
onMounted(() => {
  init();
});
defineExpose({
  exportCode, editor, eventName: props.fieldName,
});
</script>
<style lang="scss">
.CodeMirror-fullscreen {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
}
.cm-editor {
  min-height: 100px;
  border: 1px solid #ddd;
}
.cm-scroller {
  overflow: auto;
}
.CodeMirror, .CodeMirror-line {
  font-size: 16px;
  font-family: 微软雅黑 Arial;
}
.CodeMirror-hints, .CodeMirror-lint-tooltip {
  font-size: 16px;
  font-family: 微软雅黑 Arial;
  z-index: 3000 !important;
}
</style>
