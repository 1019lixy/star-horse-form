<script setup lang = "ts" name = "CodeJs6">
import {reactive, ref, toRefs, markRaw} from "vue";
import {basicSetup} from 'codemirror';
import {EditorView, keymap} from '@codemirror/view';
import {EditorState} from '@codemirror/state';
import {sql} from '@codemirror/lang-sql';
import {javascript} from "@codemirror/lang-javascript";

const sqlLang = markRaw(sql());

// const {proxy} = getCurrentInstance();
const allKeyList = ref([]);
const groupList = ref([]);
const group = ref("");
const data = reactive({
  form: {},
});
const {form} = toRefs(data);
let editor = null;

// 获取自定义提示内容
function getCommandList() {
  groupList.value = [];
  allKeyList.value = [];
}

// 代码美化
function codeBeauty() {

}

// 获取当前编辑器中的内容字符串
function getCommanContent() {
  let str = ""
  editor.state.doc.children.forEach((el, index) => {
    str += el.text.join("\n") + "\n"
  })
  return str.slice(0, -1);
}

// 初始化编辑器
function initCodeContent() {
  setTimeout(() => {
    if (!editor) {
      editor = new EditorView({
        doc: "Press Ctrl-Space in here...\n",
        extensions: [
          basicSetup,
          // javascript(),
          sqlLang,
          // EditorView.updateListener.of((v) => {
          //   console.log(v.state.doc.toString())
          // }),
        ],
        parent: document.getElementById("coder"),
        options: {
          lineNumbers: true,
          line: true,
          //ctrl-space唤起智能提示
          extraKeys: {
            Ctrl: "autocomplete",
          },
          //括号匹配
          matchBrackets: true,
        },
      });
    }
    editor.dispatch({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: form.value.commandContent || "Press Ctrl-Space in here...\n"
      },
    });
  }, 500);
}

// 自定义的代码不全，options为自定义内容，以@开头进行匹配
function myCompletions(context) {
  let word = context.matchBefore(/@\w*/);
  if (!word && !context.explicit) return null;
  return {
    from: word.from ? word.from : context.pos,
    options: allKeyList.value,
  };
}

// 选择分组添加到编辑其中
function insertGroup() {
  insertCommandContant(group.value);
  group.value = "";
}

// 外部输入内容，添加到编辑器当前光标(或选中内容)所在的位置
function insertCommandContant(insertContent) {
  editor.dispatch({
    changes: {
      from: editor.state.selection.ranges[0].from,
      to: editor.state.selection.ranges[0].to,
      insert: insertContent
    },
  });
}

/** 提交按钮 */
function submitForm() {
  // proxy.$modal.loading("正在保存，请稍候...");
}

getCommandList();
initCodeContent();
</script>
<template>
  <el-select
      placeholder = "请选择分组"
      v-model = "group"
      clearable
      @change = "insertGroup"
  >
    <el-option
        v-for = "dict in groupList"
        :key = " dict.id"
        :label = "dict.dgName + '(' + dict.dgCode + ')'"
        :value = "dict.dgCode"
    ></el-option>
  </el-select>
  <el-button @click = "codeBeauty" style = "margin-bottom: 0.5rem">代码格式化</el-button>
  <div id = "coder"></div>
  <el-button type = "primary" @click = "submitForm">确 定</el-button>
</template>
<style scoped>
#coder {
  margin-top: 10px;
  width: 100%;
  height: 100%;
}
</style>