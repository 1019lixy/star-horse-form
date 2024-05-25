<template>
  <starhorse-form-item :form-item="field" :parentField="parentField"
  >
    <el-radio-group
        :fid="field.preps['name']"
        :disabled="field.preps['disabled']=='yes'"
        :readonly="field.preps['readonly']=='yes'"
        :max="field.preps['max']"
        :min="field.preps['min']"
        :size="field?.preps['size']||'small'"
        :text-color="field.preps['textColor']"
        @change="keyEnterFun"
        v-model="context.attrs['formFieldList'][field.preps['name']]"
    >
      <el-radio :border="item['border']=='yes'"
                :checked="item['checked']"
                :disabled="item['disabled']=='yes'"
                :label="item['label']"
                :value="item['trueLabel']"
                v-for="item in field.preps['values']"
      >

      </el-radio>
    </el-radio-group>
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
    const keyEnterFun = () => {
      context.emit('selfFunc');
    };

    return {parentField, formFieldList, context, field, formItem, dataField, keyEnterFun}
  }
});
</script>

<style scoped>

</style>