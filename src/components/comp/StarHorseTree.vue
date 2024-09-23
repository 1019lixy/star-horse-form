<script setup lang="ts">
import {onMounted, ref, unref} from "vue";
import {TreeNode} from "element-plus/es/components/tree-v2/src/types";
import {ModelRef} from "vue-demi";
import SubSystemMenu from "@/components/menu/SubSystemMenu.vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {warning} from "@/utils/message.ts";

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
let openRecordList = ref<Array<any>>([]);
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
const treeOperation = (cmd: string) => {
  warning("目前还没有实现动态控制菜单展开和折叠功能");
  if (cmd == "collapse") {
    openRecordList.value = [];
  } else {
    if (openRecordList.value && openRecordList.value.length > 0) {
      return;
    }
    const getAllSubNodeIndex = (datas: any) => {
      datas.forEach((item: any) => {
        if (item.children && item.children.length > 0) {
          openRecordList.value.push(item[props.preps.value]);
          getAllSubNodeIndex(item.children);
        }
      });
    }
    getAllSubNodeIndex(treeDatas.value);
    console.log(openRecordList.value);
  }
}
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
  <el-card class="inner_content" :style="{width: collapse?'60px':'unset','padding':'unset'}">
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
        <template #append>
          <star-horse-icon @click="onQueryChanged" icon-class="search" color="var(--star-horse-style)"/>
        </template>
      </el-input>
      <el-dropdown placement="bottom" @command="treeOperation">
        <star-horse-icon icon-class="v-dot" color="var(--star-horse-style)"/>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="expand">展开全部</el-dropdown-item>
            <el-dropdown-item command="collapse">折叠全部</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-divider/>
    <div class="tree-content">
      <el-scrollbar height="100%">
        <el-menu :collapse="collapse" :unique-opened="false" :default-openeds="openRecordList">
          <SubSystemMenu :dataList="treeDatas" ref="treeRef" :preps="preps" @selectData="checkChange"/>
        </el-menu>
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
  width: 100%;
  align-items: center;
  display: flex;
  margin: 5px;
}

.tree-content {
  margin: 5px;
  flex: 1;
  overflow: hidden;
}

:deep( .el-sub-menu__icon-arrow) {
  width: 20px !important;
  right: 5px;
}

:deep(.el-menu-item) {
  height: 30px;
  line-height: 30px;
}

:deep(.el-divider--horizontal) {
  margin: 5px 0 !important;
}
</style>
