<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field" :parentField="parentField"
  >
    <el-input-number
        :fid="field.preps['name']"
        :controls-position="field.preps['controlsPosition']"
        :disabled="field.preps['disabled']=='Y'"
        :max="field.preps['max']||Infinity"
        :min="field.preps['min']||-Infinity"
        :name="field.preps['name']"
        :clearable="field.preps['clearable']=='Y'"
        :placeholder="field.preps['placeholder']||'请输入'+field.preps['label']"
        :precision="field.preps['precision']"
        :readonly="field.preps['readonly']=='Y'"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'default'"
        :step="field.preps['step']"
        :step-strictly="field.preps['stepStrictly']=='Y'"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter="keyEnterFun(null)"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model="context.attrs['formData'][field.preps['name']]"
    />
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, onMounted, shallowRef} from "vue";

export default defineComponent({
  setup(_props, context) {
    const parentField = context.attrs["parentField"];

    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let actionName = shallowRef("keydown.enter");
    const keyEnterFun = (prep: string) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formData'][field.preps['name']], context.attrs['formData']["xh"]);
      }
      context.emit('selfFunc', prep);
    };
    onMounted(() => {
      actionName.value = field.preps["actionName"];
      if (!context.attrs["isSearch"]) {
        keyEnterFun(actionName.value);
      }
    });
    return {
      parentField,  context, field, formItem, dataField, actionName,
      keyEnterFun
    }
  }
});
</script>
<style lang="scss" scoped>
.el-input-number {
  width: 100%;
}
</style>
