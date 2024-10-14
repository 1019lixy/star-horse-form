<script setup lang="ts">
import {createRouterAndMenuList, permissionMenus} from "@/api/star_horse";
import {computed, nextTick, onMounted, reactive, ref, unref, watch} from "vue";
import {userInfoStore} from "@/store/UserInfoStore";
import {MenusInfo} from "@/components/types/MenusInfo";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {filterTree} from "@/api/sh_api";
import piniaInstance from "@/store";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import {SidebarMenu} from "vue-sidebar-menu";
import "vue-sidebar-menu/dist/vue-sidebar-menu.css"

let userInfo = userInfoStore(piniaInstance);
let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || "default");
const emits = defineEmits(["collopseOperation"]);
let leftMenuDatas = ref<MenusInfo[]>([]);
let props = defineProps({
  sysemId: {type: String},
  isCollapse: {type: Boolean, default: true}
});
let defaultOpenMenu = ref<string>("");
let collapsed = ref<boolean>(false);
const separator = h('hr', {
  style: {
    borderColor: 'rgba(0, 0, 0, 0.1)',
    margin: '20px',
  },
})
const faIcon = (props) => {
  return {
    element: h('div', [h(StarHorseIcon, {size: 'lg', ...props})]),
  }
}
let menu = ref<any>([
  {
    header: 'Getting Started',
    hiddenOnCollapse: true,
  },
  {
    href: '/',
    title: 'Installation',
    icon: faIcon({iconClass: 'fa-solid fa-download'}),
  },
  {
    href: '/basic-usage',
    title: 'Basic Usage',
    icon: faIcon({iconClass: 'fa-solid fa-code'}),
  },
  {
    header: 'Usage',
    hiddenOnCollapse: true,
  },
  {
    href: '/props',
    title: 'Props',
    icon: faIcon({iconClass: 'fa-solid fa-cogs'}),
  },
  {
    href: '/events',
    title: 'Events',
    icon: faIcon({iconClass: 'fa-solid fa-bell'}),
  },
  {
    href: '/styling',
    title: 'Styling',
    icon: faIcon({iconClass: 'fa-solid fa-palette'}),
  },
  {
    href: '/slots',
    title: 'Slots',
    icon: faIcon({iconClass: 'fa-solid fa-cubes'}),
  },
  {
    component: separator,
  },
  {
    header: 'Examples',
    hiddenOnCollapse: true,
  },
  {
    href: '/disabled',
    title: 'Disabled page',
    icon: faIcon({iconClass: 'fa-solid fa-lock'}),
    disabled: true,
  },
  {
    title: 'Badge',
    icon: faIcon({iconClass: 'fa-solid fa-cog'}),
    badge: {
      text: 'new',
      class: 'vsm--badge_default',
    },
  },
  {
    href: '/page',
    title: 'Dropdown Page',
    icon: faIcon({iconClass: 'fa-solid fa-list-ul'}),
    child: [
      {
        href: '/page/sub-page-1',
        title: 'Sub Page 01',
        icon: faIcon({iconClass: 'fa-solid fa-file-alt', size: 'sm'}),
      },
      {
        href: '/page/sub-page-2',
        title: 'Sub Page 02',
        icon: faIcon({iconClass: 'fa-solid fa-file-alt', size: 'sm'}),
      },
    ],
  },
  {
    title: 'Multiple Level',
    icon: faIcon({iconClass: 'fa-solid fa-list-alt'}),
    child: [
      {
        title: 'page',
      },
      {
        title: 'Level 2 ',
        child: [
          {
            title: 'page',
          },
          {
            title: 'Page',
          },
        ],
      },
      {
        title: 'Page',
      },
      {
        title: 'Another Level 2',
        child: [
          {
            title: 'Level 3',
            child: [
              {
                title: 'Page',
              },
              {
                title: 'Page',
              },
            ],
          },
        ],
      },
    ],
  },
]);

let selectedTheme = ref<string>('white-theme');
let menuIcon = ref<string>("expand");
const menuBarFun = () => {
  emits('collopseOperation');
};
const changeArrow = () => {
  menuIcon.value = unref(menuIcon) == "expand" ? "collapse" : "expand";
};
const onItemClick = (event, item) => {
  console.log(event, item);
}
const onToggleCollapse = (collapsed) => {
  console.log('onToggleCollapse')
  menuBarFun();
  changeArrow();
};
const loadMenus = async (sysemId: string) => {
  if (!sysemId) {
    sysemId = "-1";
  }
  await permissionMenus({}, sysemId).then(res => {
    let redata = res.data?.data;
    localStorage.setItem("menusInfo", JSON.stringify(redata));
    leftMenuDatas.value = reactive(createRouterAndMenuList(redata));
  });
  await nextTick();
  setTimeout(() => {
    let allId = leftMenuDatas.value.map(item => item.meta.menuId);
    if (allId && allId.length > 0) {
      systemMenu.value?.open(allId[0]);
    }
  }, 800);


};
// let menuIcon = ref<string>("expand");
// let collapse = ref<boolean>(false);
const search = ref<string>("");
const systemMenu = ref();
const filterTableData = computed(() => filterTree(search.value, leftMenuDatas.value));
onMounted(async () => {
  let menus = userInfo.getPermissionMenus;
  if (menus.length == 0) {
    await loadMenus("-1");
  } else {
    leftMenuDatas.value = menus;
  }
});
watch(
    () => props.isCollapse,
    () => {
      changeArrow()
    },
    {immediate: true}
);
watch(() => props.sysemId,
    (val) => {
      loadMenus(val!);
    },
    {immediate: false}
);
</script>
<template>
  <div class="starhorse-menu">
    <sidebar-menu
        v-model:collapsed="collapsed"
        :menu="menu"
        :width="'200px'"
        :relative="false"
        :theme="selectedTheme"
        :show-one-child="true"
        @update:collapsed="onToggleCollapse"
        @item-click="onItemClick"
    >

    </sidebar-menu>
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
    border: 1px dashed var(--star-horse-font-color);
    margin-top: 3px;
    height: 26px;
    background: var(--star-horse-background);
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
  background: var(--star-horse-font-color);
  margin-top: 1px;
}

:deep(.el-scrollbar__view) {
  height: 100%;
}
</style>
