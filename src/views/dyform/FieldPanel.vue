<script setup lang="ts" name="FieldPanel">
import { computed, ref } from 'vue';
import {
  apiInstance,
  ApiUrls,
  loadData,
  piniaInstance,
  useDesignFormStore,
} from 'star-horse-lowcode';
import { fieldCopy } from '@/views/dyform/utils/FieldOperationUtils';

const props = defineProps({
  batchCreatePage: { type: Boolean, default: false },
});
const emits = defineEmits(['loadData']);
const dataUrl: ApiUrls = apiInstance('userdb-manage', 'userdb/dynamicForm');
let designForm = useDesignFormStore(piniaInstance);
let formDataList = computed(() => designForm.formDataList);
let containerList = computed(() => designForm.containerList);
let selfFormDataList = computed(() => designForm.selfFormDataList);
let list = computed(() => designForm.compList);
let tabModel = ref<string>('component');
let activeNames = ref(['a', 'b', 'c', 'd']);

const onContainerCopy = (data: any) => {
  return onDataCopy(data, 'container');
};
const onFormItemCopy = (data: any) => {
  return onDataCopy(data, 'formItem');
};

const onDataCopy = (data: any, type: string) => {
  let mvData = fieldCopy(data, type);
  designForm.setDraggingItem(mvData);
  return mvData;
};
const templateList = ref<any[]>([]);
const previewImages = ref<Record<string, string>>({}); // 新增：存储生成的图片

const tabChange = (name: string) => {
  if (name == 'template') {
    loadData(dataUrl.basePrefix + '/loadTemplate', {}).then(
      async (res: any) => {
        templateList.value = res.data || [];
      },
    );
  }
};
const loadFormData = (formId: any) => {
  emits('loadData', formId);
};
const previewRefs = ref<any[]>([]); // 新增ref数组
// 新增：生成所有预览图片的方法
const createRef = (el: any) => {
  previewRefs.value.push(el);
};
const addElement = (element: any, type: string) => {
  let mvData = fieldCopy(element, type);
  list.value.push(mvData);
  if (Array.isArray(mvData)) {
    let temp = mvData[mvData.length - 1];
    designForm.selectItem(temp, temp['itemType'], '');
  } else {
    designForm.selectItem(mvData, mvData['itemType'], '');
  }
  // designForm.addElement(element,type)
};
</script>
<template>
  <el-tabs
    v-model="tabModel"
    class="h-full w-full"
    tab-position="left"
    @tabChange="tabChange"
    type="border-card"
  >
    <el-tab-pane name="component">
      <template #label>
        <star-horse-icon
          icon-class="component"
          style="color: var(--star-horse-style)"
        />&nbsp;<span>组件</span>
      </template>
      <div class="field-area">
        <el-scrollbar height="100%">
          <el-collapse class="starhorse-collapse" v-model="activeNames">
            <el-collapse-item name="a">
              <template #title>
                <div
                  class="collapse-item-title title h-full flex justify-between"
                >
                  <div class="flex flex-row items-center h-full">布局组件</div>
                  <star-horse-icon
                    icon-class="container"
                    size="20px"
                    style="color: var(--star-horse-style); margin-right: 10px"
                  />
                </div>
              </template>
              <draggable
                :clone="onContainerCopy"
                :group="{ name: 'starHorseGroup', pull: 'clone', put: false }"
                :sort="false"
                animation="300"
                ghost-class="ghost"
                item-key="id"
                tag="ul"
                :list="containerList"
              >
                <template #item="{ element }">
                  <li
                    class="field-item"
                    @dblclick="addElement(element, 'container')"
                    :title="element.itemName"
                  >
                    &nbsp;&nbsp;
                    <span
                      ><star-horse-icon
                        :icon-class="element.itemIcon"
                        style="color: var(--star-horse-style)"
                      /><i>{{ element.itemName }}</i></span
                    >
                  </li>
                </template>
              </draggable>
            </el-collapse-item>
            <el-collapse-item name="b">
              <template #title>
                <div
                  class="collapse-item-title title h-full flex justify-between"
                >
                  <div class="flex flex-row items-center h-full">表单组件</div>
                  &nbsp;<star-horse-icon
                    icon-class="form"
                    size="20px"
                    style="color: var(--star-horse-style); margin-right: 10px"
                  />
                </div>
              </template>
              <draggable
                :clone="onFormItemCopy"
                :group="{ name: 'starHorseGroup', pull: 'clone', put: false }"
                :sort="false"
                animation="300"
                ghost-class="ghost"
                item-key="key"
                tag="ul"
                :list="formDataList"
              >
                <template #item="{ element }">
                  <li
                    class="field-item"
                    @dblclick="addElement(element, 'item')"
                    :title="element.itemName"
                  >
                    &nbsp;&nbsp;
                    <span
                      ><star-horse-icon
                        :icon-class="element.itemIcon"
                        style="color: var(--star-horse-style)"
                      /><i>{{ element.itemName }}</i></span
                    >
                  </li>
                </template>
              </draggable>
            </el-collapse-item>
            <el-collapse-item name="c">
              <template #title>
                <div
                  class="collapse-item-title title h-full flex justify-between"
                >
                  <div class="flex flex-row items-center h-full">
                    自定义组件
                  </div>
                  &nbsp;<star-horse-icon
                    icon-class="other"
                    size="24px"
                    style="color: var(--star-horse-style); margin-right: 10px"
                  />
                </div>
              </template>
              <draggable
                :clone="onFormItemCopy"
                :group="{ name: 'starHorseGroup', pull: 'clone', put: false }"
                :sort="false"
                animation="300"
                ghost-class="ghost"
                item-key="key"
                tag="ul"
                :list="selfFormDataList"
              >
                <template #item="{ element }">
                  <li
                    class="field-item"
                    @dblclick="addElement(element, 'item')"
                    :title="element.itemName"
                  >
                    &nbsp;&nbsp;
                    <span
                      ><star-horse-icon
                        :icon-class="element.itemIcon"
                        style="color: var(--star-horse-style)"
                      /><i>{{ element.itemName }}</i></span
                    >
                  </li>
                </template>
              </draggable>
              <div style="height: 50px"></div>
            </el-collapse-item>
          </el-collapse>
        </el-scrollbar>
      </div>
    </el-tab-pane>
    <el-tab-pane name="dbinfo">
      <template #label>
        <star-horse-icon
          icon-class="database"
          style="color: var(--star-horse-style)"
          size="20px"
          height="20px"
          width="20px"
        />&nbsp;<span>数据源</span>
      </template>
      <db-list-comp :batchCreatePage="batchCreatePage" />
    </el-tab-pane>
    <el-tab-pane name="charts">
      <template #label>
        <star-horse-icon
          icon-class="charts"
          style="color: var(--star-horse-style)"
        />&nbsp;<span>图表</span>
      </template>
    </el-tab-pane>
    <el-tab-pane name="template">
      <template #label>
        <star-horse-icon
          icon-class="template"
          style="color: var(--star-horse-style)"
        />&nbsp;<span>模板</span>
      </template>
      <div class="field-area m-t-8">
        <el-scrollbar height="100%">
          <el-card
            class="temp-card"
            style="margin-bottom: 10px !important"
            v-for="item in templateList"
          >
            <div class="flex w-full flex-1 justify-center items-center">
              <el-popover placement="right" :width="500">
                <template #reference>
                  <el-image :src="item.shortImages">
                    <template #error>
                      <star-horse-icon iconClass="empty_image" size="100px" />
                    </template>
                  </el-image>
                </template>
                <template #default>
                  <form-preview
                    :compSize="'small'"
                    :formDisabled="true"
                    :list="JSON.parse(item['details'].content || [])"
                    :ref="createRef"
                    class="flex w-full flex-1 justify-center items-center"
                    v-if="item['details'].content"
                  />
                </template>
              </el-popover>
            </div>
            <template #footer>
              <div class="flex items-center">
                <div
                  class="w-[60%] overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  #{{ item.formName }}
                </div>
                <div class="flex-1 justify-end">
                  <el-button
                    size="small"
                    link
                    @click="loadFormData(item.idDynamicForm)"
                    icon="plus"
                    >加载此模板
                  </el-button>
                </div>
              </div>
            </template>
          </el-card>
        </el-scrollbar>
      </div>
    </el-tab-pane>
    <el-tab-pane name="help">
      <template #label>
        <star-horse-icon
          icon-class="help"
          style="color: var(--star-horse-style)"
        />&nbsp;<span>帮助</span>
      </template>
    </el-tab-pane>
  </el-tabs>
</template>
<style lang="scss" scoped>
i {
  font-style: normal;
  font-size: 12px;
}

.temp-card {
  width: 99% !important;
  padding: 0 !important;
  margin: 0 !important;
  height: 250px !important;
  box-shadow: none !important;
  margin-bottom: 10px !important;
}

:deep(.el-collapse-item) {
  overflow: hidden;

  .el-collapse-item__wrap {
    height: 100%;
    overflow: hidden;

    .el-collapse-item__content {
      height: inherit;
      overflow: hidden;
    }
  }

  &:last-child {
    flex: 1;
    height: 100%;
  }
}

:deep {
  .el-tabs__content {
    padding: 0 !important;
  }

  .el-tabs__header.is-left {
    margin-right: 5px !important;
  }

  .el-tabs__item {
    height: 80px;
    display: flex;
    padding: 10px 5px;
    align-items: center;
    justify-content: center !important;
    vertical-align: middle !important;
    writing-mode: vertical-lr;
    flex-direction: row !important;
    text-align: center;
  }
}
</style>
