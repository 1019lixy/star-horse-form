<template>
  <starhorse-form-item :formDatas = "formDatas" :form-item = "field" :parentCompType = "parentCompType"
  >
    <el-input-number
        :fid = "field.preps['name']"
        :controls-position = "field.preps['controlsPosition']"
        :disabled = "field.preps['disabled']=='yes'"
        :label = "field.preps['label']"
        :max = "field.preps['max']||Infinity"
        :min = "field.preps['min']||-Infinity"
        :name = "field.preps['name']"
        :clearable = "field.preps['clearable']=='yes'"
        :placeholder = "field.preps['placeholder']||'请输入'+field.preps['label']"
        :precision = "field.preps['precision']"
        :readonly = "field.preps['readonly']=='yes'"
        :size = "field.preps['size']"
        :step = "field.preps['step']"
        :step-strictly = "field.preps['stepStrictly']=='yes'"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter = "keyEnterFun(null)"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model = "context.attrs['formFieldList'][field.preps['name']]"
    />

  </starhorse-form-item>
</template>

<script lang = "ts">
import {defineComponent, shallowRef} from "vue";
import {onMounted} from "vue/dist/vue";

export default defineComponent({
  setup(props, context) {

    const parentCompType = context.attrs["parentCompType"];
    const formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    const formDatas = context.attrs["formDatas"];
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let actionName = shallowRef("keydown.enter");
    onMounted(() => {
      actionName.value = field.preps["actionName"];
    });
    const keyEnterFun = (prep:String) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formFieldList'][field.preps['name']],context.attrs['formFieldList']["xh"]);
      }
      context.emit('selfFunc',prep);
    };
    const selectItem = (data: any) => {
      context.emit('selectItem', data, parentCompType)
    };
    return {parentCompType, formFieldList, context, field, formItem, formDatas, dataField,actionName,
      selectItem,keyEnterFun}
  }
});
</script>

<style scoped>

</style>