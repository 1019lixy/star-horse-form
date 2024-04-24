<template>
  <starhorse-form-item :formDatas="formDatas" :form-item="field" :parentCompType="parentCompType"
  >
    <el-rate
        :fid="field.preps['name']"
        :allow-half="field.preps['allowHalf']=='yes'"
        :clearable="field.preps['clearable']=='yes'"
        :colors="field.preps['colors']"
        :disabled="field.preps['disabled']=='yes'"
        :disabled-void-color="field.preps['disabledVoidColor']"
        :high-threshold="field.preps['highThreshold']"
        :low-threshold="field.preps['lowThreshold']"
        :max="field.preps['max']"
        :score-template="field.preps['scoreTemplate']"
        :show-score="field.preps['showScore']=='yes'"

        :show-text="field.preps['showText']=='yes'"
        :size="field.preps['size']"
        :text-color="field.preps['textColor']"
        :texts="field.preps['texts']"
        :void-color="field.preps['voidColor']"
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
    const keyEnterFun = () => {
      context.emit('selfFunc');
    };
    const selectItem = (data: any) => {
      context.emit('selectItem', data, parentCompType)
    };
    return {parentCompType, formFieldList, context, field, formItem, formDatas, dataField, selectItem}
  }
});
</script>

<style scoped>

</style>