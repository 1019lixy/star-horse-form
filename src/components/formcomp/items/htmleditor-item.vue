<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField"
  >
    <div style="border: 1px solid #ccc">
      <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig"
               mode="default"/>
      <Editor
          :style="{height: field.preps.height||'300px','overflow-y': 'hidden'}"
          @change="itemAction('change')"
          @input="itemAction('input')"
          @keydown.enter="itemAction('enter')"
          @focus="itemAction('focus')"
          @blur="itemAction('blur')"
          v-model="context.attrs['formData'][field.preps['name']]"
          :defaultConfig="editorConfig"
          mode="default"
          :fid="field.preps['name']"
          @onCreated="handleCreated"
      />
    </div>
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, getCurrentInstance, shallowRef} from "vue";
import "@wangeditor/editor/dist/css/style.css"
import {Editor, Toolbar} from "@wangeditor/editor-for-vue"
import {allAction} from "@/components/formcomp/utils/ItemRelationEventUtils.ts";

export default defineComponent({
  components: {Editor, Toolbar},
  beforeUnmount: () => {
    const {proxy} = getCurrentInstance()
    const editor = proxy.$refs.editorRef;
    if (editor == null) return;
    editor.destroy();
  },
  setup(_props, context) {
    const parentField = context.attrs["parentField"];

    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let editorConfig = shallowRef({});
    let toolbarConfig = shallowRef({});
    const editorRef = shallowRef() // 编辑器实例，必须用 shallowRef
    const dynamicFunction = (data: any) => {
      if (!data) {
        return;
      }
      let fun = new Function(data);
      fun();
    };
    const itemAction = (prep: any) => {
      allAction(context, prep);
    };
    toolbarConfig.value = {
      //excludeKeys: ["insertLink", "insertImage", "editImage", "viewImageLink", "insertVideo", "emotion", "fullScreen"],
    }
    editorConfig.value = {placeholder: "请输入内容...", MENU_CONF: {}}
    const handleCreated = (editor: any) => {
      editorRef.value = editor // 记录 editor 实例，重要！
    }
// 自定义上传
    editorConfig.value.MENU_CONF["uploadImage"] = {
      async customUpload(file, _insertFn) {
        let data = new FormData()
        data.append("from", "article");
        data.append("image", file);
        //
        // proxy.$axios
        //     .post("upload/image", data)
        //     .then((res) => {
        //       if (res.data.code == 0) {
        //         let url = proxy.imgUrl + res.data.data.path
        //         insertFn(url) // 最后插入图片 insertFn(url, alt, href)，alt：描述，href:链接，后面非必填
        //       } else {
        //         proxy.$util.messages(res.data.msg, "error")
        //       }
        //     })
        //     .catch((err) => {})
      },
    }
// 自定义上传视频
    const videoLoading = shallowRef(false)
    editorConfig.value.MENU_CONF["uploadVideo"] = {
      async customUpload(file, insertFn) {
        videoLoading.value = true
        let data = new FormData()
        data.append("file", file)
        // proxy.$axios
        //     .post("upload/video", data)
        //     .then((res) => {
        //       videoLoading.value = false
        //       if (res.data.code == 0) {
        //         let url = proxy.imgUrl + res.data.data.path
        //         insertFn(url) // 最后插入视频 insertFn(url poster)
        //       } else {
        //         proxy.$message({ message: res.data.msg, type: "error" })
        //       }
        //     })
        //     .catch((err) => {
        //       videoLoading.value = false
        //     })
      },
    }
// 组件销毁时，也及时销毁编辑器
    return {
      parentField, context, field, formItem, editorConfig, editorRef, toolbarConfig,
      dataField, dynamicFunction, itemAction, handleCreated
    }
  },
});
</script>
<style scoped>
</style>
