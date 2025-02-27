<script lang="ts" setup name="JbpmHeader">
import {nextTick, onMounted, PropType, ref} from 'vue';
import {flowButtonList, setBpmnModeler} from '@/views/jbpm/utils/FlowData.ts';
import StarHorseIcon from '@/components/comp/StarHorseIcon.vue';

const props = defineProps({
  processData: {
    type: Object as PropType<any>,
  },
  modeler: {
    type: Object as PropType<any>,
    default: null
  }
});
let buttonList = ref<Array<any>>([]);
onMounted(async () => {
  await nextTick();
  setBpmnModeler(props.modeler);
  buttonList.value = flowButtonList(props.modeler);
});
</script>
<style lang="scss" scoped>
.inner_button {
  height: 40px;
  text-align: left;
  justify-content: flex-start;
  background-color: #fafafa;
  border: solid 1px #ccc;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
<template>
  <div class="inner_button">
    <el-menu mode="horizontal" style="height: inherit;width: 100%;">
      <template v-for="(item,index ) in buttonList.value">
        <el-menu-item v-if="!item.children" :index="'1_'+index" @click="item.action">
          <el-tooltip class="item" :content="item.label" :index="index"
                      effect="dark"
                      placement="bottom">
            <star-horse-icon :icon-class="item.icon" size="24px" style="color: var(--star-horse-style)"
            />
          </el-tooltip>
        </el-menu-item>
        <template v-if="item.children&&item.children.length>0">
          <el-sub-menu :index="'1_'+index">
            <template #title>

              <star-horse-icon :title="item.label" :icon-class="item.icon" size="24px"
                               style="color: var(--star-horse-style)"/>

            </template>
            <el-menu-item v-for="(sitem,sindex) in item.children" :index="'2_'+sindex"
                          @click="sitem.action">
              <star-horse-icon :icon-class="sitem.icon" size="24px"
                               style="color: var(--star-horse-style)"/>
              {{ sitem.label }}
            </el-menu-item>
          </el-sub-menu>
        </template>
      </template>
    </el-menu>
  </div>

</template>
