<template>
  <starhorse-form-item :formDatas="formDatas" :form-item="field" :parentCompType="parentCompType"
  >
    <el-slider
        :fid="field.preps['name']"
        :disabled="field.preps['disabled']=='yes'"
        :format-tooltip="field.preps['formatTooltip']=='yes'"
        :format-value-text="field.preps['formatValueText']"
        :height="field.preps['height']"
        :input-size="field.preps['inputSize']"
        :label="field.preps['label']"
        :marks="field.preps['marks']"
        :max="field.preps['max']"
        :min="field.preps['min']"
        :range="field.preps['range']=='yes'"
        :range-end-label="field.preps['rangeEndLabel']"
        :range-start-label="field.preps['rangeStartLabel']"
        :show-input="field.preps['showInput']=='yes'"
        :show-input-controls="field.preps['showInputControls']=='yes'"
        :show-stops="field.preps['showStops']=='yes'"
        :show-tooltip="field.preps['showTooltip']=='yes'"
        :size="field.preps['size']"
        :step="field.preps['step']"
        v-model="context.attrs['formFieldList'][field.preps['name']]"
    />

  </starhorse-form-item>
</template>

<script lang="ts">
import {defineComponent, shallowRef} from "vue";

export default defineComponent({
  setup(props, context) {

    const parentCompType = context.attrs["parentCompType"];
    const formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    const formDatas = context.attrs["formDatas"];
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    const selectItem = (data: any) => {
      context.emit('selectItem', data, parentCompType)
    };
    return {parentCompType, formFieldList, context, field, formItem, formDatas, dataField, selectItem}
  }
});
</script>

<style scoped>

</style>