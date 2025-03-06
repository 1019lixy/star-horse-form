<template>
  <component
      :is="context.attrs['field'].preps['name']"
      :isDesign="context.attrs['isDesign']"
      :bareFlag="context.attrs['bareFlag']"
      :nodeFieldList="field['preps'].params?.nodeFieldList"
      :lineFieldList="field['preps'].params?.lineFieldList"
      :customerItems="field['preps'].params?.nodeList"
      :readonly="field['preps']['readonly'] == 'Y'"
      :preps="field['preps']"
      v-model:dataForm="context.attrs['formData']"
  />
</template>
<script lang="ts">
import {defineComponent, shallowRef} from "vue";

export default defineComponent({
  setup(_props, context) {
    console.log("this is comp-item",context);
    const parentField = context.attrs["parentField"];

    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: "input", required: false});
    let dataField = shallowRef("");
    return {parentField, context, field, formItem, dataField};
  }
});
</script>
<style scoped></style>
