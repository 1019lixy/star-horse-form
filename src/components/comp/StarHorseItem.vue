<script setup lang="ts" name="StarHorseItem">
import {computed, inject, onMounted, ref, unref, watch} from 'vue';
import {warning} from '@/utils/message';
import {FieldInfo} from '@/components/types/PageFieldInfo';
import Help from '@/components/help.vue';
import {ModelRef} from 'vue-demi';
import {useUserSelfOperation} from '@/store/SelfOperationStore.ts';
import piniaInstance from '@/store';
import {uuid} from '@/api/system.ts';
import {Config} from '@/api/settings.ts';
import {SearchFields} from '@/components/types/SearchProps';

const props = defineProps({
      // allItem: {type: Array, required: true},
      item: {type: Object, required: true},
      column: {type: Object},
      primaryKey: {type: String},
      bareFlag: {type: Boolean, default: false},
      batchName: {type: String, default: ''},
      compSize: {type: String, default: Config.compSize},
      isSearch: {type: Boolean, default: false}, //是否查询数据
      showLabel: {type: Boolean, default: true},//是否显示标签
      isEdit: {type: Boolean, default: false}, //是否编辑数据
      isView: {type: Boolean, default: false}, //是否视图数据
      isDesign: {type: Boolean, default: false},
    }
);
let userOperation = useUserSelfOperation(piniaInstance);
const dataForm: ModelRef<any> = defineModel('dataForm');
const itemType = ref<string>('input');
const emit = defineEmits(['dataSearch', 'focus', 'blur']);
const formFields: any = inject('formFields');
const field = ref<any>({
  preps: {}
});
field.value.preps.size = computed(() => props.compSize);
/**
 * 组件派发事件
 * @param act
 * @param params
 */
const actionDispatcher = (act: string, ...params: any[]) => {
  if (props.isSearch) {
    if (!act || act == 'focus' || act == 'blur') {
      return;
    }
    emit('dataSearch', params);
  } else {
    let actionFun = props.item.actions;
    if (actionFun && actionName.value == act) {
      actionFun(dataForm.value, params);
    }
    if (act == 'focus') {
      emit('focus', props.column, params);
    } else if (act == 'blur') {
      emit('blur', props.column, params);
    }
  }
};
//页面属性改变，重新刷新数据
watch(() => [props.item, props.isEdit],
    () => {
      compPreps();
    }, {
      immediate: false,
      deep: true
    }
);
//'year' | 'month' | 'date' | 'datetime' | 'week' | 'datetimerange' | 'daterange'
const dateType: Array<string> = ['year', 'month', 'date', 'datetime', 'week', 'datetimerange', 'daterange'];
const compPreps = () => {
  field.value['preps'] = {
    clearable: 'Y',
    label: props.item?.label,
    name: props.item?.fieldName,
    required: props.item?.required,
    size: props.compSize,
    helpMsg: props.item?.helpMsg,
    readonly: props.item?.readonly || props.isView ? 'Y' : 'N',
  };
  itemType.value = props.item?.type || props.item?.fieldType || 'input';
  field.value['isDesign'] = props.isDesign;
  field.value['bareFlag'] = props.bareFlag;
  field.value.preps['values'] = props.item?.optionList;
  if (itemType.value == 'number') {
    field.value.preps['step'] = props.item?.step || 1;
    field.value.preps['min'] = props.item?.min || 0;
    if (props.item?.max) {
      field.value.preps['max'] = props.item?.max;
    }
    field.value.preps['precision'] = props.item?.precision || 0;
  } else if (itemType.value == 'select') {
    field.value.preps['filterable'] = 'Y';
    field.value.preps['collapseTags'] = 'Y';
    field.value.preps['allowCreate'] = props.item?.allowCreate ? 'Y' : 'N';
  } else if (itemType.value == 'tselect') {
    field.value.preps['filterable'] = 'Y';
    field.value.preps['collapseTags'] = 'Y';
    field.value.preps['props'] = {
      label: 'name',
      value: 'value'
    };
  } else if (itemType.value == 'cascade') {
    field.value.preps['props'] = {
      label: 'name',
      multiple: props.item?.multiple,
      checkStrictly: true
    };
  } else if (dateType.includes(itemType.value)) {
    field.value.preps['type'] = unref(itemType);
    itemType.value = 'datetime';
    //日期默认以时间戳赋值
    field.value.preps['endPlaceholder'] = '结束日期';
    field.value.preps['rangeSeparator'] = '到';
    field.value.preps['startPlaceholder'] = '开始日期';
  } else if (itemType.value === 'dialog-input' || itemType.value == 'page-select') {
    let inputPreps = props.item?.params;
    if (!inputPreps) {
      warning('属性' + props.item?.label + '需要配置params 信息');
      return;
    }
    field.value.preps['primaryKey'] = inputPreps.primaryKey;
    field.value.preps['fieldList'] = {
      cellEditable: false,
      fieldList: inputPreps.fieldList
    };
    if (!inputPreps.searchFieldList || inputPreps.searchFieldList.length === 0) {
      let searchFieldList: Array<SearchFields> = [];
      field.value.preps['filterCondition'] = inputPreps.filterCondition;
      field.value.preps['orderBy'] = inputPreps.orderBy;
      inputPreps.fieldList?.forEach((item: FieldInfo) => {
        if (item.searchVisible) {
          let temp: any = {
            ...item
          };
          if (item.prefix) {
            temp['fieldName'] = item.prefix + '.' + temp['fieldName'];
          }
          temp['defaultVisible'] = true;
          if (item?.type == 'input' && !item['matchType']) {
            temp['matchType'] = 'lk';
          }
          searchFieldList.push(temp);
        }
      });
      field.value.preps['searchFieldList'] = {fieldList: searchFieldList};
    } else {
      field.value.preps['searchFieldList'] = inputPreps.searchFieldList;
    }
    field.value.preps['dataUrl'] = inputPreps.dataUrl;
    field.value.preps['needField'] = inputPreps.needField;
    field.value.preps['dataFormat'] = inputPreps.dataFormat;
    field.value.preps['recall'] = inputPreps.recall;
    field.value.preps['readonly'] = inputPreps.readonly;
  } else if (itemType.value == 'switch') {
    field.value.preps['activeText'] = props.item?.activeText || '是';
    field.value.preps['inactiveText'] = props.item?.inactiveText || '否';
    field.value.preps['activeValue'] = props.item?.activeValue || 'Y';
    field.value.preps['inactiveValue'] = props.item?.inactiveValue || 'N';
  } else if (itemType.value == 'comp') {

    field.value.preps['params'] = props.item?.params || {};
  }
  field.value.preps['multiple'] = props.item?.multiple;
  field.value.preps['actionName'] = actionName.value;
  field.value.preps['disabled'] = props.item.disabled;

  //联动
  field.value.preps['actionRelation'] = props.item?.actionRelation;
  //触发事件
  field.value.preps['actions'] = props.item?.actions;
  //将隐藏属性传递给组件
  if (props.item?.aliasName) {
    field.value.preps['aliasName'] = props.item.aliasName;
  }
  //组件个性化参数
  if (props.item?.preps) {
    field.value.preps = {...field.value.preps, ...props.item.preps};
  }
  //编辑数据时需要禁用的组件,此处不能将代码放在上一个if 之前，否则可能被覆盖
  if (!props.isEdit && (props.item.editDisabled || props.item.preps?.editDisabled == 'Y')) {
    field.value.preps['disabled'] = 'Y';
  }
  if (itemType.value == 'upload' && !field.value.preps['action']) {
    field.value.preps['action'] = '/system-config/annex/upload/commonFiles';
    warning('上传组件没配置上传路径,将使用系统默认路径');
  }
  //过滤掉查询表单的信息
  if (!props.isSearch && formFields) {
    let fieldName = field.value.preps['name'];
    //如果数据来源于列表
    if (props.batchName) {
      let batchFields = formFields[props.batchName];
      if (!batchFields) {
        formFields[props.batchName] = [];
      }
      let row = formFields[props.batchName][dataForm.value['xh'] - 1];
      if (!row) {
        formFields[props.batchName].push([]);
      } else {
        row.push(field);
      }
    } else {
      formFields[fieldName] = field;
    }
  }
  //将表单属性存储起来
  if (!props.isSearch) {
    userOperation.addFormItem(field);
  }

};
const defaultAction = ref('keydown.enter');
const typeList = ['select', 'tselect', 'date', 'daterange'];
const actionName = ref();
const randId = ref();
const componentRef = ref();

onMounted(() => {
  if (typeList.includes(props.item?.type) || typeList.includes(props.item?.fieldType)) {
    defaultAction.value = 'change';
  }
  randId.value = 'Id' + uuid();
  actionName.value = props.item?.actionName ? props.item?.actionName : defaultAction.value;
  compPreps();
});
</script>
<style lang="scss" scoped>
:deep(.el-cascader) {
  width: 100%;
}
</style>
<template>
  <div v-if="bareFlag||field.preps.headerFlag=='Y'" class="bare-comp">
    <component :id="randId" :is="(dataForm['_'+field.preps.name+'Type']||itemType)+'-item'" @selfFunc="actionDispatcher"
               :isDesign="isDesign"
               ref="componentRef"
               :isSearch="isSearch"
               :bareFlag="bareFlag"
               :field="field" :formData="dataForm"/>
    <div v-if="item.brotherNodes" style="width: 15px"/>
    <template v-for="temp in item.brotherNodes">
      <star-horse-item v-show="temp.formVisible" :primaryKey="primaryKey"
                       :compSize="compSize"
                       v-model:dataForm="dataForm"
                       :item="temp" :isDesign="isDesign"
                       :bareFlag="true"
                       :isEdit="isEdit"/>
    </template>
  </div>
  <div v-else class="comp-info"
       :style="{ 'height':itemType != 'button' ?'100%':'inherit',
       'width':item.minWidth||'inherit'
  }">
    <component :id="randId" :is="(dataForm['_'+field.preps.name+'Type']||itemType)+'-item'" @selfFunc="actionDispatcher"
               :isDesign="isDesign"
               ref="componentRef"
               :isSearch="isSearch"
               :bareFlag="bareFlag"
               :field="field" :formData="dataForm"/>
    <div v-if="item.brotherNodes" class="brother-node">
      <template v-for="temp in item.brotherNodes">
        <star-horse-item v-if="dataForm['_'+field.preps.name+'Visible']||temp.formVisible" :primaryKey="primaryKey"
                         :compSize="compSize"
                         v-model:dataForm="dataForm"
                         :item="temp" :isDesign="isDesign"
                         :bareFlag="true"
                         :isEdit="isEdit"/>
      </template>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.comp-info {
  display: flex;
  justify-content: left;
  flex: 1;
  align-items: center;
  margin: 5px auto;
}

.bare-comp {
  flex: 1;
  width: 100%;
  margin-right: 5px;
}

.brother-node {
  margin-left: 5px;
  display: flex;
  align-items: center;
  flex: 1;
}


</style>
