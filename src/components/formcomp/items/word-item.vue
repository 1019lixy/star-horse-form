<template>
  <starhorse-form-item  :form-item = "field" :parentCompType = "parentCompType"
  >
    <VueOfficeDocx :fid = "field.preps['name']" :src = "field['docUrl']" @rendered = "rendered"/>
  </starhorse-form-item>
</template>

<script lang = "ts" name = "excelItem">
import {defineComponent, onMounted, shallowRef} from "vue";

export default defineComponent({
  setup(props, context) {
    const parentCompType = context.attrs["parentCompType"];
    const formFieldList = context.attrs["formFieldList"] as any;
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

    return {parentCompType, formFieldList, context, field, formItem,  dataField,  keyEnterFunrendered}
  }
});

</script>

<style scoped>

</style>