<script setup lang="ts">
import {computed, nextTick, onActivated, onDeactivated, onMounted, provide, reactive, ref} from 'vue';
import {
  apiInstance,
  ApiUrls,
  createDatetime,
  dialogPreps,
  PageFieldInfo,
  piniaInstance,
  SearchFields,
  SelectOption,
  StarHorseDialog,
  UserFuncInfo
} from 'star-horse-lowcode';
import {initDbList} from "@/views/dbsearch/utils/DbSearchUtils.js";
import {loadRolesInfo} from "@/api/star_horse_utils.js";
import {permissionMenus} from "@/api/star_horse_apis.js";
import {useLoginStore} from "@/store/Login.js";

defineOptions({
  name: 'DynamicScriptConsumerView',
});
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance('userdb-manage', 'userdb/dynamicScriptConsumerView');
//主键
const primaryKey = 'idDynamicScriptConsumerView';
const dynamicScriptConsumerViewRef = ref();
const dynamicScriptConsumerViewFormRef = ref();
//定义表单的所有属性
const formFields = reactive<Object>({});
provide('formFields', formFields);
const dbList = ref<Array<SelectOption>>([]);
const loginStore = useLoginStore(piniaInstance);
const appinfoList = computed(() => loginStore.getAppInfoList());
const rolesList = ref<Array<SelectOption>>([]);
const menuList = ref<Array<SelectOption>>([]);
//查询属性
const searchFormData = reactive<SearchFields>({
  'fieldList': [{
    'label': '描述',
    'fieldName': 'scriptName',
    'type': 'input',
    'matchType': 'lk',
    'defaultVisible': true,
    'preps': {}
  }, {
    'label': '表名',
    'fieldName': 'tableName',
    'type': 'input',
    'matchType': 'lk',
    'defaultVisible': true,
    'preps': {}
  }, {
    'label': '数据库',
    'fieldName': 'idDbinfo',
    'type': 'select',
    'matchType': 'eq',
    'defaultVisible': true,
    'preps': {'values': dbList}
  }, {
    'label': '归属应用',
    'fieldName': 'idAppinfo',
    'type': 'tselect',
    'matchType': 'eq',
    'defaultVisible': false,
    'preps': {
      'data': appinfoList,
      props: {
        label: 'sysName',
        value: 'idInformations',
      },
      checkStrictly: true,
    }
  }]
});
const tableFieldList = reactive<PageFieldInfo | any>({
  'fieldList': [[{
    'label': '描述',
    'fieldName': 'scriptName',
    'type': 'input',
    'required': true,
    'formVisible': true,
    'listVisible': true,
    'preps': {}
  }, {
    'label': '表名',
    'fieldName': 'tableName',
    'type': 'input',
    'required': true,
    'formVisible': true,
    'listVisible': true,
    'preps': {
      editDisabled: true,
    }
  }], [{
    'label': '数据库',
    'fieldName': 'idDbinfo',
    'type': 'select',
    'required': true,
    'formVisible': true,
    'listVisible': true,
    'preps': {'values': dbList}
  }, {
    'label': '消费模式',
    'fieldName': 'consumerType',
    'type': 'select',
    'required': true,
    'formVisible': true,
    'listVisible': true,
    'preps': {'values': [{'name': '应用', 'value': 'app'}, {'name': '接口', 'value': 'inter'}], 'dataSource': 'data'}
  }], [{
    'label': '归属应用',
    'fieldName': 'idAppinfo',
    'type': 'tselect',
    'required': false,
    'formVisible': true,
    'listVisible': true,
    actions: {
      change: (val: any) => {
        loadMenuBySystemId(val['idAppinfo']);
      },
    },
    preps: {
      props: {
        label: 'sysName',
        value: 'idInformations',
      },
      checkStrictly: true,
      data: appinfoList,
    },
  }, {
    'label': '父级菜单',
    'fieldName': 'parentMenuNo',
    'type': 'tselect',
    'required': false,
    'formVisible': true,
    'listVisible': true,
    preps: {
      checkStrictly: true,
      data: menuList,
      props: {
        label: 'menuName',
        value: 'dataNo',
      },
    },
  }], [{
    'label': '按钮权限',
    'fieldName': 'buttonPermissions',
    'type': 'select',
    'required': false,
    'formVisible': true,
    'listVisible': true,
    'preps': {
      'urlOrDictName': 'button_authority',
      'dataSource': 'dict'
    }
  }, {
    'label': '是否认证',
    'fieldName': 'authFlag',
    'type': 'switch',
    'required': false,
    'formVisible': true,
    'listVisible': true,
    'preps': {
      activeValue: 'Y',
      inactiveValue: 'N',
    }
  }], [{
    'label': '最大消费数量',
    'fieldName': 'maxConsumerNums',
    'type': 'number',
    'required': false,
    'formVisible': true,
    'listVisible': true,
    defaultValue: 100,
    'preps': {}
  }, {
    'label': '授权用户组',
    'fieldName': 'idUserGroups',
    'type': 'select',
    'required': false,
    'formVisible': true,
    'listVisible': true,
    'preps': {'values': rolesList}
  }], [{
    'label': '服务时效',
    'fieldName': 'serviceTime',
    'type': 'daterange',
    'required': true,
    'formVisible': true,
    'listVisible': true,

    'preps': {'needSplitName': true}
  }, {
    'label': '服务状态',
    'fieldName': 'serviceStatus',
    'type': 'switch',
    'required': true,
    'formVisible': true,
    'listVisible': true,

    'preps': {
      activeValue: 'Y',
      inactiveValue: 'N',
    }
  }], [{
    'label': '脚本',
    'fieldName': 'sqlContent',
    'type': 'textarea',
    'required': true,
    'formVisible': true,
    'listVisible': true,

    'preps': {}
  }], {
    'batchFieldList': [{
      'batchName': 'dynamicScriptColumnsList',
      'title': '动态列表',
      'fieldList': [{
        'label': '字段名称',
        'fieldName': 'columnName',
        'type': 'input',
        'required': true,
        'formVisible': true,
        'listVisible': true,

        'preps': {}
      }, {
        'label': '描述',
        'fieldName': 'labelName',
        'type': 'input',
        'required': true,
        'formVisible': true,
        'listVisible': true,

        'preps': {}
      }, {
        'label': '查询显示',
        'fieldName': 'searchVisible',
        'type': 'switch',
        'required': false,
        'formVisible': true,
        'listVisible': true,

        'preps': {
          activeValue: 'Y',
          inactiveValue: 'N',
        }
      }, {
        'label': '表单显示',
        'fieldName': 'formVisible',
        'type': 'switch',
        'required': false,
        'formVisible': true,
        'listVisible': true,

        'preps': {
          activeValue: 'Y',
          inactiveValue: 'N',
        }
      }, {
        'label': '列表显示',
        'fieldName': 'listVisible',
        'type': 'switch',
        'required': false,
        'formVisible': true,
        'listVisible': true,

        'preps': {
          activeValue: 'Y',
          inactiveValue: 'N',
        }
      }],
      'subFormFlag': true
    }]
  }, {
    'label': '创建人',
    'fieldName': 'createdBy',
    'type': 'input',
    'listVisible': true,
    'preps': {},
    'commonFlag': 'Y'
  }, {
    'label': '修改人',
    'fieldName': 'updatedBy',
    'type': 'input',
    'listVisible': false,
    'preps': {},
    'commonFlag': 'Y'
  }, {
    'label': '版本号',
    'fieldName': 'version',
    'type': 'number',
    'listVisible': true,
    'preps': {},
    'commonFlag': 'Y'
  }, {
    'label': '是否删除',
    'fieldName': 'isDel',
    'type': 'number',
    'listVisible': false,
    'preps': {},
    'commonFlag': 'Y'
  }, {
    'label': '数据编号',
    'fieldName': 'dataNo',
    'type': 'input',
    'listVisible': false,
    'preps': {},
    'commonFlag': 'Y'
  }, {
    'label': '状态',
    'fieldName': 'statusCode',
    'type': 'select',
    'listVisible': false,
    'preps': {'urlOrDictName': 'common', 'name': 'statusCode', 'dataSource': 'dict'},
    'commonFlag': 'Y'
  }, {
    'label': '状态名称',
    'fieldName': 'statusName',
    'type': 'input',
    'listVisible': false,
    'preps': {},
    'commonFlag': 'Y'
  }, {
    'label': '国际编码',
    'fieldName': 'local',
    'type': 'input',
    'listVisible': false,
    'preps': {},
    'commonFlag': 'Y'
  }, {
    'label': '备注',
    'fieldName': 'remark',
    'type': 'textarea',
    'listVisible': false,
    'preps': {},
    'commonFlag': 'Y'
  }, {
    'label': '租户',
    'fieldName': 'tenantId',
    'type': 'select',
    'listVisible': false,
    'preps': {},
    'commonFlag': 'Y'
  }],
  'batchFieldList': [],
  'userTableFuncs': [],
  'dynamicFormas': [],
  'orderBy': [{'fieldName': 'idDynamicScriptConsumerView', 'ascOrDesc': 'desc'}],
  'batchName': 'batchDataList',
  'tableCellEditabled': false,
  'stopAutoLoad': false
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide('dialogProps', dialogProps);
const loadMenuBySystemId = (systemId: string) => {
  menuList.value = [];
  permissionMenus({}, systemId).then((res: any) => {
    menuList.value = res.data?.data;
  });
};
//初始化方法
const initData = async () => {
  initDbList().then((res) => {
    dbList.value = res;
  });
  loadRolesInfo([]).then((res) => {
    rolesList.value = res;
  });
};
const activated = async () => {
  await nextTick(() => {
    dynamicScriptConsumerViewRef.value.loadByPage();
  });
};
/**
 * 数据加载完成后
 * @param data 数据
 */
const dataLoaded = (data: any) => {
  //将数据范围的字段进行处理
  let temp: any = {};
  temp['serviceTime'] = [data['serviceTimeStart'], data['serviceTimeEnd']];
  if (Object.keys(temp).length > 0) {
    dynamicScriptConsumerViewFormRef.value.updateFormData(temp);
  }
};
const userBtn: UserFuncInfo[] = [{
  btnName: '解析脚本',
  icon: 'code',
  authority: 'edit',
  funcName: () => {
    alert(3);
  }
}];
const deactivated = () => {

};
/**
 * 列表，查看数据时数据转换
 * @param name 名称
 * @param cellValue 值
 * @param row 列表行数据
 */
const dataFormat = (name: string, cellValue: any, row: any): any => {
  if (name == 'serviceTime') {
    return createDatetime(row.serviceTimeStart) + '-' + createDatetime(row.serviceTimeEnd);
  }
  //转换显示信息
  return cellValue;
};
onMounted(async () => {
  await initData();
});
onActivated(() => {
  activated();
});
onDeactivated(() => {
  deactivated();
});
</script>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :userBtn="userBtn" :dialog-visible="dialogProps.editVisible"
                     :dialogProps="dialogProps">
    <star-horse-form @refresh="dynamicScriptConsumerViewRef?.loadByPage()" @dataLoaded="dataLoaded" :compUrl="dataUrl"
                     :fieldList="tableFieldList"
                     ref="dynamicScriptConsumerViewFormRef"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :source="3">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <div class="search-content">
    <div class="search_btn">
      <star-horse-search-comp
          @searchData="(data: any) => dynamicScriptConsumerViewRef?.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
      />
    </div>
  </div>
  <el-card class="inner_content">
    <star-horse-table-comp ref="dynamicScriptConsumerViewRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
<style lang="scss" scoped>
//todo
</style>
