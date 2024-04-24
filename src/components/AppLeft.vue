<script setup lang = "ts">
import {createRouterAndMenuList, permissionMenus} from "@/api/star_horse";
import {computed, onMounted, reactive, ref, watch, nextTick} from "vue";
import {userInfo} from "@/store/UserInfoStore";
import {MenusInfo} from "@/components/types/MenusInfo";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import SubMenu from "@/components/menu/SubMenu.vue";
import {filterTree} from "@/api/sh_api";

let userInfoStore = userInfo();
let leftMenuDatas = ref<MenusInfo[]>([]);
let props = defineProps<{ sysemId: string, isCollapse: boolean }>();
let defaultOpenMenu = ref<Array<String>>([]);
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
watch(() => props.sysemId,
    (val: string) => {
      loadMenus(val);
    },
    {immediate: false}
);
</script>

<style lang = "scss">
.base {
  background: white;

}
:deep(.el-icon) {
  color: var(--star-horse-style);;
}
.el-menu {
  min-height: 100%;
  font-size: 13px;
}
.menu-active {
}
</style>
<template>
  <el-scrollbar height = "100%" class = "base">
    <el-menu :collapse = "isCollapse" ref = "systemMenu"
             popper-effect = "light"
             :default-openeds = "defaultOpenMenu">
      <el-menu-item index = "-1">
        <el-icon class = "star-icon" v-if = "isCollapse">
          <component :is = "'search'"/>
        </el-icon>
        <template #title>
          <el-input v-model = "search" size = "small" placeholder = "请输入关键字" clearable>
            <template #suffix>
              <star-horse-icon icon-class = "search"/>
            </template>
          </el-input>
        </template>
      </el-menu-item>
      <SubMenu :dataList = "filterTableData"></SubMenu>
    </el-menu>
  </el-scrollbar>
</template>
