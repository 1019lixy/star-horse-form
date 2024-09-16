<script setup lang="ts">

import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {onMounted, ref} from "vue";
import {TreeNode} from "element-plus/es/components/tree-v2/src/types";
import {ModelRef} from "vue-demi";
import SubSystemMenu from "@/components/menu/SubSystemMenu.vue";

const props = defineProps({
  preps: {
    type: Object,
    default: () => {
      return {
        value: 'value',
        label: 'name',
        children: 'children'
      };
    }
  },
  treeTitle: {type: String, default: "树形菜单"},
  // treeDatas: {type: Array<SelectOption>, required: true},
  compSize: {type: String, default: "default"},
  height: {type: Number, default: "600"},
  showCheckbox: {type: Boolean, default: false},
  checkOnClickNode: {type: Boolean, default: true}
});
const emits = defineEmits(["selectData"]);
const treeRef = ref<any>();
const searchData = ref('');
const treeDatas: ModelRef<any> = defineModel("treeDatas");
const onQueryChanged = (query: string) => {
  treeRef.value!.filter(query);
};
const filterMethod = (query: string, node: TreeNode) => {
  return node.name!.toLowerCase().includes(query?.toLowerCase())
};
/**
 * 点击事件
 * @param data
 * @param checked
 */
const checkChange = (data: any) => {
  emits("selectData", data);
};
onMounted(() => {

});
</script>

<template>
  <el-card class="inner_content">
    <div class="tree-title">
      {{ treeTitle }}
    </div>
    <div class="search-input">
      <el-input
          v-model="searchData"
          :size="compSize"
          clearable
          placeholder="请输入关键字"
          @input="onQueryChanged"
      >
        <template #suffix>
          <star-horse-icon @click="onQueryChanged" icon-class="search" color="var(--star-horse-style)"/>
        </template>
      </el-input>
    </div>
    <div class="tree-content">
      <el-scrollbar height="100%">
        <el-menu>
          <SubSystemMenu :dataList="treeDatas" ref="treeRef" :preps="preps" @selectData="checkChange"/>
        </el-menu>
        <!--        <el-tree-v2 :data="treeDatas"
                            :filter-method="filterMethod"
                            :check-on-click-node="checkOnClickNode"
                            :show-checkbox="showCheckbox"
                            :height="height"
                            @check-change="checkChange"
                            @node-click="checkChange"
                            ref="treeRef" :props="preps"/>-->
      </el-scrollbar>

    </div>
  </el-card>
</template>

<style scoped lang="scss">
.tree-title {
  width: 100%;
  height: 35px;
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 800;
  padding-left: 15px;
  background: rgb(229, 230, 235);
  border-right: 5px;
}

.search-input {
  margin-top: 10px;
}

.tree-content {
  margin-top: 5px;
  flex: 1;
  overflow: hidden;
}
:deep(.el-menu-item){
  height: 30px;
  line-height: 30px;
}
</style>