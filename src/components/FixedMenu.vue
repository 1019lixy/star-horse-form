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
      <template v-for="item in leftMenuDatas">
        <div>
          <div>
            <el-icon class="star-icon">
              <component :is="item.meta.menuIcon||'document'"/>
            </el-icon>
          </div>
          <div>{{ item.meta.title }}</div>
        </div>
      </template>
    </el-scrollbar>

  </div>
</template>
<style lang="scss" scoped>

.starhorse-menu {
  height: 100%;
  width: 90px;
  display: flex;
  flex-direction: column;
  background: var(--star-horse-style);
  .base {
    width: 100%;
  }
}

:deep(.el-icon) {
  color: var(--star-horse-style);;
}


:deep(.el-scrollbar__view) {
  height: 100%;
}
</style>
