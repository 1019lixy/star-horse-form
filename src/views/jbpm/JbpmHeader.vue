<script lang="ts" setup name="JbpmHeader">
import { nextTick, onMounted, PropType, ref } from 'vue';
import { flowButtonList, setBpmnModeler } from '@/views/jbpm/utils/FlowData';

const props = defineProps({
  processData: {
    type: Object as PropType<any>,
  },
  modeler: {
    type: Object as PropType<any>,
    default: null,
  },
});
let buttonList = ref<Array<any>>([]);
onMounted(async () => {
  await nextTick();
  setBpmnModeler(props.modeler);
  buttonList.value = flowButtonList(props.modeler);
});
</script>
<style lang="scss" scoped>
.inner_button2 {
  height: 40px;
  text-align: left;
  display: flex;
  align-items: center;
  background-color: #fafafa;
  border: solid 1px red;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  li {
    height: 30px;
  }
}
</style>
<template>
  <div class="flex items-center h-[40px]">
    <el-menu
      mode="horizontal"
      :ellipsis="false"
      style="height: inherit; width: 100%"
    >
      <template v-for="(item, index) in buttonList">
        <el-menu-item
          v-if="!item.children"
          :index="'1_' + index"
          @click="item.action"
        >
          <el-tooltip
            class="item"
            :content="item.label"
            :index="index"
            effect="dark"
            placement="bottom"
          >
            <star-horse-icon
              :icon-class="item.icon"
              size="24px"
              style="color: var(--star-horse-style)"
            />
          </el-tooltip>
        </el-menu-item>
        <template v-if="item.children && item.children.length > 0">
          <el-sub-menu :index="'1_' + index">
            <template #title>
              <star-horse-icon
                :title="item.label"
                size="24px"
                :icon-class="item.icon"
                style="color: var(--star-horse-style)"
              />
            </template>
            <el-menu-item
              v-for="(sitem, sindex) in item.children"
              :index="'2_' + sindex"
              @click="sitem.action"
            >
              <star-horse-icon
                :icon-class="sitem.icon"
                size="24px"
                style="color: var(--star-horse-style)"
              />
              {{ sitem.label }}
            </el-menu-item>
          </el-sub-menu>
        </template>
      </template>
    </el-menu>
  </div>
</template>
