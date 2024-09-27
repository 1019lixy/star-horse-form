<script setup lang="ts">
import {computed, nextTick, onMounted, ref, unref} from "vue";
import {TreeNode, TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {ModelRef} from "vue-demi";
import SubSystemMenu from "@/components/menu/SubSystemMenu.vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";

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
  expand: {type: Boolean, default: false},
  height: {type: Number, default: "600"},
  //是否显示复选框
  showCheckBox: {type: Boolean, default: false},
  //是否显示已选中的数据
  showSelectData: {type: Boolean, default: false},
  checkStrictly: {type: Boolean, default: true},
  //是否显示搜索框
  showSearch: {type: Boolean, default: true},
  checkOnClickNode: {type: Boolean, default: true},
  treeType: {type: String, default: "tree"}

});
const emits = defineEmits(["selectData", "changeCollapse"]);
let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || "default");
const treeRef = ref<any>();
const menuTreeRef = ref<any>();
const searchData = ref('');
const treeDatas: ModelRef<any> = defineModel("treeDatas");
let menuIcon = ref<string>("expand");
let collapse = ref<boolean>(false);
const onQueryChanged = (query: string) => {
  treeRef.value!.filter(query);
};
const filterMethod = (query: string, node: TreeNode) => {
  return node[props.preps?.label]!.toLowerCase().includes(query?.toLowerCase())
};
const changeArrow = (evt: MouseEvent) => {
  if (evt) {
    evt.preventDefault();
    evt.stopPropagation();
  }
  collapse.value = !collapse;
  menuIcon.value = unref(menuIcon) == "expand" ? "collapse" : "expand";
  emits("changeCollapse", collapse.value);
};
const treeOperation = (cmd: string) => {
  if (props.treeType == "tree") {
    if (cmd == "collapse") {
      Object.values(treeRef.value!.store.nodesMap).forEach((v: any) => v.collapse())
    } else {
      Object.values(treeRef.value!.store.nodesMap).forEach((v: any) => v.expand())
    }

  } else {
    const getAllSubNodeIndex = (datas: any) => {
      datas.forEach((item: any) => {
        if (item.children && item.children.length > 0) {
          if (cmd == "collapse") {
            menuTreeRef.value.close(item[props.preps.value]);
          } else {
            menuTreeRef.value!.open(item[props.preps.value]);
          }
          getAllSubNodeIndex(item.children);
        }
      });
    }
    getAllSubNodeIndex(treeDatas.value);

  }

}
let selectedDataList = ref<Array<any>>([]);
const operSelectData = (data: TreeNodeData, checked: boolean) => {
  if (checked) {
    selectedDataList.value.push(data);

  } else {
    for (let index in selectedDataList.value) {
      let temp = selectedDataList.value[index];
      if (temp[props.preps?.value] == data[props.preps?.value]) {
        selectedDataList.value.splice(Number(index), 1);
        break;
      }
    }
    treeRef.value!.setChecked(data, checked);
  }
}
const setSelectData = (datas: Array<any>) => {
  selectedDataList.value = datas;
  datas.forEach(item => {
    treeRef.value!.setChecked(item, true);
  })

}
const getSelectData = () => {
  return selectedDataList.value;
}
/**
 * 点击事件
 * @param data
 * @param checked
 */
const treeChange = (data: any, checked: boolean) => {
  operSelectData(data, checked);
  emits("selectData", data, checked);
};
const menuChange = (data: any) => {
  emits("selectData", data);
}
onMounted(async () => {
  await nextTick();
  if (props.expand) {
    setTimeout(() => {
      treeOperation("expand");
    }, 800);
  }
});
defineExpose({
  getSelectData,
  setSelectData
})
</script>

<template>

  <el-card class="inner_content" :style="{width: collapse?'60px':'unset','padding':'unset'}">
    <div class="selected-data gap-2" v-if="showSelectData&&selectedDataList.length>0">
      <template v-for="item in selectedDataList">
        <el-tag closable @close="operSelectData(item,false)">{{ item[preps.label] }}</el-tag>
      </template>
    </div>
    <div class="tree-title">
      <div class="title">{{ treeTitle }}</div>
      <div class="btn" v-if="showCollapse">
        <star-horse-icon :icon-class="menuIcon" @click="changeArrow"/>
      </div>
    </div>
    <div class="search-input" v-if="showSearch">
      <el-input
          v-model="searchData"
          :size="compSize"
          clearable
          placeholder="请输入关键字"
          @input="onQueryChanged">
        <template #append>
          <star-horse-icon @click="onQueryChanged" icon-class="search" color="var(--star-horse-style)" size="18px"/>
        </template>
      </el-input>
      <el-dropdown placement="bottom" @command="treeOperation">
        <star-horse-icon icon-class="v-dot" color="var(--star-horse-style)" size="20px"/>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="expand">展开全部</el-dropdown-item>
            <el-dropdown-item command="collapse">折叠全部</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-divider v-if="showSearch"/>
    <div class="tree-content">
      <el-scrollbar height="100%">
        <el-tree
            ref="treeRef"
            :data="treeDatas"
            :props="preps"
            :node-key="preps.value"
            v-if="treeType=='tree'"
            :filter-node-method="filterMethod"
            :check-strictly="checkStrictly"
            :show-checkbox="showCheckBox"
            @nodeClick="treeChange"
            @checkChange="treeChange"
        />
        <el-menu v-if="treeType=='menu'" ref="menuTreeRef" :unique-opened="false">
          <SubSystemMenu :dataList="treeDatas" :preps="preps" @selectData="menuChange"/>
        </el-menu>
      </el-scrollbar>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
:deep(.el-tag) {
  margin-left: 5px;
}

.selected-data {
  display: flex;
  flex-direction: row;
  justify-content: start;
  margin: 5px;
  border: 1px dashed var(--star-horse-shadow);
}

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
