<script setup lang="ts" name="Menusinfo">
import {
  apiInstance,
  ApiUrls,
  closeLoad,
  createTree,
  dialogPreps,
  dictData,
  error,
  load,
  loadData,
  PageFieldInfo,
  piniaInstance,
  postRequest,
  SearchFields,
  SelectOption,
  success,
  useGlobalConfigStore,
  UserFuncInfo,
  warning,
} from 'star-horse-lowcode';
import { findNodesWithValue, treeCheckChange } from '@/api/system';
import { loadSvgIcons, loadSystemInfo } from '@/api/star_horse_utils';
import { Config } from '@/api/settings';
import { computed, onMounted, provide, reactive, ref, unref } from 'vue';
import { TreeNodeData } from 'element-plus/es/components/tree-v2/src/types';

const dataUrl: ApiUrls = apiInstance('system-config', 'system/menusinfoEntity');
let parentMenus: any = ref<any>([]);
let searchParentMenus: any = ref<any>([]);
let informationsList: any = ref<any>([]);
const currentInformation = ref<any>(null);
const defaultCondition = ref<any>([]);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: '菜单名称',
      defaultVisible: true,
      fieldName: 'menuName',
      matchType: 'lk',
    },
    { label: '菜单编码', fieldName: 'menuCode', matchType: 'lk' },
  ],
});
const primaryKey = 'idMenusinfo';
let openTypeList = ref<SelectOption[]>([]);
const parentMenuList = ref<SelectOption[]>([]);
const appList = ref<SelectOption[]>([]);
const menuExchangeFieldList = reactive<PageFieldInfo>({
  fieldList: [
    [
      {
        label: '原应用',
        fieldName: 'sourceAppId',
        type: 'tselect',
        actions: {
          change: (val: any) => {
            loadMenuBySystemId(val['sourceAppId']);
          },
        },
        preps: {
          data: informationsList,
          checkStrictly: true,
        },
        required: true,
        formVisible: true,
      },
      {
        label: '新应用',
        fieldName: 'targetAppId',
        type: 'tselect',
        preps: {
          data: informationsList,
          checkStrictly: true,
        },
        actions: {
          change: (val: any) => {
            parentMenuList.value = [];
            loadMenuBySystemId(val['targetAppId'], 2);
          },
        },
        required: true,
        formVisible: true,
      },
    ],
    [
      {
        label: '新应用的父级菜单',
        fieldName: 'parentNo',
        type: 'tselect',
        preps: {
          checkStrictly: true,
          data: parentMenuList,
        },
        formVisible: true,
      },
      {
        label: '菜单切换方式',
        fieldName: 'exchangeType',
        type: 'switch',
        defaultValue: 'move',
        preps: {
          activeValue: 'move',
          inactiveValue: 'copy',
          activeText: '移动',
          inactiveText: '复制',
        },
        formVisible: true,
      },
    ],
    {
      label: '菜单列表',
      fieldName: 'menusList',
      type: 'transfer',
      required: true,
      formVisible: true,
      preps: {
        titles: ['原应用菜单', '目标应用菜单'],
        buttonTexts: ['退回左边', '添加到右边'],
        props: {
          key: primaryKey,
          label: 'menuName',
        },
        data: appList,
      },
    },
  ],
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: '主键',
      fieldName: 'idMenusinfo',
    },
    [
      {
        label: '菜单名称',
        fieldName: 'menuName',

        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: '菜单路径',
        fieldName: 'menuPath',

        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],
    [
      {
        label: '归属应用名称',
        fieldName: 'idInformations',
        type: 'tselect',
        required: true,
        formVisible: true,
        defaultValue: currentInformation,
        actions: {
          change: (val: any) => {
            let systemId = val['idInformations'];
            if (!systemId) {
              return;
            }
            loadMenuBySystemId(systemId);
          },
        },
        listVisible: true,
        preps: {
          data: informationsList,
          checkStrictly: true,
        },
      },
      {
        label: '父菜单',
        fieldName: 'parentNo',
        type: 'tselect',
        formVisible: true,
        preps: {
          checkStrictly: true,
          data: parentMenus,
        },
      },
    ],
    {
      label: '菜单编码',
      fieldName: 'menuCode',

      required: true,
      disabled: true,
      listVisible: true,
    },
    [
      {
        label: '排序',
        fieldName: 'dataIndex',
        type: 'number',
        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: '菜单图标',
        fieldName: 'menuIcon',
        type: 'icon',
        required: false,
        formVisible: true,
        listVisible: true,
        preps: {
          iconType: 'user',
          values: loadSvgIcons(),
        },
      },
    ],
    [
      {
        label: '是否缓存页面',
        fieldName: 'keepAlive',
        type: 'switch',
        defaultValue: 'Y',
        formVisible: true,
        listVisible: true,
        preps: {
          activeValue: 'Y',
          inactiveValue: 'N',
        },
      },
      {
        label: '页面打开方式',
        fieldName: 'openType',
        type: 'select',
        required: true,
        formVisible: true,
        defaultValue: 'self',
        listVisible: true,
        preps: {
          values: openTypeList,
        },
      },
    ],
    {
      label: '菜单描述',
      fieldName: 'menuDesc',
      type: 'textarea',
      formVisible: true,
      listVisible: true,
    },
    {
      label: '创建人',
      disabled: true,
      fieldName: 'createdBy',
    },
    {
      label: '修改人',
      disabled: true,
      fieldName: 'updatedBy',
    },
    {
      label: '创建日期',
      disabled: true,
      fieldName: 'createdTime',
      type: 'date',
    },
    {
      label: '修改日期',
      disabled: true,
      fieldName: 'updatedTime',
      type: 'date',
    },
    {
      label: '数据版本号',
      fieldName: 'version',
      type: 'number',
    },
    {
      label: '是否已逻辑',
      fieldName: 'isDel',
      type: 'number',
    },
    {
      label: '数据编号',
      fieldName: 'dataNo',
    },
    {
      label: '状态码',
      fieldName: 'statusCode',
    },
    {
      label: '状态码名称',
      fieldName: 'statusName',
    },
    {
      label: '国际码',
      fieldName: 'local',
    },
  ],
  cellEditable: true,
});
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(
  () => configStore.configFormInfo?.inputSize || Config.compSize,
);

const rules = {};
const dataForm = ref<any>({});
const loadMenuBySystemId = async (systemId: string, type: number = 1) => {
  if (!systemId) {
    return;
  }
  let params = [
    {
      propertyName: 'idInformations',
      value: systemId,
    },
  ];
  defaultCondition.value = params;
  let { data } = await loadData(
    `${dataUrl.basePrefix}/getAllTreeDataByCondition/false`,
    params,
  );
  if (data) {
    if (type == 2) {
      parentMenuList.value = createTree(
        JSON.parse(JSON.stringify(data)),
        'dataNo',
        'menuName',
        'idMenusinfo',
      );
    } else {
      appList.value = data;
      parentMenus.value = createTree(
        JSON.parse(JSON.stringify(data)),
        'dataNo',
        'menuName',
        'idMenusinfo',
      );
    }
  }
};
const dialogProps = dialogPreps();
provide('dialogProps', dialogProps);

const menuFormRef = ref();
const menuExchangeFormRef = ref();
const menuTableListRef = ref();
const dataFormat = (name: string, cellValue: any, row: any): any => {
  if (name == 'idInformations') {
    return (
      findNodesWithValue(informationsList.value, 'value', cellValue)?.find(
        (item) => item.value == cellValue,
      )?.name || cellValue
    );
  } else if (name == 'parentNo') {
    //let fdata = parentMenus.value.find(item => item.value == cellValue);
    return row && row['parentData'] ? row['parentData'].menuName : cellValue;
  }
  return cellValue;
};
const merge = (type: string) => {
  menuFormRef.value!.$refs['starHorseFormRef'].validate((result: boolean) => {
    if (!result) {
      return;
    }
    doMerge(type);
  });
};
const mergeDraft = (type: string) => {
  doMerge(type);
};
const doMerge = (type: string) => {
  load('数据处理中');
  let temp = unref(menuFormRef.value.getFormData());
  postRequest(dataUrl.mergeUrl!, temp)
    .then((res) => {
      closeLoad();
      if (res.data.code != 0) {
        warning(res.data.cnMessage);
        return;
      } else {
        success(res.data.cnMessage);
      }
      resetForm();
      if (type == 'close') {
        dialogProps.editVisible = false;
      }
      menuTableListRef.value!.loadByPage();
      loadMenuBySystemId(currentInformation.value);
      //关闭弹窗
    })
    .catch((err) => {
      error('接口调用异常' + err);
    })
    .finally(() => {
      closeLoad();
    });
};
const resetForm = () => {
  dataForm.value = {};
};
let extendBtns = ref<UserFuncInfo[]>([
  {
    btnName: '添加子菜单',
    authority: 'add',
    icon: 'plus',
    priority: 1,
    funcName: (row: any) => {
      dialogProps.ids = -1;
      dataForm.value['parentNo'] = row['dataNo'];
      dialogProps.editVisible = true;
    },
  },
  {
    btnName: '菜单批量调整',
    authority: 'edit',
    icon: 'exchange',
    priority: 100,
    position: 'toolbar',
    funcName: (row: any) => {
      dialogProps.ids = -1;
      // dataForm.value["parentNo"] = row["dataNo"];
      appList.value = [];
      dialogProps.batchEditVisible = true;
    },
  },
]);
const exchangeMerge = (type: string) => {
  menuExchangeFormRef.value!.$refs['starHorseFormRef'].validate(
    (result: boolean) => {
      if (!result) {
        return;
      }
      load('数据处理中');
      const formData = unref(menuExchangeFormRef.value.getFormData());
      postRequest(`${dataUrl.basePrefix}/batchSwitchMenus`, formData)
        .then((res) => {
          if (res.data.code) {
            warning(res.data.cnMessage);
            return;
          } else {
            success(res.data.cnMessage);
          }
          menuExchangeFormRef.value.resetForm();
          appList.value = [];
          if (type == 'close') {
            dialogProps.batchEditVisible = false;
          }
          menuTableListRef.value!.loadByPage();
        })
        .catch((err) => {
          error('接口调用异常' + err);
        })
        .finally(() => {
          closeLoad();
        });
    },
  );
};
/**
 * 点击事件
 * @param data
 * @param checked
 */
const checkChange = (data: TreeNodeData, checked: boolean) => {
  treeCheckChange(menuTableListRef.value, data);
  currentInformation.value = data.value;
  loadMenuBySystemId(data.value);
};
const initData = async () => {
  let params: any = [{ propertyName: 'statusCode', value: '1' }];
  informationsList.value = await loadSystemInfo(params);
  openTypeList.value = await dictData('page_open_type');
  // await loadMenuBySystemId(true);
  let { data } = await loadData(dataUrl.listConditionUrl!, params);
  if (data) {
    data.forEach((item: any) => {
      let temp: SelectOption = { name: item.menuName, value: item.dataNo };
      searchParentMenus.value.push(temp);
    });
  }
  // menuIconList.value = loadElementPlusIcon();
};
onMounted(async () => {
  await initData();
});
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      title="菜单批量调整"
      :isShowBtnContinue="true"
      :dialogVisible="dialogProps.batchEditVisible"
      :dialogProps="dialogProps"
      :self-func="true"
      @merge="exchangeMerge"
    >
      <star-horse-form
        :compUrl="dataUrl"
        :fieldList="menuExchangeFieldList"
        :primaryKey="primaryKey"
        ref="menuExchangeFormRef"
      />
    </star-horse-dialog>
    <star-horse-dialog
      :isShowBtnContinue="true"
      :dialogVisible="dialogProps.editVisible"
      :dialogProps="dialogProps"
      :self-func="true"
      @merge="merge"
      @mergeDraft="mergeDraft"
      @resetForm="resetForm"
    >
      <star-horse-form
        :outerFormData="dataForm"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        ref="menuFormRef"
      />
    </star-horse-dialog>
    <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :source="3"
    >
      <star-horse-data-view
        :dataFormat="dataFormat"
        :field-list="tableFieldList"
        :compUrl="dataUrl"
      />
    </star-horse-dialog>
    <el-card class="inner_content">
      <el-splitter>
        <el-splitter-panel collapsible size="240" min="100" max="500">
          <star-horse-tree
            v-model:treeDatas="informationsList"
            :treeTitle="'应用列表'"
            @selectData="checkChange"
            :comp-size="compSize"
          />
        </el-splitter-panel>
        <el-splitter-panel>
          <el-card class="inner_content">
            <div class="search-content">
              <div class="search_btn">
                <star-horse-search-comp
                  @searchData="
                    (data: any) => menuTableListRef?.createSearchParams(data)
                  "
                  :formData="searchFormData"
                  :compUrl="dataUrl"
                />
              </div>
            </div>
            <star-horse-table-comp
              :fieldList="tableFieldList"
              :primaryKey="primaryKey"
              :compUrl="dataUrl"
              :extendBtns="extendBtns"
              :dataFormat="dataFormat"
              :show-batch-field="true"
              ref="menuTableListRef"
            />
          </el-card>
        </el-splitter-panel>
      </el-splitter>
    </el-card>
  </div>
</template>
<style lang="scss" scoped></style>
