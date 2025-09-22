<script setup lang="ts">
import { computed, nextTick, onMounted, ref, unref, watch } from "vue";
import type {
  RouteLocationNormalizedLoaded,
  RouterLinkProps,
} from "vue-router";
import { useRouter } from "vue-router";
import { useNavBarListStore } from "@/store/NavBarList";
import { useScrollTo } from "@/components/tags/useScrollTo";
import { useTemplateRefsList } from "@vueuse/core";
import piniaCompInstance from "@/store";
import { i18n } from "@/lang/index";

const { currentRoute, push, replace } = useRouter();
const viewListStore = useNavBarListStore(piniaCompInstance);
const navTagsList = computed(() => viewListStore.navTagsList);
// 初始化tag
const initTags = () => {};
const selectedTag = ref<RouteLocationNormalizedLoaded>();
// 新增tag
const addTags = () => {
  const { name } = unref(currentRoute);
  if (name) {
    selectedTag.value = unref(currentRoute);
    viewListStore.setCurrentView(currentRoute.value);
  }
};
// 关闭选中的tag
const closeSelectedTag = (view: RouteLocationNormalizedLoaded) => {
  viewListStore.clearNavItem(view);
  if (isActive(view)) {
    toLastView();
  }
};
// 关闭全部
const closeAllTags = () => {
  viewListStore.clearAll();
  toLastView();
};
// 关闭其他
const closeOthersTags = () => {
  let path = unref(selectedTag)?.path;
  let fData: any = navTagsList.value.find(
    (item: RouteLocationNormalizedLoaded) => item.path == path,
  );
  viewListStore.clearAll();
  if (fData?.path) {
    viewListStore.addNavBar(fData);
    toLastView();
  }
};
// 重新加载
const refreshSelectedTag = async (view?: RouteLocationNormalizedLoaded) => {
  if (!view) {
    return;
  }
  const { fullPath, query } = view;
  query["redirectPath"] = fullPath;
  await nextTick();
  await replace({
    path: "/redirect",
    query: query,
  });
};
// 关闭左侧
const closeLeftTags = () => {
  let path = unref(selectedTag)?.path as string;
  navTagsList.value.splice(1, getCurrentIndex(path) - 1);
};
const getCurrentIndex = (path: string) => {
  let tagsList = navTagsList.value;
  let i = 0;
  for (; i < tagsList.length; i++) {
    let temp = tagsList[i];
    if (temp.path == path) {
      break;
    }
  }
  return i;
};
// 关闭右侧
const closeRightTags = () => {
  let tagsList = navTagsList.value;
  let path = unref(selectedTag)?.path || "";
  tagsList.splice(getCurrentIndex(path) + 1, tagsList.length - 1);
  toLastView();
};
// 跳转到最后一个
const toLastView = () => {
  const visitedViews = navTagsList.value;
  const latestView = visitedViews.slice(-1)[0];
  if (latestView) {
    push(latestView);
  }
};
// 滚动到选中的tag
const moveToCurrentTag = async () => {
  await nextTick();
  for (const v of navTagsList.value) {
    if (v.fullPath === unref(currentRoute).path) {
      moveToTarget(v);
      if (v.fullPath !== unref(currentRoute).fullPath) {
        viewListStore.updateVisitedView(unref(currentRoute));
      }
      break;
    }
  }
};
const tagLinksRefs = useTemplateRefsList<RouterLinkProps>();
const moveToTarget = (currentTag: RouteLocationNormalizedLoaded) => {
  const wrap$ = unref(scrollbarRef)?.wrapRef;
  let firstTag: any = null;
  let lastTag: any = null;
  //
  const tagList = unref(tagLinksRefs);
  // find first tag and last tag
  if (tagList.length > 0) {
    firstTag = tagList[0];
    lastTag = tagList[tagList.length - 1];
  }
  if (
    (firstTag?.to as RouteLocationNormalizedLoaded).fullPath ===
    currentTag.fullPath
  ) {
    // 直接滚动到0的位置
    const { start } = useScrollTo({
      el: wrap$!,
      position: "scrollLeft",
      to: 0,
      duration: 500,
    });
    start();
  } else if (
    (lastTag?.to as RouteLocationNormalizedLoaded).fullPath ===
    currentTag.fullPath
  ) {
    // 滚动到最后的位置
    const { start } = useScrollTo({
      el: wrap$!,
      position: "scrollLeft",
      to: wrap$!.scrollWidth - wrap$!.offsetWidth,
      duration: 500,
    });
    start();
  } else {
    // find preTag and nextTag
    const currentIndex: number = tagList.findIndex(
      (item) =>
        (item?.to as RouteLocationNormalizedLoaded).fullPath ===
        currentTag.fullPath,
    );
    const tgsRefs = document.getElementsByClassName("tags-item");
    const prevTag = tgsRefs[currentIndex - 1] as HTMLElement;
    const nextTag = tgsRefs[currentIndex + 1] as HTMLElement;
    // the tag's offsetLeft after of nextTag
    const afterNextTagOffsetLeft = nextTag.offsetLeft + nextTag.offsetWidth + 4;
    // the tag's offsetLeft before of prevTag
    const beforePrevTagOffsetLeft = prevTag.offsetLeft - 4;
    if (afterNextTagOffsetLeft > unref(scrollLeftNumber) + wrap$!.offsetWidth) {
      const { start } = useScrollTo({
        el: wrap$!,
        position: "scrollLeft",
        to: afterNextTagOffsetLeft - wrap$!.offsetWidth,
        duration: 500,
      });
      start();
    } else if (beforePrevTagOffsetLeft < unref(scrollLeftNumber)) {
      const { start } = useScrollTo({
        el: wrap$!,
        position: "scrollLeft",
        to: beforePrevTagOffsetLeft,
        duration: 500,
      });
      start();
    }
  }
};
// 是否是当前tag
const isActive = (route: RouteLocationNormalizedLoaded): boolean => {
  return route.path === unref(currentRoute).path;
};
// 所有右键菜单组件的元素
const itemRefs = useTemplateRefsList<InstanceType<any>>();
// 右键菜单装填改变的时候
const visibleChange = (
  visible: boolean,
  tagItem: RouteLocationNormalizedLoaded,
) => {
  selectedTag.value = tagItem;
  viewListStore.setCurrentView(tagItem);
  if (visible) {
    for (let v of unref(itemRefs)) {
      const elDropdownMenuRef = v.elDropdownMenuRef;
      if (tagItem.fullPath !== v.tagItem.fullPath) {
        elDropdownMenuRef?.handleClose();
      }
    }
  }
};
// elscroll 实例
const scrollbarRef = ref<any>(null);
// 保存滚动位置
const scrollLeftNumber = ref(0);
const scroll = (scroll: any) => {
  scrollLeftNumber.value = scroll.scrollLeft as number;
};
// 移动到某个位置
const move = (to: number) => {
  const wrap$ = unref(scrollbarRef)?.wrapRef;
  const { start } = useScrollTo({
    el: wrap$!,
    position: "scrollLeft",
    to: unref(scrollLeftNumber) + to,
    duration: 500,
  });
  start();
};
onMounted(() => {
  initTags();
  addTags();
});
watch(
  () => currentRoute.value,
  () => {
    addTags();
    moveToCurrentTag();
  },
);
</script>
<template>
  <div class="prefixCls">
    <el-tooltip :content="i18n('tags.moveToLeft')">
      <span class="tool" @click="move(-200)">
        <star-horse-icon
          icon-class="arrow-double-left"
          size="16px"
          style="color: var(--star-horse-style)"
          cursor="pointer"
        />
      </span>
    </el-tooltip>
    <div class="overflow-hidden">
      <ElScrollbar ref="scrollbarRef" style="height: 100%" @scroll="scroll">
        <div class="flex items-center relative z-99">
          <ContextMenu
            :ref="itemRefs.set"
            v-for="item in navTagsList"
            :schema="[
              {
                icon: 'refresh',
                label: i18n('tags.refreshPage'),
                disabled: false,
                command: () => {
                  refreshSelectedTag(item);
                },
              },
              {
                icon: 'close',
                label: i18n('tags.closePage'),
                disabled: item.path == '/home',
                command: () => {
                  closeSelectedTag(item);
                },
              },
              {
                divided: true,
                icon: 'list-left',
                label: i18n('tags.closeLeftPages'),
                disabled: false,
                command: () => {
                  closeLeftTags();
                },
              },
              {
                icon: 'list-right',
                label: i18n('tags.closeRightPages'),
                disabled: false,
                command: () => {
                  closeRightTags();
                },
              },
              {
                divided: true,
                icon: 'other',
                label: i18n('tags.closeOthers'),
                disabled: false,
                command: () => {
                  closeOthersTags();
                },
              },
              {
                icon: 'close-all',
                label: i18n('tags.closeAll'),
                command: () => {
                  closeAllTags();
                },
              },
            ]"
            :tag-item="item"
            :key="item.path"
            @visible-change="visibleChange"
            :class="['tags-item', $route.path === item.path ? 'is-active' : '']"
          >
            <div class="flex items-center justify-between">
              <router-link
                :ref="tagLinksRefs.set"
                :to="{ ...item }"
                custom
                v-slot="{ navigate }"
              >
                <div @click="navigate" class="tags">
                  <el-icon
                    :style="{
                      color:
                        $route.path === item.path
                          ? 'var(--star-horse-white)'
                          : '',
                      size: '18px',
                    }"
                  >
                    <component :is="item.meta.menuIcon || 'document'" />
                  </el-icon>
                  &nbsp;{{ item.meta.title }}
                  <star-horse-icon
                    v-if="item.path != '/home'"
                    icon-class="close"
                    class="close-icon"
                    cursor="pointer"
                    @click.prevent.stop="closeSelectedTag(item)"
                  />
                </div>
              </router-link>
            </div>
          </ContextMenu>
        </div>
      </ElScrollbar>
    </div>
    <el-tooltip :content="i18n('tags.moveToRight')">
      <span class="tool border-r border-[var(--star-horse-style)]" @click="move(200)">
        <star-horse-icon
          icon-class="arrow-double-right"
          size="16px"
          style="color: var(--star-horse-style)"
          cursor="pointer"
        />
      </span>
    </el-tooltip>
    <el-tooltip :content="i18n('tags.refreshMenu')">
      <span class="tool  border-r border-[var(--star-horse-style)]" @click="refreshSelectedTag(selectedTag)">
        <star-horse-icon
          icon-class="refresh"
          size="16px"
          style="color: var(--star-horse-style)"
          cursor="pointer"
        />
      </span>
    </el-tooltip>
    <ContextMenu
      trigger="click"
      :schema="[
        {
          icon: 'refresh',
          label: i18n('tags.refreshPage'),
          disabled: false,
          command: () => {
            refreshSelectedTag(selectedTag);
          },
        },
        {
          icon: 'close',
          label: i18n('tags.closePage'),
          disabled: currentRoute.path == '/home',
          command: () => {
            closeSelectedTag(selectedTag!);
          },
        },
        {
          divided: true,
          icon: 'list-left',
          label: i18n('tags.closeLeftPages'),
          disabled: false,
          command: () => {
            closeLeftTags();
          },
        },
        {
          icon: 'list-right',
          label: i18n('tags.closeRightPages'),
          disabled: false,
          command: () => {
            closeRightTags();
          },
        },
        {
          divided: true,
          icon: 'other',
          label: i18n('tags.closeOthers'),
          disabled: false,
          command: () => {
            closeOthersTags();
          },
        },
        {
          icon: 'close-all',
          label: i18n('tags.closeAll'),
          command: () => {
            closeAllTags();
          },
        },
      ]"
    >
      <span class="tool">
        <star-horse-icon
          icon-class="menu"
          size="16px"
          style="color: var(--star-horse-style)"
          cursor="pointer"
        />
      </span>
    </ContextMenu>
  </div>
</template>
<style lang="scss" scoped>
.prefixCls {
  display: flex;
  width: 100%;
  align-items: center;
  background: var(--star-horse-background);
  border: 1px solid #eee;
  padding:3px 0;
  :deep(.scrollbar__view) {
    height: 100%;
  }

  .overflow-hidden {
    position: relative;
    overflow-x: hidden;
    flex: 1;
  }

  .tool {
    position: relative;
    display: flex;
    width: 30px;
    height: 20px;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
  &:hover {
      :deep(span) {
        color: #000000 !important;
      }
    }
  }

  .tags-item {
    position: relative;
    align-items: center;
    margin: 1px 2px;
    padding-right: 4px;
    font-size: 12px;
    cursor: pointer;
    height: 100%;
    border: 1px solid #d9d9d9;
    display: inline-flex;
    border-radius: 2px;

    .close-icon {
      color: var(--el-color-error);
      display: none;
    }

    :not(.close-icon):hover {
      padding-right: unset;

      .close-icon {
        display: block;
      }
    }

    .tags {
      height: 30px;
      display: flex;
      position: relative;
      padding-left: 5px;
      right: 1px;
      vertical-align: middle;
      justify-content: center;
      align-items: center;
      white-space: nowrap;
    }
  }

  .tags-item:not(.is-active) {
    &:hover {
      color: var(--star-horse-style);
    }
  }

  .tags-item.is-active {
    color: var(--el-color-white);
    background-color: var(--star-horse-style);
    border: 1px solid var(--star-horse-style);

    :deep(.el-icon) {
      svg {
        color: var(--star-horse-white);
      }
    }

    .item--close {
      :deep(span) {
        color: var(--el-color-white) !important;
      }
    }
  }
}
</style>
