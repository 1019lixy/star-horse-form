<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField">
    <el-popover
        :popper-style="{'width':'inherit !important'}"
        ref="popoverRef"
        :disabled="!context.attrs['formData']['_'+field.preps['name']+'Editable']&&field.preps['disabled'] == 'Y'"
        trigger="click">
      <template #reference>
        <el-avatar fit="fill" shape="square" style="font-size: 24px"
                   :icon="context.attrs['formData'][field.preps['name']]"/>
      </template>
      <div class="search-box">
        <el-input :size="context.attrs.formInfo?.size||field?.preps['size']||'default'" v-model="searchName"
                  @keydown.enter="dataSearch" clearable
                  placeholder="请输入要搜索的图标">
          <template #prefix>
            <star-horse-icon icon-class="search" @click="dataSearch"/>
          </template>
        </el-input>
      </div>
      <ul class="system-icon">
        <li v-for="sdata in iconList"
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
import {defineComponent, onMounted, shallowRef, unref, ref} from "vue";
import {loadElementPlusIcon} from "@/api/sh_api.ts";
import {allAction} from "@/components/formcomp/utils/ItemRelationEventUtils.ts";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";

export default defineComponent({
  components: {StarHorseIcon},
  emits: ["selectItem", "selfFunc"],
  setup(_props, context) {
    const parentField = context.attrs["parentField"];

    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let searchName = ref<string>("");
    let iconList = ref<any>([]);
    let allIconList = ref<any>([]);
    const popoverRef = shallowRef();
    let actionName = shallowRef("keydown.enter");
    const assignIcon = (iconName: string) => {
      context.attrs['formData'][field.preps['name']] = iconName;
      unref(popoverRef).popperRef?.delayHide?.();
      itemAction("blur");
    };
    const dataSearch = () => {
      if (!searchName.value) {
        iconList.value = allIconList.value;
      } else {
        iconList.value = allIconList.value.filter((item: any) => {
          return item.name.toLowerCase().indexOf(searchName.value.toLowerCase()) > -1;
        });
      }
    }
    const itemAction = (prep: any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formData'][field.preps['name']], context.attrs['formData']["xh"]);
      }
      context.emit('selfFunc', prep);
    };
    onMounted(() => {
      actionName.value = field.preps["actionName"];
      allIconList.value = field.preps['values'] || loadElementPlusIcon()
      iconList.value = allIconList.value;
      if (!context.attrs["isSearch"]) {
        allAction(context, actionName.value, true);
      }
    });
    return {
      parentField, context, field, formItem, dataField, assignIcon,
      itemAction, actionName, popoverRef, searchName, dataSearch, iconList
    }
  }
});
</script>
<style scoped>
.search-box {
  width: 90%;
  margin: 0 auto;
}
</style>
