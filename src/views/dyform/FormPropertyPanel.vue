<script setup lang="ts" name="FormPropertyPanel">
import {computed, onMounted, ref, watch} from "vue";
import {loadElementPlusIcon, loadGetData, loadSystemInfo, rowClassName} from "@/api/sh_api";
import {SelectOption} from "@/components/types/SearchProps";
import {permissionMenus, postRequest} from "@/api/star_horse";
import {warning} from "@/utils/message";
import Help from "@/components/help.vue";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";

let designForm = DesignForm(piniaInstance);
let formInfo = computed(() => designForm.formInfo);
let compList = computed(() => designForm.compList);
let formActiveNames = ref<string>("tab1");
let dbList = ref<any>([]);
let rules = ref({
  formName: [{required: true, trigger: "blur", message: "必须项不能为空"}],
  formId: [{required: true, trigger: "blur", message: "必须项不能为空"}],
  sysId: [{required: true, trigger: "blur", message: "必须项不能为空"}],
  tbName: [{required: true, trigger: "blur", message: "必须项不能为空"}],
  createTable: [{required: true, trigger: "blur", message: "必须项不能为空"}],
  formIcon: [{required: true, trigger: "blur", message: "必须项不能为空"}],
});
let systemIconList = ref<SelectOption[]>([]);
let informationsList = ref<any>([]);
let menusInfoList = ref<any>([]);
const initDbList = async () => {
  let {data, error} = await loadGetData("/dbsearch-manage/dbsearch/dbinfoEntity/getDbInfoByUser");
  if (error) {
    warning(error);
    return
  }
  dbList.value = data;
};
const initData = async () => {
  let params = [{propertyName: "statusCode", value: "1"}];
  const datas = await loadSystemInfo(params);
  informationsList.value = datas;
  systemIconList.value = loadElementPlusIcon();
};

const loadMenus = (val: any) => {
  if (!val) {
    return;
  }
  permissionMenus({}, val).then((res) => {
    let redata = res.data.data;
    menusInfoList.value = [];
    redata.forEach((item: any) => {
      menusInfoList.value.push({name: item.menuName, value: item.dataNo});
    });
  });
};
let relationDataList = ref<Array<SelectOption>>([]);
let dataSourceData = ref<any>();
//获取同数据源下的表
const loadSameDataSourceTables = () => {
  let params: any = [];
  formInfo.value['relations'] = [];
  params.push({
    propertyName: "datasourceConfigId",
    value: formInfo.value["datasourceConfigId"] || null,
    operation: formInfo.value["datasourceConfigId"] ? "eq" : "is",
    datatype: "input"
  })
  postRequest("/userdb-manage/userdb/dynamicForm/getAllByCondition", {
    dataList: params
  }).then(res => {
    relationDataList.value = [];
    if (res.data.code != 0) {
      return;
    }
    dataSourceData.value = res.data.data;
    dataSourceData.value.forEach((item: any) => {
      relationDataList.value.push({
        name: item.formName,
        value: item.formId
      })
    });
  });
};
const handelAddRow = () => {
  if (!formInfo.value['relations']) {
    formInfo.value['relations'] = [];
  }
  formInfo.value['relations'].push({relationType: "1n"});
};
const handelDelete = (row: any) => {
  let data = formInfo.value['relations'];
  for (let item in data) {
    let temp = data[item];
    if (temp.xh == row.xh) {
      data.splice(item, 1)
    }
  }
};
//赋值
const relationChange = (row: any) => {
  let tableId = row.tableId;
  let fdata = dataSourceData.value.find(item => item.formId == tableId);
  row["formName"] = fdata?.formName;
  row["tbName"] = fdata?.tbName;
  console.log(row);
};
/**
 * 表单更新的时候，更新表单的属性
 */
const updateCompInfo = () => {

};
onMounted(() => {
  initData();
  initDbList();
  loadMenus(formInfo.value['sysId']);
  loadSameDataSourceTables();
});
const relationMsg = `
映射关系表示当前表与所选择的表之间的关系:
 一对一: 表示当前表和被选择表数据是一一对应关系;
 一对多: 表示当前表一条数据对应被选择表多条数据;
 多对一: 表示当前表多条数据对应被选择表1条数据;
 多对多: 表示当前表1条数据对应被选择表多条,
        反之被选择表的一条数据也对于当前表的多条数据。`;
const dbPositionMsg = `
动态创建的表需要存在那个数据库，
如果为空，则在当前业务数据库创建表信息。`;
watch(() => formInfo.value,
    () => {
      updateCompInfo();
    }, {
      immediate: true,
      deep: true
    })
defineExpose({
  loadMenus
})
</script>

<style lang="scss" scoped>
.dynamic-form {
  width: 100%;
}
</style>
<template>
  <el-form
      :model="formInfo"
      :rules="rules"
      :size="'small'"
      class="dynamic-form"
      ref="itemFormInfo"
  >
    <el-row>
      <el-col :span="12">
        <el-form-item label="表单名称" prop="formName" required>
          <el-input placeholder="请输入表单名称" v-model="formInfo['formName']"/>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="数据源">
          <el-select
              clearable
              filterable
              id="dbInfo"
              placeholder="请选择数据库信息"
              v-model="formInfo['datasourceConfigId']"
              @change="loadSameDataSourceTables"
          >
            <el-option
                :key="sitem.configId"
                :label="sitem.name"
                :value="sitem.configId"
                v-for="sitem in dbList"
            >
            </el-option>
          </el-select>
          <help :message="dbPositionMsg"/>
        </el-form-item>
      </el-col>
    </el-row>
    <el-tabs type="border-card" v-model="formActiveNames">
      <el-tab-pane name="tab1" label="基础属性">
        <el-row>
          <el-col :span="12">
            <el-form-item label="主键" prop="formId" required>
              <el-input placeholder="请输入表单ID" v-model="formInfo['formId']"
                        :disabled="!!formInfo['idDynamicForm']"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="表名" prop="tbName" required>
              <el-input placeholder="请输入表名,如:tb_table_name" v-model="formInfo['tbName']"
                        :disabled="!!formInfo['idDynamicForm']"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="表单图标" prop="formIcon" required>
              <el-popover width="400" trigger="click">
                <template #reference>
                  <el-input
                      clearable
                      readonly
                      v-model="formInfo['formIcon']"
                      placeholder="请选择图标"
                  />
                </template>
                <ul class="system-icon">
                  <li
                      v-for="sdata in systemIconList"
                      @click="formInfo['formIcon'] = sdata.value"
                      :class="sdata.value == formInfo['formIcon'] ? 'icon-active' : ''"
                  >
                    <el-tooltip :content="sdata.name">
                      <el-icon class="star-icon" style="font-size: 50px">
                        <component :is="sdata.value" :key="sdata.value"/>
                      </el-icon>
                    </el-tooltip>
                  </li>
                </ul>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="页面版式" prop="pageStyle">
              <el-select placeholder="请选择标签位置" v-model="formInfo['pageStyle']">
                <el-option label="普通" value="general"/>
                <el-option label="Tab" value="tab"/>
                <el-option label="列表" value="formtb"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item label="是否创建表" prop="createTable" required>
              <el-switch
                  :active-value="'Y'"
                  :inactive-value="'N'"
                  active-text="是"
                  inactive-text="否"
                  v-model="formInfo['createTable']"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否创建菜单" prop="createMenu">
              <el-switch
                  :active-value="'Y'"
                  :inactive-value="'N'"
                  active-text="是"
                  inactive-text="否"
                  v-model="formInfo['createMenu']"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否需要公共字段" prop="needCommonFields">
              <el-switch
                  :active-value="'Y'"
                  :inactive-value="'N'"
                  active-text="是"
                  inactive-text="否"
                  v-model="formInfo['needCommonFields']"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="formInfo['createMenu'] == 'Y'">
          <el-col :span="12">
            <el-form-item
                label="所属系统"
                prop="sysId"
                required
            >
              <el-select
                  v-model="formInfo['sysId']"
                  placeholder="请选择所属系统"
                  clearable filterable
                  @change="loadMenus"
              >
                <el-option
                    :label="item.name"
                    :value="item.value+''"
                    :key="item.value+''"
                    v-for="item in informationsList"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
                label="父级菜单"
                prop="parentMenuId"
            >
              <el-select v-model="formInfo['parentMenuId']" placeholder="父级菜单" clearable filterable>
                <el-option
                    :label="item.name"
                    :value="item.value"
                    :key="item.value"
                    v-for="item in menusInfoList"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

      </el-tab-pane>
      <el-tab-pane name="tab2" label="映射关系配置">
        <help

            :message="relationMsg"/>
        <el-table
            :data="formInfo['relations']"
            :fit=true
            :row-class-name="rowClassName"
            border
            ref="relationsRef"
        >
          <el-table-column
              :show-overflow-tooltip="true"
              :width="60"
              label="行号"
              align="center"
              prop="rowIndex"
              v-if="true ">
            <template #default="scope">
              <el-form-item
                  :prop="'relations.'+scope.$index+'.rowIndex'"
              >
                {{ scope.row.xh }}
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column
              :show-overflow-tooltip="true"
              label="关联表"
              prop="tableId"
          >
            <template #default="scope">
              <el-form-item
                  required
                  :rules="[{trigger:'blur',message:'必须项不能为空'}]"
                  :prop="'relations.'+scope.$index+'.tableId'"
              >
                <el-select v-model="scope.row.tableId" @change="relationChange(scope.row)">
                  <el-option v-for="item in relationDataList" :label="item.name" :key="item.value"
                             :value="item.value"/>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column
              :show-overflow-tooltip="true"
              label="映射关系"
              prop="relationType"
          >
            <template #default="scope">
              <el-form-item
                  required
                  :rules="[{trigger:'blur',message:'必须项不能为空'}]"
                  :prop="'relations.'+scope.$index+'.relationType'"
              >
                <el-select v-model="scope.row.relationType">
                  <el-option label="一对一" value="11"/>
                  <el-option label="一对多" value="1n"/>
                  <el-option label="多对一" value="n1"/>
                  <el-option label="多对多" value="mn"/>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column
              align="center"
              prop="oper"
              width="100px"
          >
            <template #header>
										<span
                        @click="handelAddRow"
                        class="oper-btn"
                        title="添加行"
                    >
                      操作
											<star-horse-icon icon-class="add"/>
										</span>
            </template>
            <template #default="scope">
										<span
                        @click="handelAddRow"
                        class="oper-btn"
                        title="添加行"
                    >
											<star-horse-icon icon-class="add"/>
										</span>&nbsp;&nbsp;
              <span
                  @click="handelDelete(scope.row)"
                  class="oper-btn"
                  title="删除行"
                  v-if="formInfo['relations']?.length>1"
              >
											<star-horse-icon
                          icon-class="delete"
                      />
										</span>
            </template>
          </el-table-column>
        </el-table>


      </el-tab-pane>
      <el-tab-pane name="tab3" label="脚本绑定">


      </el-tab-pane>
      <el-tab-pane name="tab4" label="其它属性">
        <el-row>
          <el-col :span="12">
            <el-form-item label="标签位置" prop="labelPosition">
              <el-select placeholder="请选择标签位置" v-model="formInfo['labelPosition']">
                <el-option label="left" value="left"/>
                <el-option label="right" value="right"/>
                <el-option label="top" value="top"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标签长度" prop="labelWidth">
              <el-input
                  placeholder="请输入标签长度例如 '50px'"
                  v-model="formInfo['labelWidth']"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="表单验证规则名称" prop="rules">
              <el-input placeholder="请输入表单验证规则名称" v-model="formInfo['rules']"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="表单域标签的后缀" prop="labelSuffix">
              <el-input
                  placeholder="请输入表单域标签的后缀"
                  v-model="formInfo['labelSuffix']"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="表单风格" prop="labelPosition">
              <el-select placeholder="请选择表单风格" v-model="formInfo['size']">
                <el-option label="large" value="large"/>
                <el-option label="default" value="default"/>
                <el-option label="small" value="small"/>
              </el-select>
            </el-form-item>

          </el-col>
          <el-col :span="12">
            <el-form-item label="是否禁用该表单内的所有组件" prop="disabled">
              <el-switch
                  :active-value="'Y'"
                  :inactive-value="'N'"
                  active-text="是"
                  inactive-text="否"
                  v-model="formInfo['disabled']"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
                label="是否隐藏必填字段标签旁边的红色星号"
                prop="hideRequiredAsterisk"
            >
              <el-switch
                  :active-value="'Y'"
                  :inactive-value="'N'"
                  active-text="是"
                  inactive-text="否"
                  v-model="formInfo['hideRequiredAsterisk']"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当校验失败时，滚动到第一个错误表单项" prop="scrollToError">
              <el-switch
                  :active-value="'Y'"
                  :inactive-value="'N'"
                  active-text="是"
                  inactive-text="否"
                  v-model="formInfo['scrollToError']"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="星号的位置" prop="requireAsteriskPosition">
              <el-switch
                  :active-value="'left'"
                  :inactive-value="'right'"
                  active-text="左"
                  inactive-text="右"
                  v-model="formInfo['requireAsteriskPosition']"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否在输入框中显示校验结果反馈图标" prop="statusIcon">
              <el-switch
                  :active-value="'Y'"
                  :inactive-value="'N'"
                  active-text="是"
                  inactive-text="否"
                  v-model="formInfo['statusIcon']"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="是否显示校验错误信息" prop="showMessage">
              <el-switch
                  :active-value="'Y'"
                  :inactive-value="'N'"
                  active-text="是"
                  inactive-text="否"
                  v-model="formInfo['showMessage']"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否以行内形式展示校验信息" prop="inlineMessage">
              <el-switch
                  :active-value="'Y'"
                  :inactive-value="'N'"
                  active-text="是"
                  inactive-text="否"
                  v-model="formInfo['inlineMessage']"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
                label="是否在 rules 属性改变后立即触发一次验证"
                prop="validateOnRuleChange"
            >
              <el-switch
                  :active-value="'Y'"
                  :inactive-value="'N'"
                  active-text="是"
                  inactive-text="否"
                  v-model="formInfo['validateOnRuleChange']"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="行内表单模式" prop="inline">
              <el-switch
                  :active-value="'Y'"
                  :inactive-value="'N'"
                  active-text="是"
                  inactive-text="否"
                  v-model="formInfo['inline']"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </el-form>
</template>
