<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField"
  >
    <el-date-picker
        :fid="field.preps['name']"
        :clear-icon="field.preps['clearIcon']"
        :clearable="field.preps['clearable']=='Y'"
        :default-time="field.preps['defaultTime']"
        :default-value="field.preps['defaultValue']||new Date()"
        :disabled="!context.attrs['formData']['_'+field.preps['name']+'Editable']&&field.preps['disabled']=='Y'"
        :editable="field.preps['editable']=='Y'"
        :end-placeholder="field.preps['endPlaceholder']||'请选择结束日期'"
        :format="field.preps['format']||'YYYY-MM-DD HH:mm:ss'"
        date-format="YYYY-MM-DD"
        time-format="HH:mm"
        :type="field.preps['type']"
        :placeholder="field.preps['placeholder']||'请选择'+field.preps['label']"
        :range-separator="field.preps['rangeSeparator']"
        :readonly="field.preps['readonly']=='Y'"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'default'"
        :start-placeholder="field.preps['startPlaceholder']||'请选择开始日期'"
        :value-format="field.preps['valueFormat']||'YYYY-MM-DD'"
        @change="itemAction('change')"
        @input="itemAction('input')"
        @keydown.enter="itemAction('enter')"
        @focus="itemAction('focus')"
        @blur="itemAction('blur')"
        v-model="context.attrs['formData'][field.preps['name']]"
    ></el-date-picker>
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
    let actionName = shallowRef("keydown.enter");
    const itemAction = (prep: any) => {
      allAction(context, prep);
    };
    onMounted(() => {
      actionName.value = field.preps["actionName"];
      if (!context.attrs["isSearch"]) {
        itemAction(actionName.value);
      }
    });
    return {
      parentField, context, field, formItem,
      dataField, itemAction, actionName
    }
  }
});
</script>
<style scoped>
</style>
