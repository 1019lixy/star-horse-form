<script setup lang="ts">
import { Config } from "@/api/settings";
import { filterTree } from "@/api/star_horse_utils";
import { useLoginStore } from "@/store/Login";
import { piniaInstance, useGlobalConfigStore } from "star-horse-lowcode";
import { computed, nextTick, onMounted, ref, watch } from "vue";
defineProps({
  isCollapse: { type: Boolean, default: false }
})
let configStore = useGlobalConfigStore(piniaInstance);
const loginStore = useLoginStore(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || Config.compSize);
const emits = defineEmits(["collapseOperation"]);
let leftMenuDatas = computed(() => loginStore.getMenusList());

let defaultOpenMenu = ref<string>("");
const setOpenMenu = () => {
  filterTableData.value = leftMenuDatas.value;
  nextTick(() => {
    if (leftMenuDatas.value?.length > 0) {
      let allId = leftMenuDatas.value.find((item: any) => item.path == "#")?.meta?.menuId;
      if (allId && systemMenu?.value) {
        try {
          systemMenu.value.open(allId);
        } catch (e: any) {
          console.log(e.message);
        }
      }
    }
  });
};
const search = ref<string>("");
const systemMenu = ref();
const filterTableData = computed(() => filterTree(search.value, leftMenuDatas.value));
onMounted(() => {

});
watch(
  () => leftMenuDatas.value,
  () => {
    setOpenMenu();
  },
  { immediate: true }
);

</script>
<template>
  <div class="starhorse-menu">
    <el-scrollbar height="100%" class="base">
      <el-menu :collapse="isCollapse" ref="systemMenu" popper-effect="dark" popper-class="popper-class"
        :default-openeds="defaultOpenMenu">
        <el-menu-item index="-1" style="height: 38px; background: var(--star-horse-background)">
          <el-icon class="star-icon" v-if="isCollapse">
            <component :is="'search'" />
          </el-icon>
          <template #title>
            <el-input v-model="search" :size="compSize" placeholder="请输入关键字" clearable>
              <template #suffix>
                <star-horse-icon icon-class="search" color="var(--star-horse-style)" size="16px" />
              </template>
            </el-input>
          </template>
        </el-menu-item>
        <SubMenu v-model:dataList="filterTableData" />
      </el-menu>
    </el-scrollbar>
    <!--    <div @click="menuBarFun" class="menu-button">
      <star-horse-icon :icon-class="menuIcon" color="var(&#45;&#45;star-horse-style)"/>
    </div>-->
  </div>
</template>
<style lang="scss" scoped>
.popper-class {
  background: var(--star-horse-background);
}

.starhorse-menu {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .base {
    border-radius: 3px;
    width: inherit;
  }

  .menu-button {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px dashed var(--star-horse-font-color);
    margin-top: 3px;
    height: 26px;
    background: var(--star-horse-background);
    margin-bottom: -1px;

    &:hover,
    svg:hover {
      cursor: pointer;
    }
  }
}

:deep(.el-icon) {
  color: var(--star-horse-style);
}

.el-menu {
  min-height: 100%;
  font-size: 13px;
}

.el-menu-item {
  background: var(--star-horse-font-color);
  margin-top: 1px;
}

:deep(.el-scrollbar__view) {
  height: 100%;
}
</style>
