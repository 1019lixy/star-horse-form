<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField">
    <div ref="markdownEditor" class="markdown-editor"/>
  </starhorse-form-item>
</template>
<script lang="ts" name="markdown">
import {defineComponent, onMounted, shallowRef, ref, nextTick, onUpdated} from "vue";
import Vditor from "vditor";
import "vditor/src/assets/less/index.less"

export default defineComponent({
  setup(_props, context) {
    const parentField = context.attrs["parentField"];

    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let markdownEditor = ref();
    let vditor = ref<Vditor>(null);
    const keyEnterFun = () => {
      context.emit('selfFunc');
    };
    const init = async () => {
      await nextTick(() => {
        if (!vditor.value && markdownEditor.value) {
          vditor.value = new Vditor(markdownEditor.value, {
            cache: {
              enable: false
            },

          });
        }
      });
    };
    onMounted(() => {
      init();
    });
    onUpdated(() => {
      init();
    })
    return {parentField, context, field, formItem, dataField, markdownEditor, keyEnterFun}
  }
});
</script>
<style lang="scss" scoped>
.markdown-editor {
  width: 100% !important;
  min-height: 400px !important;

  :deep(.vditor-toolbar) {
    padding-left: unset !important;
  }
}

:deep(.vditor-reset) {
  padding: 10px !important;
}

</style>
