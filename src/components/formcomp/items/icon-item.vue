<template>
  <starhorse-form-item :formDatas="formDatas" :form-item="field" :parentCompType="parentCompType"
  >
    <el-popover
        width="400"
        ref="popoverRef"
       trigger="click">
      <template #reference>
        <el-input
            :clearable="field.preps['clearable']=='yes'"
            :readonly="field.preps['readonly']=='yes'"
            :disabled="field.preps['disabled']=='yes'"
            :size="field.preps['size']"
            v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
            :placeholder="field.preps['placeholder']||'请选择' + field.preps['label']"
            @keydown.enter="keyEnterFun"
            @focus="keyEnterFun('focus')"
            v-model="context.attrs['formFieldList'][field.preps['name']]"
        />
      </template>
      <ul class="system-icon">
        <li v-for="sdata in field.preps['values']"
            @click="assignIcon(sdata.value)"
            :class="sdata.value==context.attrs['formFieldList'][field.preps['name']]?'icon-active':''"
        >
          <el-tooltip :content="sdata.name">
            <el-icon class="star-icon" style="font-size: 50px">
              <component :is="sdata.value"/>
            </el-icon>
          </el-tooltip>
        </li>
      </ul>
    </el-popover>
  </starhorse-form-item>
</template>

<script lang="ts">
import {defineComponent, onMounted, shallowRef, unref} from "vue";

export default defineComponent({
  emits: ["selectItem", "selfFunc"],
  setup(props, context) {
    const parentCompType = context.attrs["parentCompType"];
    const formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    const formDatas = context.attrs["formDatas"];
    const dialogVisible = shallowRef("false");
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    const popoverRef = shallowRef();
    let actionName = shallowRef("keydown.enter");

    onMounted(() => {
      actionName.value = field.preps["actionName"];
    });
    const assignIcon = (iconName: String) => {
      context.attrs['formFieldList'][field.preps['name']] = iconName;
      unref(popoverRef).popperRef?.delayHide?.();
      keyEnterFun("blur");
    };
    const keyEnterFun = (prep: any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formFieldList'][field.preps['name']],context.attrs['formFieldList']["xh"]);
      }
      context.emit('selfFunc', prep);
    };
    const selectItem = (data: any) => {
      context.emit('selectItem', data, parentCompType)
    };
    return {
      parentCompType, formFieldList, context, field, formItem, formDatas, dataField, assignIcon,
      selectItem, keyEnterFun, actionName, popoverRef
    }
  }
});
</script>

<style scoped>

</style>