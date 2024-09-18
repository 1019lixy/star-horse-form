<script setup lang="ts">
import {onMounted, ref, unref} from "vue";
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
  showCollapse: {type: Boolean, default: false},
  treeTitle: {type: String, default: "树形菜单"},
  // treeDatas: {type: Array<SelectOption>, required: true},
  compSize: {type: String, default: "default"},
  height: {type: Number, default: "600"},
  showCheckbox: {type: Boolean, default: false},
  checkOnClickNode: {type: Boolean, default: true}
});
const emits = defineEmits(["selectData", "changeCollapse"]);
const treeRef = ref<any>();
const searchData = ref('');
const treeDatas: ModelRef<any> = defineModel("treeDatas");
let menuIcon = ref<string>("expand");
let collapse = ref<boolean>(false);
const onQueryChanged = (query: string) => {
  treeRef.value!.filter(query);
};
const filterMethod = (query: string, node: TreeNode) => {
  return node.name!.toLowerCase().includes(query?.toLowerCase())
};
const changeArrow = () => {
  collapse.value = !collapse;
  menuIcon.value = unref(menuIcon) == "expand" ? "collapse" : "expand";
  emits("changeCollapse", collapse.value);
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
  <el-card class="inner_content" :style="{width: collapse?'60px':'unset'}">
    <div class="tree-title">
      <div class="title">{{ treeTitle }}</div>
      <div class="btn" v-if="showCollapse">
        <star-horse-icon :icon-class="menuIcon" @click="changeArrow"/>
      </div>
    </div>
    <div class="search-input">
      <el-input
          v-model="searchData"
          :size="compSize"
          clearable
          placeholder="请输入关键字"
          @input="onQueryChanged">
        <template #suffix>
          <star-horse-icon @click="onQueryChanged" icon-class="search" color="var(--star-horse-style)"/>
        </template>
      </el-input>
    </div>
    <div class="tree-content">
      <el-scrollbar height="100%">
        <el-menu :collapse="collapse">
          <SubSystemMenu :dataList="treeDatas" ref="treeRef" :preps="preps" @selectData="checkChange"/>
        </el-menu>
      </el-scrollbar>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.tree-title {
  width: 99%;
  height: 35px;
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 800;
  background: rgb(229, 230, 235);

  justify-content: space-between;

  .title {
    margin-left: 15px;
  }

  .btn, svg {
    cursor: pointer;
  }
}

.search-input {
  margin-top: 10px;
}

.tree-content {
  margin-top: 5px;
  flex: 1;
  overflow: hidden;
}

:deep(.el-menu-item) {
  height: 30px;
  line-height: 30px;
}
</style>
