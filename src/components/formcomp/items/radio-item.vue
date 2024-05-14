<template>
  <starhorse-form-item  :form-item = "field" :parentCompType = "parentCompType"
  >
    <el-radio-group
        :fid = "field.preps['name']"
        :disabled = "field.preps['disabled']=='yes'"
        :readonly = "field.preps['readonly']=='yes'"
        :fill = "field.preps['fill']"
        :label = "field.preps['label']"
        :max = "field.preps['max']"
        :min = "field.preps['min']"
        :size = "field.preps['size']"
        :text-color = "field.preps['textColor']"
        @keydown.enter = "keyEnterFun"
        v-model = "context.attrs['formFieldList'][field.preps['name']]"
    >
      <el-radio :border = "item['border']=='yes'"
                :checked = "item['checked']"
                :disabled = "item['disabled']=='yes'"
                :false-label = "item['falseLabel']"
                :label = "item['name']"
                :true-label = "item['trueLabel']"
                :value="item['value']"
                v-for = "item in field.preps['values']"
      >

      </el-radio>
    </el-radio-group>
  </starhorse-form-item>
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
    const keyEnterFun = () => {
      context.emit('selfFunc');
    };
    const selectItem = (data: any) => {
      context.emit('selectItem', data, parentCompType)
    };
    return {parentCompType, formFieldList, context, field, formItem,  dataField, selectItem,keyEnterFun}
  }
});
</script>

<style scoped>

</style>