<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField"
  >
    <el-popover
        :popper-style="{width:'unset !important'}"
        ref="popoverRef"
        trigger="click">
      <template #reference>
        <el-avatar fit="fill" shape="square" style="font-size: 24px"
                   :icon="context.attrs['formData'][field.preps['name']]"/>
      </template>
      <ul class="system-icon">
        <li v-for="sdata in field.preps['values']||loadElementPlusIcon()"
            @click="assignIcon(sdata.value)"
            :title="sdata.name"
            :class="{'icon-active':sdata.value==context.attrs['formData'][field.preps['name']]}"
        >
          <el-icon class="star-icon" style="font-size: 50px;color:var(--star-horse-style)">
            <component :is="sdata.value"/>
          </el-icon>
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
  setup(_props, context) {
    const parentField = context.attrs["parentField"];

    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    const popoverRef = shallowRef();
    let actionName = shallowRef("keydown.enter");
    const assignIcon = (iconName: string) => {
      context.attrs['formData'][field.preps['name']] = iconName;
      unref(popoverRef).popperRef?.delayHide?.();
      itemAction("blur");
    };
    const itemAction = (prep: any) => {
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
      parentField, context, field, formItem, dataField, assignIcon,
      itemAction, actionName, popoverRef
    }
  }
});
</script>
<style scoped>
</style>
