<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field" :parentField="parentField"
  >
    <VueOfficeExcel :fid="field.preps['name']" :src="field['docUrl']" @rendered="rendered"/>
  </starhorse-form-item>
</template>
<script lang="ts" name="excelItem">
import {defineComponent, onMounted, shallowRef} from "vue";
export default defineComponent({
  setup(props, context) {
    const parentField = context.attrs["parentField"];

    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    const keyEnterFun = () => {
      context.emit('selfFunc');
    };
    const init = async () => {
    };
    const rendered = () => {
    };
    onMounted(() => {
      init();
    });
    return {parentField,  context, field, formItem, dataField, keyEnterFunrendered}
  }
});
</script>
<style scoped>
</style>
