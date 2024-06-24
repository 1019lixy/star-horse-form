<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :form-item="field" :parentField="parentField"
  >
    未知组件。。。。。。。。。。。。。。。
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, shallowRef} from "vue";
export default defineComponent({
  setup(props, context) {
    const parentField = context.attrs["parentField"];
    const formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    return {parentField, formFieldList, context, field, formItem, dataField}
  }
});
</script>
<style scoped>
</style>
