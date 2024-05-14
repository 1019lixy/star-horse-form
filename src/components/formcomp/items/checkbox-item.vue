<template>
  <starhorse-form-item  :form-item = "field" :parentCompType = "parentCompType">
    <el-checkbox-group
        :fid = "field.preps['name']"
        :disabled = "field.preps['disabled']=='yes'"
        :readonly = "field.preps['readonly']=='yes'"
        :fill = "field.preps['fill']"
        :label = "field.preps['label']"

        v-model = "context.attrs['formFieldList'][field.preps['name']]">
      <el-checkbox :border = "item['border']=='yes'"
                   :checked = "item['checked']=='yes'"
                   :disabled = "item['disabled']=='yes'"
                   :label = "item['name']"
                   :value="item['value']"
                   :key = "index"
                   v-for = "(item,index) in field.preps['values']">

      </el-checkbox>
    </el-checkbox-group>
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
    const selectItem = (data: any) => {
      context.emit('selectItem', data, parentCompType)
    };
    return {parentCompType, formFieldList, context, field, formItem, dataField, selectItem}
  }
});
</script>

<style scoped>

</style>