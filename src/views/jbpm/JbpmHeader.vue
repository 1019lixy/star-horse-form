<script lang="ts" setup name="JbpmHeader">
import {nextTick, onMounted, PropType, ref} from "vue";
import {flowButtonList, setBpmnModeler} from "@/views/jbpm/utils/FlowData.ts";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import BpmnModeler from "camunda-bpmn-js/lib/camunda-platform/Modeler";

const props = defineProps({
  processData: {
    type: Object as PropType<any>,
  },
  modeler: {
    type: Object as PropType<BpmnModeler>,
    default: null
  }
});
let buttonList = ref<Array<any>>([]);
onMounted(async () => {
  await nextTick();
  setBpmnModeler(props.modeler);
  buttonList.value = flowButtonList(props.modeler);
})
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
        <el-menu-item v-for="(item,index ) in buttonList.value">
          <el-tooltip class="item" :content="item.label" :index="index"
                      effect="dark"
                      placement="bottom">
            <star-horse-icon @click="item.action" :icon-class="item.icon" size="24px"
                             style="color: var(--star-horse-style)"
            />
          </el-tooltip>
        </el-menu-item>
      </el-menu>
    </div>

</template>
