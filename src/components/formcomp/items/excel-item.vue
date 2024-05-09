<template>
  <starhorse-form-item :formDatas = "formDatas" :form-item = "field" :parentCompType = "parentCompType"
  >
    <VueOfficeExcel :fid = "field.preps['name']" :src = "field['docUrl']" @rendered = "rendered"/>
  </starhorse-form-item>
</template>

<script lang = "ts" name = "excelItem">
import {defineComponent, onMounted, shallowRef} from "vue";

export default defineComponent({
  setup(props, context) {
    const parentCompType = context.attrs["parentCompType"];
    const formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    const formDatas = context.attrs["formDatas"];
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    const keyEnterFun = () => {
      context.emit('selfFunc');
    };
    const selectItem = (data: any) => {
      context.emit('selectItem', data, parentCompType)
    };
    const init = async () => {

    };
    const rendered = () => {

    };
    onMounted(() => {
      init();
    });

    return {parentCompType, formFieldList, context, field, formItem, formDatas, dataField, selectItem, keyEnterFunrendered}
  }
});

</script>

<style scoped>

</style>