<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :form-item="field" :parentField="parentField"
  >
    <el-popover
        width="400"
        ref="popoverRef"
        trigger="click">
      <template #reference>
        <el-input
            :clearable="field.preps['clearable']=='Y'"
            :readonly="field.preps['readonly']=='Y'"
            :disabled="field.preps['disabled']=='Y'"
            :size="field?.preps['size']||'small'"
            v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
            :placeholder="field.preps['placeholder']||'请选择' + field.preps['label']"
            @keydown.enter="keyEnterFun"
            @focus="keyEnterFun('focus')"
            v-model="context.attrs['formFieldList'][field.preps['name']]"
        />
      </template>
      <ul class="system-icon">
        <li v-for="sdata in field.preps['values']||loadElementPlusIcon()"
            @click="assignIcon(sdata.value)"
            :class="sdata.value==context.attrs['formFieldList'][field.preps['name']]?'icon-active':''"
        >
          <el-tooltip :content="sdata.name">
            <el-icon class="star-icon" style="font-size: 50px;color:var(--star-horse-style)">
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
import {loadElementPlusIcon} from "@/api/sh_api.ts";

export default defineComponent({
  methods: {loadElementPlusIcon},
  emits: ["selectItem", "selfFunc"],
  setup(props, context) {
    const parentField = context.attrs["parentField"];
    const formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    const popoverRef = shallowRef();
    let actionName = shallowRef("keydown.enter");
    const assignIcon = (iconName: String) => {
      context.attrs['formFieldList'][field.preps['name']] = iconName;
      unref(popoverRef).popperRef?.delayHide?.();
      keyEnterFun("blur");
    };
    const keyEnterFun = (prep: any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formFieldList'][field.preps['name']], context.attrs['formFieldList']["xh"]);
      }
      context.emit('selfFunc', prep);
    };
    onMounted(() => {
      actionName.value = field.preps["actionName"];
      if (!context.attrs["isSearch"]) {
        keyEnterFun(actionName.value);
      }
    });
    return {
      parentField, formFieldList, context, field, formItem, dataField, assignIcon,
      keyEnterFun, actionName, popoverRef
    }
  }
});
</script>
<style scoped>
</style>
