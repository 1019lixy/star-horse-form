<script setup lang="ts">
import {createRouterAndMenuList, permissionMenus} from "@/api/star_horse_apis";
import {computed, nextTick, onMounted, reactive, ref, watch} from "vue";
import {MenusInfo, piniaInstance, useUserInfoStore} from "star-horse-lowcode";

let userStore = useUserInfoStore(piniaInstance);
// const emits = defineEmits(["collapseOperation"]);
let leftMenuDatas = ref<MenusInfo[]>([]);
let props = defineProps({
  sysemId: {type: String},
  isCollapse: {type: Boolean, default: true},
  top: {type: String, default: "83px"}
});
let defaultOpenMenu = ref<Array<string>>([]);
let htop = ref<string>(computed(() => props.top).value == "83px" ? "65px" : "35px");
const loadMenus = async (sysemId: string) => {
  if (!sysemId) {
    sysemId = "-1";
  }
  await permissionMenus({}, sysemId).then((res) => {
    let redata = res.data.data;
    sessionStorage.setItem("menusInfo", JSON.stringify(redata));
    leftMenuDatas.value = reactive(createRouterAndMenuList(redata));
    let allId = leftMenuDatas.value.map((item) => item.meta.menuId);
    nextTick(() => {
      defaultOpenMenu.value = allId.splice(0, 1);
    });
  });
};
// const search = ref<String>();
let currentItem = ref<any>({});

// const _filterTableData = computed(() => filterTree(search.value, leftMenuDatas.value));
const overHandler = (item: any) => {
  currentItem.value = item;
};
/*const _outHandler = (_item: any) => {
currentItem.value = {};
}*/
onMounted(async () => {
  let menus = userStore.getPermissionMenus;
  if (!menus || menus.length == 0) {
    await loadMenus("-1");
  } else {
    leftMenuDatas.value = menus;
  }
});

watch(
    () => props.sysemId,
    (val: any) => {
      loadMenus(val);
    },
    {immediate: false}
);
</script>
<template>
  <div class="starhorse-menu">
    <div class="menu-base">
      <template v-for="item in leftMenuDatas">
        <div
            :class="{ 'menu-item': true, 'is-active': item.meta.title == currentItem.meta?.title }"
            @mouseover="overHandler(item)"
        >
          <div class="menu-item-icon">
            <el-icon class="star-icon">
              <component :is="item.meta.menuIcon || 'document'"/>
            </el-icon>
          </div>
          <div class="menu-item-title">{{ item.meta.title }}</div>
          <div class="menu-item-line"></div>
          <div class="menu-sub-item" v-if="item.children && item.meta.title == currentItem.meta?.title">
            <FixedSubMenu :top="top" :data-list="item.children"/>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.starhorse-menu {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  clear: both;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: var(--star-horse-style);

  .menu-base {
    flex: 1;
    display: flex;
    flex-direction: column;

    .menu-item {
      width: 100%;
      height: 80px;
      flex-direction: column;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      vertical-align: middle;

      .menu-item-icon {
        width: 100%;
        height: 45px;
        cursor: pointer;

        .star-icon {
          width: 100%;
          height: inherit;

          svg {
            color: var(--star-horse-white) !important;
            height: 2em;
            width: 2em;
          }
        }
      }

      .menu-item-title {
        line-height: 30px;
        width: 100%;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        font-size: 13px;
        color: var(--star-horse-white);
        cursor: pointer;
      }

      .menu-item-line {
        height: 2px;
        width: 90%;
        border-bottom: 1px solid var(--star-horse-white);
        box-shadow: #6b7785 0 0 1px 0;
        border-radius: 2px;
      }

      .menu-sub-item {
        display: none;
        opacity: 0;
        position: fixed;
        top: v-bind(top);
        left: 90px;
        transition-delay: 1s;
        flex-direction: column;
        align-items: center;
        vertical-align: middle;
        z-index: 9992 !important;
        background: #f9f9f9;
        border: var(--star-horse-white);
        height: calc(100vh - v-bind(htop));
        width: 200px;
      }
    }

    .is-active:hover:after {
      display: block;
    }

    .is-active {
      position: relative;

      &:hover .menu-sub-item {
        display: flex;
        opacity: 1;
      }
    }

    .is-active:after {
      display: none;
      position: absolute;
      content: "";
      top: 40%;
      right: 0;
      border-right: 10px solid #f9f9f9;
      border-bottom: 10px solid transparent;
      border-top: 10px solid transparent;
      z-index: 9991;
      width: 0;
      height: 0;
    }
  }
}
</style>
