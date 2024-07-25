<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :form-item="field" :parentField="parentField">
    <el-checkbox-group
        :fid="field.preps['name']"
        :disabled="field.preps['disabled']=='Y'"
        :readonly="field.preps['readonly']=='Y'"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'small'"
        v-model="context.attrs['formData'][field.preps['name']]">
      <el-checkbox :border="item['border']=='Y'"
                   :checked="item['checked']=='Y'"
                   :disabled="item['disabled']=='Y'"
                   :label="item['label']"
                   :value="item['trueLabel']"
                   v-for="item in field.preps['values']">
      </el-checkbox>
    </el-checkbox-group>
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, shallowRef} from "vue";
export default defineComponent({
  setup(props, context) {
    const parentField = context.attrs["parentField"];

    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    return {parentField,  context, field, formItem, dataField}
  }
});
</script>
<style scoped>
</style>
