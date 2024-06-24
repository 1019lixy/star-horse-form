<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :form-item="field" :parentField="parentField"
  >
    <el-slider
        :fid="field.preps['name']"
        :disabled="field.preps['disabled']=='Y'"
        :format-tooltip="field.preps['formatTooltip']=='Y'"
        :format-value-text="field.preps['formatValueText']"
        :height="field.preps['height']"
        :input-size="field.preps['inputSize']"
        :aria-label="field.preps['label']"
        :marks="field.preps['marks']"
        :max="field.preps['max']"
        :min="field.preps['min']"
        :range="field.preps['range']=='Y'"
        :range-end-label="field.preps['rangeEndLabel']"
        :range-start-label="field.preps['rangeStartLabel']"
        :show-input="field.preps['showInput']=='Y'"
        :show-input-controls="field.preps['showInputControls']=='Y'"
        :show-stops="field.preps['showStops']=='Y'"
        :show-tooltip="field.preps['showTooltip']=='Y'"
        :size="field?.preps['size']||'small'"
        :step="field.preps['step']"
        @change="keyEnterFun"
        v-model="context.attrs['formFieldList'][field.preps['name']]"
    />
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, onMounted, shallowRef} from "vue";
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
    onMounted(() => {
      keyEnterFun();
    })
    return {parentField, formFieldList, context, field, formItem, dataField, keyEnterFun}
  }
});
</script>
<style scoped>
</style>
