<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :formItem="field"
                       :parentField="parentField"
  >
    <el-input
        :clearable="field.preps['clearable']=='Y'"
        :disabled="field.preps['disabled']=='Y'"
        :max="field.preps['max']"
        :maxlength="field.preps['maxlength']"
        :min="field.preps['min']"
        :minlength="field.preps['maxlength']"
        :placeholder="field.preps['placeholder']||'请输入'+field.preps['label']"
        :readonly="field.preps['readonly']=='Y'"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'default'"
        type="text"
        :fid="field.preps['name']"
        class="input-with-select"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter="keyEnterFun"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model="context.attrs['formData'][field.preps['name']]">
      <template #prepend v-if="field.preps['prependText']">
        {{ field.preps['prependText'] }}
      </template>
      <template #prepend v-if="field.preps['prependList']">
        <el-select v-model="context.attrs['formData']['pre'+field.preps['name']]">
          <el-option v-for="item in field.preps['prependList']" :key="item.value" :label="item.name"
                     :value="item.value"/>
        </el-select>
      </template>
      <template #append v-if="field.preps['appendText']">
        {{ field.preps['appendText'] }}
      </template>
      <template #append v-if="field.preps['appendList']">
        <el-select v-model="context.attrs['formData']['app'+field.preps['name']]">
          <el-option v-for="item in field.preps['appendList']" :key="item.value" :label="item.name"
                     :value="item.value"/>
        </el-select>
      </template>
    </el-input>
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, onMounted, shallowRef} from "vue";

export default defineComponent({
  emits: ["selectItem", "selfFunc"],
  setup(_props, context) {
    const parentField = context.attrs["parentField"];
    // const formData = context.attrs["formData"];
    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let preSelect = shallowRef("");
    let appSelect = shallowRef("");
    let actionName = shallowRef("keydown.enter");
    const dynamicFunction = (_funcName: String, data: any) => {
      if (!data) {
        return;
      }
      try {
        let fun = new Function(data);
        fun.call(this);
      } catch (e) {
        console.error(e);
      }
    };
    const keyEnterFun = (prep: any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formData'][field.preps['name']], context.attrs['formData']["xh"]);
      }
      context.emit('selfFunc', (prep instanceof KeyboardEvent) ? prep.code.toLowerCase() : prep || actionName.value);
    };
    onMounted(() => {
      actionName.value = field.preps["actionName"];
      if (!context.attrs["isSearch"]) {
        keyEnterFun(actionName.value);
      }
    });
    return {
      parentField, context, field, formItem,
      dataField, dynamicFunction, keyEnterFun, actionName, preSelect, appSelect
    }
  }
});
</script>
<style lang="scss" scoped>
.input-with-select .el-input-group__prepend {
  background-color: var(--el-fill-color-blank);
}

:deep(.el-input-group__prepend) {
  min-width: 100px;
  padding: 0;
}
</style>
