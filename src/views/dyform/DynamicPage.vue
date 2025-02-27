<script lang="ts" setup name="DynamicPage">
import {defineAsyncComponent, h, nextTick, onMounted, ref, render} from 'vue';
import {apiInstance} from '@/api/sh_api';
import Guides from 'vue3-guides';
import {VueInfiniteViewer} from 'vue3-infinite-viewer';
import {i18n} from '@/lang';
import PageHeader from '@/views/dyform/page/PageHeader.vue';
import PagePosition from '@/views/dyform/page/PagePosition.vue';
import PageBackground from '@/views/dyform/page/PageBackground.vue';
import PageFont from '@/views/dyform/page/PageFont.vue';
import 'gridstack/dist/gridstack.min.css';
import {GridStack} from 'gridstack';
import {GridStackWidget} from 'gridstack/dist/types';
import {createComponent} from '@/api/system.ts';
import StarHorseDraggable from '@/components/comp/StarHorseDraggable.vue';
import {DynamicNode} from '@/components/types/DynamicNode';

const dataUrl = apiInstance('userdb-manage', 'userdb/dynamicPage');
const horizontalGuides = ref();
const verticalGuides = ref();
const vueInfiniteViewerRef = ref();
const gridStackInstance = ref<GridStack>(null);
let panelModel = ref<string>('first');
let propertyItem = ref<string>('1');
let scrollX = ref<number>(0);
let scrollY = ref<number>(0);
let dyPageInfo = ref<any>({
  position: {},
  background: {},
  pageFont: {},

});
const initGuides = async () => {

  await nextTick(() => {
    horizontalGuides.value?.resize();
    verticalGuides.value?.resize();
    window.addEventListener('resize', () => {
      horizontalGuides.value?.resize();
      verticalGuides.value?.resize();
    });
    window.addEventListener('wheel', e => {
      scrollX.value += e.deltaX;
      scrollY.value += e.deltaY;
      horizontalGuides.value?.scroll(scrollX.value);
      horizontalGuides.value?.scrollGuides(scrollY.value);
      verticalGuides.value?.scroll(scrollY.value);
      verticalGuides.value?.scrollGuides(scrollX.value);
    });
  });
  // gridStackInstance.value = GridStack.init({
  //   acceptWidgets: true,
  //   margin: 5,
  //   resizable: {
  //     handles: 'e,se,s,sw,w'
  //   }
  // });
  // //https://gridstackjs.com/demo/nested.html#
  // //添加删除子节点的回调函数
  // GridStack.addRemoveCB = listenCompChange;
  // //todo 拖拽
  // let sidebarContent = [
  //   {w: 2, h: 2, subGridOpts: {children: [{content: 'nest'}]}}
  // ];
  // GridStack.setupDragIn('.star-horse-page', undefined, sidebarContent);
};
let currentItem = ref<string>('');
const dragItem = (item: any) => {
  currentItem.value = item;
  items.value.push(item);
  console.log(item);
};
const init = async () => {
  await initGuides();
  onRestore();
};
const onChange = (e: any) => {
  console.log(e);
};
const count = ref<number>(0);
let items = ref<Array<DynamicNode>>([
  {
    x: 1,
    y: 1,
    w: 2,
    h: 2,
    id: '1',
    name: '测试',
    content: '1',
  }
]);
const dynamicComponent = (itemName: string) => {
  const AsyncComp = defineAsyncComponent({
    // 加载函数
    loader: () => import(`@/components/formcomp/items/${itemName}.vue`),
    // 加载失败的回调
    onError: (err) => {
      console.error(err);
    },
  });
  let components: any = {};
  components[itemName] = AsyncComp;
  return createComponent({
    components: components,
    name: 'dynamicComponent',
    template: `
      <div ref="root" class="grid-stack-item my-custom-grid-item-component">
        <div class="grid-stack-item-content">
          <component :is="itemName" :field="{preps:{}}" :formData="{}"/>
        </div>
      </div>`,
    props: {
      itemName: {
        type: String,
        required: true
      },
      itemId: {type: String || Number},
    },
    methods: {},
    emits: ['remove'],
  });
};

let shadowDom: any = {};
const listenCompChange = (parent: HTMLElement, item: GridStackWidget, add: boolean, grid: boolean) => {
  if (!parent) {
    return;
  }
  //currentItem 没有赋值
  if (!currentItem.value) {
    return;
  }
  // Not supported yet
  if (grid) {
    return;
  }
  if (add) {
    let itemName = currentItem.value + '-item';
    let itemId: string = item.id!;
    let itemVNode = h(
        dynamicComponent(itemName)!,
        {
          itemId: itemId,
          itemName: itemName,
          onRemove: (itemEl: any) => {
            gridStackInstance.value?.removeWidget(itemEl);
          }
        }
    );
    shadowDom[itemId] = document.createElement('div');
    render(itemVNode, shadowDom[itemId]);
    return itemVNode.el;
  } else {
    let itemId = item.id!;
    render(null, shadowDom[itemId]);
    return;
  }
};
const target = ref();
const addNewWidget = () => {
  currentItem.value = 'cron';
  const node = items.value[count.value] || {
    x: Math.round(12 * Math.random()),
    y: Math.round(5 * Math.random()),
    w: Math.round(1 + 3 * Math.random()),
    h: Math.round(1 + 3 * Math.random()),
  };
  node.id = String(count.value++);
  // items.value.push(node);
  gridStackInstance.value?.addWidget(node);
};
const viewScroller = (e: any) => {
  let type = e.currentTarget.horizontalScrollbar.type;
  if (type == 'horizontal') {
    horizontalGuides.value?.scroll(e.scrollLeft);
    horizontalGuides.value?.scrollGuides(e.scrollTop);
  } else {
    verticalGuides.value?.scroll(e.scrollTop);
    verticalGuides.value?.scrollGuides(e.scrollLeft);
  }
};
let testFormData = ref<any>({});
const onRestore = () => {
  scrollX.value = 0;
  scrollY.value = 0;
  horizontalGuides.value?.scroll(0);
  horizontalGuides.value?.scrollGuides(0);
  verticalGuides.value?.scroll(0);
  verticalGuides.value?.scrollGuides(0);
  // vueInfiniteViewerRef.value?.scrollCenter();
};
onMounted(async () => {
  await init();
});
</script>
<template>
  <el-card class="inner_content">
    <page-header/>
    <div class="page-content">
      <div class="panel">
        <el-tabs style="width: 100%;height: 100%;background: #1d2129;border: none" tab-position="left"
                 type="border-card" v-model="panelModel">
          <el-tab-pane label="基础信息" name="first">
            <div class="add-weidget" @click="addNewWidget">
              <star-horse-icon icon-class="plus" color="#fefefe"/>
            </div>
            <div class="star-horse-page " @click="dragItem('input-item')">拖拽1
            </div>
            <div class="star-horse-page " @click="dragItem('switch-item')">拖拽2
            </div>
          </el-tab-pane>
          <el-tab-pane label="高级信息" name="second">
          </el-tab-pane>
          <el-tab-pane label="扩展信息" name="third">
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="page">
        <div class="box" @click="onRestore" ref="box">
          <star-horse-icon icon-class="reset" color="#fefefe"/>
        </div>
        <div class="ruler horizontal">
          <Guides
              ref="horizontalGuides"
              type="horizontal"
              v-bind:rulerStyle="{
                left: '30px',
                width: 'calc(100% - 30px)',
                height: '30px',
              }"
          />
        </div>
        <div class="ruler vertical">
          <Guides
              ref="verticalGuides"
              type="vertical"
              displayDragPos="true"
              v-bind:rulerStyle="{
                top: '30px',
                height: 'calc(100% - 30px)',
                width: '30px',
             }"
              v-on:changeGuides="onChange"
          />
        </div>
        <VueInfiniteViewer
            ref="vueInfiniteViewerRef"
            :usePinch="true"
            :useWheelScroll="()=>{
              return true;
            }"
            :maxPinchWheel="3"
            :zoom="1"
            @scroll="viewScroller"
            class="viewer">
          <div class="agrid-stack"
               :style="{
            ...dyPageInfo.position,

            height: dyPageInfo.position.height||'100%',
            width: dyPageInfo.position.width||'100%',
            overflow: dyPageInfo.position.overflow||'auto',
            paddingLeft: dyPageInfo.position.paddingLeft||'0',
            paddingRight: dyPageInfo.position.paddingRight||'0',
            paddingTop: dyPageInfo.position.paddingTop||'0',
            paddingBottom: dyPageInfo.position.paddingBottom||'0',
            marginLeft: dyPageInfo.position.marginLeft||'0',
            marginRight:dyPageInfo.position.marginRight||'0',
            marginTop: dyPageInfo.position.marginTop||'0',
            marginBottom: dyPageInfo.position.marginBottom||'0',
             ...dyPageInfo.background,
            ...dyPageInfo.pageFont,
          }">
            <template v-for="(item,ind) in items">
              <StarHorseDraggable :node="item" :msg="item.name"/>
            </template>
          </div>
        </VueInfiniteViewer>

      </div>
      <div class="property">
        <el-scrollbar>
          <el-collapse v-model="propertyItem" style="background: #1d2129!important;">
            <el-collapse-item name="1">
              <template #title>
                <div class="collapse-item-title title">
                  <div>位置大小</div>
                </div>
              </template>
              <page-position v-model:position="dyPageInfo.position"/>
            </el-collapse-item>
            <el-collapse-item name="2">
              <template #title>
                <div class="collapse-item-title title">
                  <div>背景</div>
                </div>
              </template>
              <page-background :background="dyPageInfo.background"/>
            </el-collapse-item>

            <el-collapse-item name="3">
              <template #title>
                <div class="collapse-item-title title">
                  <div>文字</div>
                </div>
              </template>
              <page-font :pageFont="dyPageInfo.pageFont"/>
            </el-collapse-item>
          </el-collapse>
        </el-scrollbar>
      </div>
    </div>
    <div class="main-copyright">{{ i18n("starhorse.copyright") }}</div>
  </el-card>
</template>


<style lang="scss" scoped>
.star-horse-page {
  cursor: move;
}

.agrid-stack {
  height: 100%;
  position: relative;
  top: 0;
  left: 0;
  transform: translate(0, 0);
}

:deep(.grid-stack-item-content) {
  background-color: var(--star-horse-style);
}

.title {
  color: var(--star-horse-white);
}

:deep(.el-collapse-item), :deep(.el-collapse-item__content) {
  background: #1d2129 !important;
}

:deep(.el-collapse-item__header) {
  background: #1d2129 !important;
  border: none !important;
}

:deep(el-collapse-item__wrapper) {
  background: #1d2129 !important;
}

:deep(.el-tabs__content) {
  padding: 5px;
}

.viewer {
  display: flex;
  flex: 1;
  position: absolute !important;
  left: calc(30px);
  top: 30px;
  height: 100%;
  width: calc(100% - 30px);
  height: calc(100% - 30px);

}

:deep(.el-tabs__header) {
  background: #1d2129;
  border: none;
}

:deep(.el-tabs__item) {
  height: 80px !important;
  display: flex;
  padding: 0 5px;
  align-items: center;
  justify-content: center !important;
  vertical-align: middle !important;
  writing-mode: vertical-lr;
  flex-direction: row !important;
  text-align: center;
}

.page-header {
  height: 50px;
  background-color: #1d2129;
  border-bottom: 1px solid #4e5969;
  color: #c9ddd4;
  display: flex;
  justify-content: space-between;
}

.page-content {
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .panel {
    width: 200px;
    height: inherit;
    background-color: #1d2129;
    border-bottom: 1px solid #4e5969;
    color: #c9ddd4;
    display: flex;
    justify-content: space-between;
  }

  .page {
    position: relative;
    flex: 1;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #86909c;

    .container {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  }

  .property {
    border-left: 1px solid #4e5969;
    width: 260px;
    background-color: #272e3b;
    color: #fff;
    display: flex;
    flex-direction: column;
    min-height: 35px;
    min-width: 35px;
  }
}

a {
  text-decoration: none;
  color: #333;
}

.ruler {
  position: absolute;
  top: 0;
  left: 0;
}

.ruler.horizontal {
  left: 0;
  width: 100%;
  height: 30px;
}

.ruler.vertical {
  top: 0;
  width: 30px;
  height: 100%;
}

.box {
  position: relative;
  width: 30px;
  height: 30px;
  background: #444;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  cursor: pointer;
  z-index: 21;
}

.container {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  max-width: calc(100% - 60px);
  width: 100%;
}


</style>

