<template>
  <starhorse-form-item  :form-item = "field" :parentField = "parentField">
    <el-checkbox-group
        :fid = "field.preps['name']"
        :disabled = "field.preps['disabled']=='yes'"
        :readonly = "field.preps['readonly']=='yes'"
        :size="field?.preps['size']||'small'"
        v-model = "context.attrs['formFieldList'][field.preps['name']]">
      <el-checkbox :border = "item['border']=='yes'"
                   :checked = "item['checked']=='yes'"
                   :disabled = "item['disabled']=='yes'"
                   :label = "item['label']"
                   :value="item['trueLabel']"
                   v-for = "item in field.preps['values']">

      </el-checkbox>
    </el-checkbox-group>
  </starhorse-form-item>
</template>

<script lang = "ts">
import {defineComponent, shallowRef} from "vue";

export default defineComponent({
  setup(props, context) {
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