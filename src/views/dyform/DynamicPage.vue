<script lang="ts" setup name="DynamicPage">
import StarHorseRuler from "@/components/system/StarHorseRuler.vue";
import { i18n } from "@/lang";
import { appInstance } from "@/main";
import PageBackground from "@/components/system/items/PageBackground.vue";
import PageFont from "@/components/system/items/PageFont.vue";
import PageHeader from "@/views/dyform/page/PageHeader.vue";
import PagePosition from "@/components/system/items/PagePosition.vue";
import { apiInstance, createComponent, DynamicNode } from "star-horse-lowcode";
import { onMounted, ref, resolveComponent } from "vue";

/**
 * 页面设计需要先设置排版，然后在排版上增加具体的组件，这样页面发布后才不会乱,
 * 那么前提是要先设计好页面的排版得模版库，可参照flexbox-labs，然后再增加组件，这样才能保证页面的排版不会乱
 */
const dataUrl = apiInstance("userdb-manage", "userdb/dynamicPage");
let panelModel = ref<string>("first");
let propertyItem = ref<string>("1");
let dyPageInfo = ref<any>({
  position: {},
  background: {},
  pageFont: {}
});

let currentItem = ref<any>({});
const dragItem = (item: any) => {
  const temp: DynamicNode = {
    id: item,
    name: item,
  }
  currentItem.value = temp;
  items.value.push(temp);
  console.log(item);
};
const init = async () => {
};

const count = ref<number>(0);
let items = ref<Array<DynamicNode>>([
  {

    id: "1",
    name: "测试",
    content: "1"
  }
]);
const dynamicComponent = (itemName: string) => {
  // 使用 resolveComponent 获取全局注册的组件
  const globalComponent = resolveComponent(itemName);
  console.log(globalComponent);
  // const AsyncComp = defineAsyncComponent({
  //   // 加载函数
  //   loader: () => import("star-horse-lowcode").then(m => m[itemName]),
  //   // 加载失败的回调
  //   onError: (err) => {
  //     console.error(err);
  //   }
  // });
  let components: any = {};
  components[itemName] = globalComponent;
  return createComponent({
    components: components,
    name: "dynamicComponent",
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
      itemId: { type: String || Number }
    },
    methods: {},
    emits: ["remove"]
  }, appInstance);
};

let shadowDom: any = {};

const addNewWidget = () => {
  currentItem.value = "cron";
  const node = items.value[count.value] || {
    x: Math.round(12 * Math.random()),
    y: Math.round(5 * Math.random()),
    w: Math.round(1 + 3 * Math.random()),
    h: Math.round(1 + 3 * Math.random())
  };
  node.id = String(count.value++);
  // items.value.push(node);
};


const selectNode = (item: any) => {
  console.log("--------------------", item);
  currentItem.value = item;
}
onMounted(async () => {
  await init();
});
</script>
<template>
  <el-card class="inner_content">
    <page-header />
    <div class="page-content">
      <el-splitter>
        <el-splitter-panel collapsible size="250" max="350">
          <el-tabs tab-position="left" type="border-card" v-model="panelModel">
            <el-tab-pane label="布局模版" name="zero">
            </el-tab-pane>
            <el-tab-pane label="组件信息" name="first">
              <div class="add-weidget" @click="addNewWidget">
                <star-horse-icon icon-class="plus" />
              </div>
              <div class="star-horse-page" @click="dragItem('InputItem')">拖拽1</div>
              <div class="star-horse-page" @click="dragItem('SwitchItem')">拖拽2</div>
            </el-tab-pane>
            <el-tab-pane label="高级信息" name="second"></el-tab-pane>
            <el-tab-pane label="扩展信息" name="third"></el-tab-pane>
          </el-tabs>
        </el-splitter-panel>
        <el-splitter-panel>
          <StarHorseRuler>
            <div class="agrid-stack" :style="{
              ...dyPageInfo.position,

              height: dyPageInfo.position.height || '100%',
              width: dyPageInfo.position.width || '100%',
              overflow: dyPageInfo.position.overflow || 'auto',
              paddingLeft: dyPageInfo.position.paddingLeft || '0',
              paddingRight: dyPageInfo.position.paddingRight || '0',
              paddingTop: dyPageInfo.position.paddingTop || '0',
              paddingBottom: dyPageInfo.position.paddingBottom || '0',
              marginLeft: dyPageInfo.position.marginLeft || '0',
              marginRight: dyPageInfo.position.marginRight || '0',
              marginTop: dyPageInfo.position.marginTop || '0',
              marginBottom: dyPageInfo.position.marginBottom || '0',
              ...dyPageInfo.background,
              ...dyPageInfo.pageFont
            }">
              {{ items }}
              <template v-for="(item, ind) in items" :key="'data'+ind">
                <StarHorseDraggable style="pointer-events: auto !important;" :node="item" :msg="item.name"
                  :isActive="currentItem.id == item.id" @mousedown.native="selectNode(item)" />
              </template>
            </div>
          </StarHorseRuler>
        </el-splitter-panel>
        <el-splitter-panel collapsible size="250" max="350">
          <el-scrollbar>
            <el-collapse v-model="propertyItem" style="background: #1d2129 !important">
              <el-collapse-item name="1">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>位置大小</div>
                  </div>
                </template>
                <page-position v-model:position="dyPageInfo.position" />
              </el-collapse-item>
              <el-collapse-item name="2">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>背景</div>
                  </div>
                </template>
                <page-background :background="dyPageInfo.background" />
              </el-collapse-item>

              <el-collapse-item name="3">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>文字</div>
                  </div>
                </template>
                <page-font :pageFont="dyPageInfo.pageFont" />
              </el-collapse-item>
            </el-collapse>
          </el-scrollbar>
        </el-splitter-panel>
      </el-splitter>
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
  z-index: 1; // 新增层级控制
}

:deep(.grid-stack-item-content) {
  background-color: var(--star-horse-style);
  pointer-events: auto; // 新增这行修复点击穿透
}

.title {
  color: var(--star-horse-white);
}

:deep(.el-collapse-item),
:deep(.el-collapse-item__content) {
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
  background: #1d2129;

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
