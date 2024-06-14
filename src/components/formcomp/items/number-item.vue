<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :form-item="field" :parentField="parentField"
  >
    <el-input-number
        :fid="field.preps['name']"
        :controls-position="field.preps['controlsPosition']"
        :disabled="field.preps['disabled']=='yes'"
        :max="field.preps['max']||Infinity"
        :min="field.preps['min']||-Infinity"
        :name="field.preps['name']"
        :clearable="field.preps['clearable']=='yes'"
        :placeholder="field.preps['placeholder']||'请输入'+field.preps['label']"
        :precision="field.preps['precision']"
        :readonly="field.preps['readonly']=='yes'"
        :size="field?.preps['size']||'small'"
        :step="field.preps['step']"
        :step-strictly="field.preps['stepStrictly']=='yes'"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter="keyEnterFun(null)"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model="context.attrs['formFieldList'][field.preps['name']]"
    />

  </starhorse-form-item>
</template>

<script lang="ts">
import {defineComponent, shallowRef, onMounted} from "vue";

export default defineComponent({
  setup(props, context) {

    const parentField = context.attrs["parentField"];
    const formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let actionName = shallowRef("keydown.enter");
    onMounted(() => {
      actionName.value = field.preps["actionName"];
    });
    const keyEnterFun = (prep: String) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formFieldList'][field.preps['name']], context.attrs['formFieldList']["xh"]);
      }
      context.emit('selfFunc', prep);
    };

    return {
      parentField, formFieldList, context, field, formItem, dataField, actionName,
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
