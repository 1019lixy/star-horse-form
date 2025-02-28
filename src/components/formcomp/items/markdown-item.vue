<template>
  <starhorse-form-item
    :isDesign="context.attrs['isDesign']"
    :bareFlag="context.attrs['bareFlag']"
    :form-item="field"
    :parentField="parentField"
  >
    <v-md-editor
      v-model="context.attrs['formData'][field.preps['name']]"
      :mode="field.preps['mode'] || 'edit'"
      :height="field.preps['height'] || ''"
      :tab-size="field.preps['tabSize'] || 2"
      :toc-nav-position-right="field.preps['tocNavPositionRight'] == 'Y'"
      :default-show-toc="field.preps['defaultVisibleToc'] == 'Y'"
      :placeholder="field.preps['placeholder'] || '请输入' + field.preps['label']"
      :autofocus="field.preps['autofocus'] == 'Y'"
      :default-fullscreen="field.preps['defaultFullscreen'] == 'Y'"
      :include-level="field.preps['includeLevel'] || [2, 3]"
      :left-toolbar="field.preps['leftToolbar'] || defaultLeftToolBar"
      :right-toolbar="field.preps['rightToolbar'] || defaultRightToolBar"
      :toolbar="field.preps['toolbar'] || {}"
      class="markdown-editor"
    />
  </starhorse-form-item>
</template>
<script lang="ts" name="markdown">
  import { defineComponent, onMounted, onUpdated, ref, shallowRef } from "vue";
  import { allAction } from "@/components/formcomp/utils/ItemRelationEventUtils.ts";

  export default defineComponent({
    setup(_props, context) {
      const parentField = context.attrs["parentField"];

      const field = context.attrs["field"] as any;
      let formItem = shallowRef({ label: "input", required: false });
      let dataField = shallowRef("");
      let defaultLeftToolBar = shallowRef<string>(
        "undo redo clear | h bold italic strikethrough quote | ul ol table hr | link image code"
      );
      let defaultRightToolBar = shallowRef<string>("preview toc sync-scroll fullscreen");
      let markdownEditor = ref();
      const itemAction = () => {
        allAction(context, "change");
      };
      const init = async () => {};
      onMounted(() => {
        init();
      });
      onUpdated(() => {
        init();
      });
      return {
        parentField,
        context,
        field,
        formItem,
        dataField,
        markdownEditor,
        itemAction,
        defaultLeftToolBar,
        defaultRightToolBar
      };
    }
  });
</script>
<style lang="scss" scoped>
  .v-md-editor {
    width: 100% !important;
    min-height: 400px !important;

    :deep(.vditor-toolbar) {
      padding-left: unset !important;
    }
  }
</style>
