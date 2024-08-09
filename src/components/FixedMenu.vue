<script setup lang="ts">
import {createRouterAndMenuList, permissionMenus} from "@/api/star_horse";
import {computed, nextTick, onMounted, reactive, ref, unref, watch} from "vue";
import {UserInfo} from "@/store/UserInfoStore";
import {MenusInfo} from "@/components/types/MenusInfo";
import {filterTree} from "@/api/sh_api";
import piniaInstance from "@/store";
import {Position} from "@element-plus/icons-vue";
import SubMenu from "@/components/menu/SubMenu.vue";

let userInfoStore = UserInfo(piniaInstance);
const emits = defineEmits(["collopseOperation"]);
let leftMenuDatas = ref<MenusInfo[]>([]);
let props = defineProps({
  sysemId: {type: String},
  isCollapse: {type: Boolean, default: true},
  top: {type: String, default: "83px"}
});
let defaultOpenMenu = ref<Array<String>>([]);
let menuIcon = ref<String>("expand");
const changeArrow = () => {
  menuIcon.value = unref(menuIcon) == "expand" ? "collapse" : "expand";
};
let htop = ref<string>(computed(() => props.top).value == "83px" ? "65px" : "35px");
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
let currentItem = ref<any>({});

const filterTableData = computed(() => filterTree(search.value, leftMenuDatas.value));
const overHandler = (item: any) => {
  currentItem.value = item;
}
const outHandler = (_item: any) => {
  currentItem.value = {};
}
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
<template>
  <div class="starhorse-menu">
    <div class="menu-base">
      <template v-for="item in leftMenuDatas">

        <div :class="{'menu-item':true,'is-active':true}"
             @mouseover="overHandler(item)" @mouseout="outHandler(item)">

          <div class="menu-item-icon">
            <el-icon class="star-icon">
              <component :is="item.meta.menuIcon||'document'"/>
            </el-icon>
          </div>
          <div class="menu-item-title">{{ item.meta.title }}</div>
          <div class="menu-item-line"></div>
          <div class="menu-sub-item">
            <div class="sub-menu-list">

            </div>
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
      cursor: pointer;
      position: relative;

      .menu-item-icon {
        width: 100%;
        height: 45px;

        .star-icon {
          color: var(--star-horse-white);
          width: 100%;
          height: inherit;

          svg {
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
        color: var(--star-horse-white);
      }

      .menu-item-line {
        height: 2px;
        width: 90%;
        border-bottom: 1px solid var(--star-horse-disable);
      }

       &:hover .menu-sub-item {
         display: block;
       }
      .menu-sub-item {
          display: none;
        position: fixed;
        top: v-bind(top);
        left: 90px;
        z-index: 99999999 !important;
        background: var(--star-horse-shadow);
        border: var(--star-horse-white);
        height: calc(100vh - v-bind(htop));
        width: 200px;
      }

    }

    .is-active:hover:after {
      display: block;
    }

    .is-active:after {
      display: none;
      position: absolute;
      content: '';
      top: 45%;
      right: 0;
      border-right: 10px solid #ccc;
      border-bottom: 10px solid transparent;
      border-top: 10px solid transparent;
      z-index: 9999;
      width: 0;
      height: 0;
    }
  }
}


</style>
