<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :form-item="field" :parentField="parentField"
  >
    <el-rate
        :fid="field.preps['name']"
        :allow-half="field.preps['allowHalf']=='Y'"
        :clearable="field.preps['clearable']=='Y'"
        :colors="field.preps['colors']"
        :disabled="field.preps['disabled']=='Y'"
        :disabled-void-color="field.preps['disabledVoidColor']"
        :high-threshold="field.preps['highThreshold']"
        :low-threshold="field.preps['lowThreshold']"
        :max="field.preps['max']"
        :score-template="field.preps['scoreTemplate']"
        :show-score="field.preps['showScore']=='Y'"
        @change="keyEnterFun"
        :show-text="field.preps['showText']=='Y'"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'small'"
        :text-color="field.preps['textColor']"
        :texts="field.preps['texts']"
        :void-color="field.preps['voidColor']"
        v-model="context.attrs['formData'][field.preps['name']]"
    />
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, onMounted, shallowRef} from "vue";
export default defineComponent({
  setup(props, context) {
    const parentField = context.attrs["parentField"];

    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    const keyEnterFun = () => {
      context.emit('selfFunc');
    };
    onMounted(() => {
      keyEnterFun();
    });
    return {parentField,  context, field, formItem, dataField, keyEnterFun}
  }
});
</script>
<style scoped>
</style>
