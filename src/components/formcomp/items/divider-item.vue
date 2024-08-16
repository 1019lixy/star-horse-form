<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :formItem="field"
                       :parentField="parentField">
    <el-divider :direction="field.preps['direction']||'horizontal'"
                :content-position="field.preps['contentPosition']||'center'">
      {{ field.preps['content'] }}
    </el-divider>
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, shallowRef} from "vue";

export default defineComponent({
  setup(_props, context) {
    const parentField = context.attrs["parentField"];

    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    context.attrs['formData'][field.preps['name']] = field.preps['content'];
    const keyEnterFun = (prep: any) => {
      if (field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formData'][field.preps['name']], context.attrs['formData']["xh"]);
      }
      context.emit('selfFunc', prep);
    };
    return {parentField,  context, field, formItem, dataField, keyEnterFun}
  }
});
</script>
<style scoped>
</style>
