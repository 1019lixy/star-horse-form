<template>
  <starhorse-form-item :formDatas="formDatas" :form-item="field" :parentCompType="parentCompType"
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
        :size="field.preps['size']"
        :start-placeholder="field.preps['startPlaceholder']||'请选择开始'+field.preps['label']"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter="keyEnterFun"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model="context.attrs['formFieldList'][field.preps['name']]"
    />

  </starhorse-form-item>
</template>

<script lang="ts">
import {defineComponent, onMounted, shallowRef} from "vue";

export default defineComponent({
  setup(props, context) {

    const parentCompType = context.attrs["parentCompType"];
    const formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    const formDatas = context.attrs["formDatas"];
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let actionName = shallowRef("keydown.enter");
    onMounted(() => {
      actionName.value = field.preps["actionName"];
    });
    const keyEnterFun = (prep: String) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formFieldList'][field.preps['name']],context.attrs['formFieldList']["xh"]);
      }
      context.emit('selfFunc', prep);
    };
    const selectItem = (data: any) => {
      context.emit('selectItem', data, parentCompType)
    };
    return {
      parentCompType, formFieldList, context, field, formItem, formDatas,
      dataField, selectItem, keyEnterFun, actionName
    }
  }
});
</script>

<style scoped>

</style>