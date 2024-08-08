<script setup lang="ts">
import {createRouterAndMenuList, permissionMenus} from "@/api/star_horse";
import {computed, nextTick, onMounted, reactive, ref, unref, watch} from "vue";
import {UserInfo} from "@/store/UserInfoStore";
import {MenusInfo} from "@/components/types/MenusInfo";
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
    <div height="100%" class="base">
      <template v-for="item in leftMenuDatas">
        <div class="item">
          <div class="item-icon">
            <el-icon class="star-icon">
              <component :is="item.meta.menuIcon||'document'"/>
            </el-icon>
          </div>
          <div class="item-title">{{ item.meta.title }}</div>
          <div class="item-line"></div>
          <div class="sub-item"></div>
        </div>
      </template>
    </div>

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
    flex: 1;


    .item {
      width: 100%;
      height: 80px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      .item-icon {
        width: inherit;
        height: 45px;

        .star-icon {
          color: var(--star-horse-white);
          width: inherit;
          height: inherit;
          svg {
            height: 2em;
            width: 2em;
          }

        }
      }

      .item-title {
        line-height: 30px;
        font-weight: bold;
        color: var(--star-horse-white);
      }

      .item-line {
        height: 2px;
        width: 90%;
        border-bottom: 1px solid var(--star-horse-disable);
      }

      &:hover .sub-item {
        opacity: 1;
        position: absolute;

      }

      .sub-item {
        opacity: 1;
        top: 0;
        right: 0;
        transition: opacity 0.5s;
        z-index: 999999999;
        background: var(--star-horse-shadow);
        border: 1px solid var(--star-horse-disable);
        height: 500px;
        width: 200px;

      }
    }
  }
}

:deep(.el-icon) {
  color: var(--star-horse-style);;
}


:deep(.el-scrollbar__view) {
  height: 100%;
}
</style>
