<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField"
  >
    <el-time-picker
        :fid="field.preps['name']"
        :arrow-control="field.preps['arrowControl']"
        :clearable="field.preps['clearable']"
        :default-value="field.preps['defaultValue']"
        :disabled="field.preps['disabled']"
        :disabled-hours="field.preps['disabledHours']"
        :disabled-minutes="field.preps['disabledMinutes']"
        :disabled-seconds="field.preps['disabledSeconds']"
        :editable="field.preps['editable']"
        :end-placeholder="field.preps['endPlaceholder']||'请选择结束'+field.preps['label']"
        :format="field.preps['format']"
        :id="field.preps['id']"
        :is-range="field.preps['isRange']"
        :name="field.preps['name']"
        :placeholder="field.preps['placeholder']||'请选择'+field.preps['label']"
        :range-separator="field.preps['rangeSeparator']"
        :readonly="field.preps['readonly']"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'default'"
        :start-placeholder="field.preps['startPlaceholder']||'请选择开始'+field.preps['label']"
        v-on:[actionName]="itemAction(field.preps['actionName'])"
        @keydown.enter="itemAction"
        @focus="itemAction('focus')"
        @blur="itemAction('blur')"
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
    let actionName = shallowRef("keydown.enter");
    const itemAction = (prep: string) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formData'][field.preps['name']], context.attrs['formData']["xh"]);
      }
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
<style lang="scss" scoped>
.el-time-picker, .el-date-editor {
  width: unset;
}
</style>
