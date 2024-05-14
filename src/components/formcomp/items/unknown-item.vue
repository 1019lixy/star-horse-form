<template>
  未知组件。。。。。。。。。。。。。。。
</template>

<script lang = "ts">
import {defineComponent, shallowRef} from "vue";

export default defineComponent({
  setup(props, context) {

    const parentCompType = context.attrs["parentCompType"];
    const formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    const selectItem = (data: any) => {
      context.emit('selectItem', data, parentCompType)
    };
    return {parentCompType, formFieldList, context, field, formItem,  dataField, selectItem}
  }
});
</script>

<style scoped>

</style>