<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :formItem="field"
                       :parentField="parentField">
    <div class="user_html" v-html="field.preps['content']"/>
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
    context.attrs['formFieldList'][field.preps['name']] = field.preps['content'];
    const keyEnterFun = (prep: any) => {
      if (field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formFieldList'][field.preps['name']], context.attrs['formFieldList']["xh"]);
      }
      context.emit('selfFunc', prep);
    };
    return {parentField, formFieldList, context, field, formItem, dataField, keyEnterFun}
  }
});
</script>
<style lang="scss" scoped>
.user_html {
  width: 100%;
  min-height: 30px;
  height: auto;
}
</style>
