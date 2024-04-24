<template>
  <starhorse-form-item :formDatas="formDatas" :form-item="field" :parentCompType="parentCompType"
  >
    <el-switch
        :fid="field.preps['name']"
        :active-color="field.preps['activeColor']"
        :active-text="field.preps['activeText']"
        :active-value="field.preps['activeValue']"
        :before-change="field.preps['beforeChange']"
        :disabled="field.preps['disabled']=='yes'"
        :inactive-color="field.preps['inactiveColor']"
        :inactive-text="field.preps['inactiveText']"
        :inactive-value="field.preps['inactiveValue']"
        :name="field.preps['name']"
        :size="field.preps['size']"
        :width="field.preps['width']"
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