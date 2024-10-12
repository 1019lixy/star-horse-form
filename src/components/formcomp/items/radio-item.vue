<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField"
  >
    <el-radio-group
        :fid="field.preps['name']"
        :disabled="!context.attrs['formData']['_'+field.preps['name']+'Editable']&&field.preps['disabled'] == 'Y'"
        :readonly="field.preps['readonly']=='Y'"
        :max="field.preps['max']"
        :min="field.preps['min']"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'default'"
        :text-color="field.preps['textColor']"
        @change="itemAction"
        v-model="context.attrs['formData'][field.preps['name']]"
    >
      <el-radio-button v-if="field.preps.radioType='button'" :border="item['border']=='Y'"
                       :checked="item['checked']"
                       :disabled="item['disabled']=='Y'"
                       :label="item['name']"
                       :value="item['value']"
                       v-for="item in field.preps['values']"/>
      <el-radio v-else :border="item['border']=='Y'"
                :checked="item['checked']"
                :disabled="item['disabled']=='Y'"
                :label="item['name']"
                :value="item['value']"
                v-for="item in field.preps['values']"
      >
      </el-radio>
    </el-radio-group>
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, onMounted, shallowRef} from "vue";
import {allAction} from "@/components/formcomp/utils/ItemRelationEventUtils.ts";

export default defineComponent({
  setup(_props, context) {
    const parentField = context.attrs["parentField"];

    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    const itemAction = () => {
      allAction(context, "change");
    };
    onMounted(() => {
      allAction(context, "change", true);
    })
    return {parentField, context, field, formItem, dataField, itemAction}
  }
});
</script>
<style scoped>
</style>
