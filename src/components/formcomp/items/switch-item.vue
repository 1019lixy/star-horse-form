<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField"
  >
    <el-switch
        :fid="field.preps['name']"
        :active-color="field.preps['activeColor']"
        :active-text="field.preps['activeText']"
        :active-value="field.preps['activeValue']"
        :before-change="field.preps['beforeChange']"
        :disabled="field.preps['disabled']=='Y'"
        :inactive-color="field.preps['inactiveColor']"
        :inactive-text="field.preps['inactiveText']"
        :inactive-value="field.preps['inactiveValue']"
        :name="field.preps['name']"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'default'"
        :width="field.preps['width']"
        v-on:[actionName]="itemAction(field.preps['actionName'])"
        v-model="context.attrs['formData'][field.preps['name']]"
    />
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, onMounted, shallowRef} from "vue";

export default defineComponent({
  setup(_props, context) {
    const parentField = context.attrs["parentField"];

    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let actionName = shallowRef("change");
    const itemAction = (prep: any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formData'][field.preps['name']], context.attrs['formData']["xh"]);
      }
      console.log("switch", prep);
      context.emit('selfFunc', prep);
    };
    onMounted(() => {
      actionName.value = field.preps["actionName"];
      if (!context.attrs["isSearch"]) {
        itemAction(actionName.value);
      }
    });
    return {
      parentField, context, field, formItem, dataField, itemAction, actionName
    }
  }
});
</script>
<style scoped>
</style>
