<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField">
    <v-md-editor v-model="context.attrs['formData'][field.preps['name']]" class="markdown-editor"

    />
  </starhorse-form-item>
</template>
<script lang="ts" name="markdown">
import {defineComponent, onMounted, onUpdated, ref, shallowRef} from "vue";
import {allAction} from "@/components/formcomp/utils/ItemRelationEventUtils.ts";


export default defineComponent({
  setup(_props, context) {
    const parentField = context.attrs["parentField"];

    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let markdownEditor = ref();
    const itemAction = () => {
     allAction(context,"change")
    };
    const init = async () => {

    };
    onMounted(() => {
      init();
    });
    onUpdated(() => {
      init();
    })
    return {parentField, context, field, formItem, dataField, markdownEditor, itemAction}
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
