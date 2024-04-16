<script setup lang = "ts" name = "CodeJs6">
import {nextTick, onMounted, ref, reactive, toRefs} from "vue";
import {basicSetup} from 'codemirror';
import {EditorView, keymap} from "@codemirror/view"
import {historyKeymap, history} from "@codemirror/history";
import {insertTab, standardKeymap} from "@codemirror/commands";
import {autocompletion} from '@codemirror/autocomplete';
import {python} from "@codemirror/lang-python";
import {javascript} from "@codemirror/lang-javascript";
import {java} from "@codemirror/lang-java";
import {json} from "@codemirror/lang-json";
import {MariaSQL, MSSQL, MySQL, PLSQL, PostgreSQL, sql, StandardSQL} from "@codemirror/lang-sql";
import {oneDarkHighlightStyle, oneDarkTheme} from '@codemirror/theme-one-dark';
import {lineNumbers} from "@codemirror/gutter";

const model = defineModel("value", {default: ""});
const props = defineProps({
  funcName: {type: String, default: ""},
  fieldName: {type: String, default: ""},
  lang: {type: String, default: "sql"},
  theme: {type: String, default: "monokai"},
  boxHeight: {type: String, default: "95%"}
});
const editor = ref<EditorView>();
const codemirror = ref();

const allKeyList = ref([]);
const groupList = ref([]);
const group = ref("");
const data = reactive({
  form: {},
});
const {form} = toRefs(data);

// 获取自定义提示内容
const getCommandList = () => {
  groupList.value = [
    {id: '1', label: '分组1', value: 'group1'},
    {id: '2', label: '分组2', value: 'group2'},
  ];
  allKeyList.value = [
    {label: "match", type: "keyword", apply: "match", detail: "match"},
    {label: "hello", type: "variable", apply: "hello", detail: "hellodetail"},
    {label: "magic", type: "text", apply: "⠁⭒*.✩.*⭒⠁", detail: "macro"},
  ];
}

// 自定义的代码不全，options为自定义内容，以@开头进行匹配
const myCompletions = (context) => {
  let word = context.matchBefore(/\w*/);
  if (!word && !context.explicit) return null;
  console.log(word);
  return {
    from: word.from ? word.from : context.pos,
    options: allKeyList.value,
  };
}

// 选择分组添加到编辑其中
const insertGroup = () => {
  insertCommandContant(group.value);
  group.value = "";
}

// 外部输入内容，添加到编辑器当前光标(或选中内容)所在的位置
const insertCommandContant = (insertContent: any) => {
  editor.value.dispatch({
    changes: {
      from: editor.value.state.selection.ranges[0].from,
      to: editor.value.state.selection.ranges[0].to,
      insert: insertContent
    },
  });
}
const sqlType = {
  "mysql": MySQL,
  "mariadb": MariaSQL,
  "postgrel": PostgreSQL,
  "mssql": MSSQL,
  "oracle": PLSQL
};
const dialect = () => {

};
const currentValFun = (val: string) => {
  console.log(val);
};
const langInfo = () => {
  if (props.lang == "javascript") {
    return javascript();
  } else if (props.lang == "json") {
    return json();
  } else if (props.lang == "python") {
    return python();
  } else if (props.lang == "java") {
    return java();
  } else {
    // 如果是
    return sql({
      dialect: sqlType[props.lang] || StandardSQL,
      schema: []
    });
  }
};

/**
 * 初始化
 */
const init = async () => {
  getCommandList();
  if (typeof editor.value !== 'undefined') {
    if (editor.value instanceof EditorView) {
      editor.value.destroy();
    }
  }
  await nextTick(() => {
  });
  editor.value = new EditorView({
    doc: model.value,
    extensions: [
      basicSetup,
      oneDarkTheme,
      keymap.of([standardKeymap, historyKeymap, {key: "Tab", run: insertTab}]),
      langInfo(),
      autocompletion(),
      autocompletion({override: [myCompletions]}),
      EditorView.updateListener.of((v) => {
        if (v.docChanged) {
          model.value = v.state.doc.toString();
          currentValFun(v.state.doc.toString());
        }
      })
    ],
    parent: codemirror.value,
  });
};
onMounted(async () => {
  await nextTick(() => {
    init();
  });
})
</script>
<template>
  <div ref = "codemirror" class = "coder"></div>
</template>
<style lang = "scss" scoped>
.coder {
  font-size: 16px;
  width: 100%;
  height: v-bind(boxHeight);

  :deep(.cm-editor) {
    height: inherit;
  }
}
</style>