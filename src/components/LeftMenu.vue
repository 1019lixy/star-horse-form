<script setup lang="ts">
import {createRouterAndMenuList, permissionMenus} from "@/api/star_horse_apis.ts";
import {computed, nextTick, onMounted, reactive, ref, unref, watch} from "vue";
import {useUserInfoStore,MenusInfo,useGlobalConfigStore,piniaInstance} from "star-horse-lowcode";
import SubMenu from "@/components/menu/SubMenu.vue";
import {filterTree} from "@/api/star_horse_utils.ts";
import {Config} from "@/api/settings.ts";

let userInfoStore = useUserInfoStore(piniaInstance);
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || Config.compSize);
const emits = defineEmits(["collopseOperation"]);
let leftMenuDatas = ref<MenusInfo[]>([]);
let props = defineProps({
  sysemId: {type: String},
  isCollapse: {type: Boolean, default: true}
});
let defaultOpenMenu = ref<string>("");
let menuIcon = ref<string>("expand");
const menuBarFun = () => {
  emits("collopseOperation");
};
const changeArrow = () => {
  menuIcon.value = unref(menuIcon) == "expand" ? "collapse" : "expand";
};
const loadMenus = async (sysemId: string) => {
  if (!sysemId) {
    sysemId = "-1";
  }
  await permissionMenus({}, sysemId).then((res) => {
    let redata = res.data?.data;
    if (redata) {
      localStorage.setItem("menusInfo", JSON.stringify(redata));
      leftMenuDatas.value = reactive(createRouterAndMenuList(redata));
    }
  });
  await nextTick( () => {
    if (leftMenuDatas.value?.length > 0) {
      let allId = leftMenuDatas.value.find(item => item.path == "#")?.meta?.menuId;
      if (allId && systemMenu?.value) {
        try {
          systemMenu.value.open(allId);
        } catch (e) {
          console.log(e.message);
        }
      }
    }
  });
};
const search = ref<string>("");
const systemMenu = ref();
const filterTableData = computed(() => filterTree(search.value, leftMenuDatas.value));
onMounted(async () => {
  let menus = userInfoStore.permissionMenus;
  if (menus.length == 0) {
    await loadMenus("-1");
  } else {
    leftMenuDatas.value = menus;
  }
});
watch(
    () => props.isCollapse,
    () => {
      changeArrow();
    },
    {immediate: true}
);
watch(
    () => props.sysemId,
    (val) => {
      loadMenus(val!);
    },
    {immediate: false}
);
</script>
<template>
  <div class="starhorse-menu">
    <el-scrollbar height="100%" class="base">
      <el-menu
          :collapse="isCollapse"
          ref="systemMenu"
          popper-effect="dark"
          popper-class="popper-class"
          :default-openeds="defaultOpenMenu"
      >
        <el-menu-item index="-1" style="height: 38px; background: var(--star-horse-background)">
          <el-icon class="star-icon" v-if="isCollapse">
            <component :is="'search'"/>
          </el-icon>
          <template #title>
            <el-input v-model="search" :size="compSize" placeholder="请输入关键字" clearable>
              <template #suffix>
                <star-horse-icon icon-class="search" color="var(--star-horse-style)"/>
              </template>
            </el-input>
          </template>
        </el-menu-item>
        <SubMenu v-model:dataList="filterTableData"/>
      </el-menu>
    </el-scrollbar>
    <div @click="menuBarFun" class="menu-button">
      <star-horse-icon :icon-class="menuIcon" color="var(--star-horse-style)"/>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.popper-class {
  background: var(--star-horse-background);
}

.starhorse-menu {
  height: 100%;
  width: inherit;
  display: flex;
  flex-direction: column;

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
