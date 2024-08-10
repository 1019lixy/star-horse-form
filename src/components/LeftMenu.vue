<script setup lang="ts">
import {createRouterAndMenuList, permissionMenus} from "@/api/star_horse";
import {computed, nextTick, onMounted, reactive, ref, unref, watch} from "vue";
import {UserInfo} from "@/store/UserInfoStore";
import {MenusInfo} from "@/components/types/MenusInfo";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import SubMenu from "@/components/menu/SubMenu.vue";
import {filterTree} from "@/api/sh_api";
import piniaInstance from "@/store";
let userInfoStore = UserInfo(piniaInstance);
const emits = defineEmits(["collopseOperation"]);
let leftMenuDatas = ref<MenusInfo[]>([]);
let props = defineProps({
  sysemId: {type: String},
  isCollapse: {type: Boolean, default: true}
});
let defaultOpenMenu = ref<Array<String>>([]);
let menuIcon = ref<String>("expand");
const menuBarFun = () => {
  emits('collopseOperation');
};
const changeArrow = () => {
  menuIcon.value = unref(menuIcon) == "expand" ? "collapse" : "expand";
};
const loadMenus = async (sysemId: string) => {
  if (!sysemId) {
    sysemId = "-1";
  }
  await permissionMenus({}, sysemId).then(res => {
    let redata = res.data.data;
    localStorage.setItem("menusInfo", JSON.stringify(redata));
    leftMenuDatas.value = reactive(createRouterAndMenuList(redata));
    let allId = leftMenuDatas.value.map(item => item.meta.menuId);
    nextTick(() => {
      defaultOpenMenu.value = allId.splice(0, 1);
    });
  });
};
const search = ref<String>();
const systemMenu = ref();
const filterTableData = computed(() => filterTree(search.value, leftMenuDatas.value));
onMounted(async () => {
  let menus = userInfoStore.getPermissionMenus;
  if (menus.length == 0) {
    await loadMenus("-1");
  } else {
    leftMenuDatas.value = menus;
  }
});
watch(
    () => props.isCollapse,
    (val) => {
      changeArrow()
    },
    {immediate: true}
);
watch(() => props.sysemId,
    (val: string) => {
      loadMenus(val);
    },
    {immediate: false}
);
</script>
<template>
  <div class="starhorse-menu">
    <el-scrollbar height="100%" class="base">
      <el-menu :collapse="isCollapse"
               ref="systemMenu"
               popper-effect="dark"
               popper-class="popper-class"
               :default-openeds="defaultOpenMenu">
        <el-menu-item index="-1" style="height: 38px;background: var(--star-horse-white)">
          <el-icon class="star-icon" v-if="isCollapse">
            <component :is="'search'"/>
          </el-icon>
          <template #title>
            <el-input v-model="search" size="small" placeholder="请输入关键字" clearable>
              <template #suffix>
                <star-horse-icon icon-class="search" color="var(--star-horse-style)"/>
              </template>
            </el-input>
          </template>
        </el-menu-item>
        <SubMenu :dataList="filterTableData"></SubMenu>
      </el-menu>
    </el-scrollbar>
    <div @click="menuBarFun" class="menu-button">
      <star-horse-icon :icon-class="menuIcon" color="var(--star-horse-style)"/>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.popper-class {
  background: var(--star-horse-style);
}
.starhorse-menu {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  .base {
    border-radius: 3px;
    width: 100%;
  }
  .menu-button {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px dotted #eee;
    margin-top: 3px;
    height: 26px;
    background: #fff;
    margin-bottom: -1px;
    &:hover, svg:hover {
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
  background: #eee;
  margin-top: 1px;
}
.menu-active {
}
:deep(.el-scrollbar__view) {
  height: 100%;
}
</style>
