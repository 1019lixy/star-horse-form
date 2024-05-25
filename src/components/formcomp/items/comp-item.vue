<template>
  <component :is="context.attrs['field'].preps['name']"
             :nodeFieldList="field['preps']['params']['nodeFieldList']"
             :lineFieldList="field['preps']['params']['lineFieldList']"
             :customerItems="field['preps']['params']['nodeList']"
             :readonly="field['preps']['readonly']=='yes'"
  />
</template>

<script lang="ts">
import {defineComponent, shallowRef} from "vue";

export default defineComponent({
  setup(props, context) {
    console.log("this is comp-item")
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