<script setup lang = "ts" name = "CodeJs6">
import {nextTick, onMounted, reactive, ref} from "vue";
import {basicSetup} from 'codemirror';
import {EditorView, keymap} from "@codemirror/view";
import {Compartment} from "@codemirror/state";
import {historyKeymap} from "@codemirror/history";
import {insertTab, standardKeymap} from "@codemirror/commands";
import {autocompletion, startCompletion} from '@codemirror/autocomplete';
import {python} from "@codemirror/lang-python";
import {javascript, javascriptLanguage} from "@codemirror/lang-javascript";
import {java} from "@codemirror/lang-java";
import {json} from "@codemirror/lang-json";
import {yaml} from "@codemirror/lang-yaml";
import {css} from "@codemirror/lang-css";
import {vue} from "@codemirror/lang-vue";
import {html} from "@codemirror/lang-html";
import {cpp} from "@codemirror/lang-cpp";
import {xml} from "@codemirror/lang-xml";
import {markdown} from "@codemirror/lang-markdown";
import {go} from "@codemirror/lang-go";
import {linter} from "@codemirror/lint";
import {sql, SQLConfig} from "@codemirror/lang-sql";
import {amy, ayuLight, barf, bespin, birdsOfParadise, boysAndGirls, clouds, dracula} from 'thememirror';

const model = defineModel("value", {default: ""});
const editorLang = ref<any>(javascript());
const editorTheme = ref<any>(dracula);
const props = defineProps({
  funcName: {type: String, default: ""},
  fieldName: {type: String, default: ""},
  lang: {type: String, default: null},
  theme: {type: String, default: "dracula"},
  boxHeight: {type: String, default: "95%"}
});
const languageConf = new Compartment;
const completionList = ref<any>([]);
const config = ref<SQLConfig>({
  defaultSchema: "test",
  tables: [],
  defaultTable: "",
  schema: {}
});
const languages = ref<Array<any>>([
  {name: "Java", value: "java", obj: java(), icon: "setting"},
  {name: "Python", value: "python", obj: python(), icon: "setting"},
  {name: "JSON", value: "json", obj: json(), icon: "setting"},
  {name: "Sql", value: "sql", obj: sql(config.value), icon: "setting"},
  {name: "JavaScript", value: "javascript", obj: javascript(), icon: "setting"},
  {name: "Vue", value: "vue", obj: vue(), icon: "setting"},
  {name: "Css", value: "css", obj: css(), icon: "setting"},
  {name: "YAML", value: "yaml", obj: yaml(), icon: "setting"},
  {name: "XML", value: "xml", obj: xml(), icon: "setting"},
  {name: "Markdown", value: "markdown", obj: markdown(), icon: "setting"},
  {name: "Go", value: "go", obj: go(), icon: "setting"},
  {name: "C++", value: "cpp", obj: cpp(), icon: "setting"},
  {name: "Html", value: "html", obj: html(), icon: "setting"},
]);
const themesConf = new Compartment;
const themes = ref<Array<any>>([
  {name: "BirdsOfParadise", value: "birdsOfParadise", obj: birdsOfParadise, icon: "setting"},
  {name: "BoysAndGirls", value: "boysAndGirls", obj: boysAndGirls, icon: "setting"},
  {name: "Amy", value: "amy", obj: amy, icon: "setting"},
  {name: "AyuLight", value: "ayuLight", obj: ayuLight, icon: "setting"},
  {name: "Bespin", value: "bespin", obj: bespin, icon: "setting"},
  {name: "Clouds", value: "clouds", obj: clouds, icon: "setting"},
  {name: "Barf", value: "barf", obj: barf, icon: "setting"},
  {name: "Dracula", value: "dracula", obj: dracula, icon: "setting"},

]);
const editor = ref<EditorView>();
const codemirror = ref();

const customerTheme = (theme: string) => {
  let fdata = themes.value.find(item => item.value == theme);
  editorTheme.value = fdata.obj;
  editor.value?.dispatch({
    effects: themesConf.reconfigure(editorTheme.value)
  });
};

const currentValFun = (val: string) => {
  // console.log(val);
};
/**
 * 获取语言信息
 * @param lang
 */
const langInfo = (lang: string) => {
  let fdata = languages.value.find(item => item.value == lang);
  editorLang.value = fdata.obj;
  editor.value?.dispatch({
    effects: languageConf.reconfigure(editorLang.value)
  });
};
const updateList = (args: any) => {
  let change = args?.changes?.inserted[1]?.text[0];
  console.log(change);
  let changes = args?.changes?.sections[0];
  if (change == ".") {
    startCompletion(editor.value);
  }
}
const docCompletions = () => {
  // javascriptLanguage.data.of({
  //   autocompletion
  // });
};
/**
 * 初始化
 */
const init = async () => {
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
      themesConf.of(editorTheme.value),
      linter(),
      keymap.of([standardKeymap, historyKeymap, {key: "Tab", run: insertTab}]),
      languageConf.of(editorLang.value),
      autocompletion({activateOnTyping: true}),
      EditorView.updateListener.of((v) => {
        updateList(v);
        if (v.docChanged) {
          model.value = v.state.doc.toString();
          currentValFun(model.value);
        }
      })
    ],
    parent: codemirror.value,
  });
};
onMounted(async () => {
  await nextTick(() => {
    langInfo(props.lang || "javascript");
    init();
  });
});


const setAutoCompletion = (val: object) => {
  completionList.value.push(...Object.keys(val).map(item =>
      ({
        label: item,
        apply: item
      })
  ));
  config.value["tables"] = completionList.value;
  for(let key in completionList.value){
    let temp=completionList.value[key];
    config.value["schema"]["test."+temp.label]=[];
  }
  console.log(config.value);
  init();
};
defineExpose({
  editor, setAutoCompletion
})
</script>
<template>
  <el-dropdown>
    <span class = "el-dropdown-link">
      主题
      <el-icon class = "el-icon--right">
        <arrow-down/>
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click = "customerTheme(item.value)" v-for = "item in themes">
          <star-horse-icon :icon-class = "item.icon" color = "gray" size = "14px"/>
          {{ item.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <el-dropdown v-if = "!lang">
    <span class = "el-dropdown-link">
      语言
      <el-icon class = "el-icon--right">
        <arrow-down/>
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click = "langInfo(item.value)" v-for = "item in languages">
          <star-horse-icon :icon-class = "item.icon" color = "gray" size = "14px"/>
          {{ item.name }}
        </el-dropdown-item>

      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <div ref = "codemirror" class = "coder"></div>
</template>
<style lang = "scss" scoped>
.coder {
  font-size: 17px;
  width: 100%;
  height: v-bind(boxHeight);

  :deep(.cm-editor) {
    height: inherit;
  }
}
</style>