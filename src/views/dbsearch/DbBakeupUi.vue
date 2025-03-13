<script setup lang="ts" name="DbBakeup">
  import { apiInstance, dialogPreps, dictData } from "@/api/star_horse_utils.ts";
  import { ApiUrls } from "@/components/types/ApiUrls";
  import { onMounted, provide, reactive, ref } from "vue";
  import { SearchFields, SelectOption } from "@/components/types/SearchProps";
  import { PageFieldInfo, UserFuncInfo } from "@/components/types/PageFieldInfo";
  import { Config } from "@/api/settings.ts";
  import { initDbList } from "@/views/dbsearch/utils/DbSearchUtils.ts";
  import { postRequest } from "@/api/star_horse_apis.ts";
  import { operationConfirm, success, warning } from "@/utils/message.ts";
  //后端交互接口地址
  const dataUrl: ApiUrls = apiInstance("userdb-manage", "dbsearch/dbBakeup");
  let dbList = ref<SelectOption[]>([]);
  let bakePolicyList = ref<SelectOption[]>([]);
  //查询属性
  const searchFormData = reactive<SearchFields>({
    fieldList: [
      {
        label: "数据库配置",
        fieldName: "datasourceConfigId",
        type: "select",
        optionList: dbList,
        defaultVisible: true
      },
      {
        label: "备份日期",
        fieldName: "createdDate",
        defaultVisible: true,
        matchType: "bt",
        type: "date"
      }
    ]
  });
  //页面属性
  const tableFieldList = reactive<PageFieldInfo | any>({
    fieldList: [
      {
        label: "数据库类型",
        fieldName: "dbType",
        type: "input",
        required: true,
        formVisible: false,
        listVisible: true
      },
      {
        label: "数据库信息",
        fieldName: "datasourceConfigId",
        type: "select",
        optionList: dbList,
        required: true,
        formVisible: true,
        listVisible: true
      },
      [
        {
          label: "备份策略",
          fieldName: "bakePolicy",
          type: "select",
          helpMsg: "数据字段：BAKE_POLICY",
          optionList: bakePolicyList,
          formVisible: true,
          listVisible: true
        },
        {
          label: "定时备份",
          fieldName: "cronPolicy",
          type: "cron",
          helpMsg: "设置定时策略，系统根据策略进行备份",
          formVisible: true,
          listVisible: true
        }
      ],
      {
        label: "备份文件路径",
        fieldName: "scriptPath",
        type: "input",
        formVisible: false,
        listVisible: true
      },
      {
        label: "备注",
        fieldName: "remark",
        type: "textarea",
        formVisible: true,
        listVisible: true
      },
      {
        label: "创建人",
        disabled: "Y",
        fieldName: "createdBy",
        type: "input",
        listVisible: true
      },
      {
        label: "修改人",
        disabled: "Y",
        fieldName: "updatedBy",
        type: "input",
        listVisible: true
      },
      {
        label: "创建日期",
        disabled: "Y",
        fieldName: "createdDate",
        type: "date",
        listVisible: true
      },
      {
        label: "修改日期",
        disabled: "Y",
        fieldName: "updatedDate",
        type: "date",
        listVisible: true
      },
      {
        label: "数据版本号",
        fieldName: "version",
        type: "number"
      },
      {
        label: "是否已逻辑",
        fieldName: "isDel",
        type: "number"
      },
      {
        label: "数据编号",
        fieldName: "dataNo",
        type: "input"
      },
      {
        label: "状态码",
        fieldName: "statusCode",
        type: "input"
      },
      {
        label: "状态码名称",
        fieldName: "statusName",
        type: "input"
      },
      {
        label: "国际码",
        fieldName: "local",
        type: "input"
      }
    ]
  });
  //主键
  const primaryKey = "idDbBakeup";
  const dbBakeupRef = ref();
  //校验
  const rules = {};
  //控制弹窗相关设置
  const dialogProps = dialogPreps();
  provide("dialogProps", dialogProps);
  const extBtns = ref<UserFuncInfo[]>([]);
  //初始化方法
  const initData = async () => {
    dbList.value = await initDbList();
    bakePolicyList.value = await dictData("BAKE_POLICY");
    extBtns.value.push({
      btnName: "备份",
      icon: "run",
      authority: "execution",
      priority: 1,
      funcName: (row: any) => {
        operationConfirm("确定要执行该操作吗？").then(() => {
          let configId = row.datasourceConfigId;
          postRequest(dataUrl.basePrefix + `/dbBackup/${configId}/true`, {}).then((res) => {
            if (res.data.code) {
              warning(res.data.cnMessage);
              return;
            }
            success("备份任务已下达，请稍后在备份记录页面查看");
          });
        });
      }
    });
  };
  onMounted(() => {
    initData();
  });
  /**
   * 列表，查看数据时数据转换
   * @param _name 名称
   * @param cellValue 值
   * @param _row 列表行数据
   */
  const dataFormat = (name: string, cellValue: any, _row: any): any => {
    if (name == "datasourceConfigId") {
      return dbList.value.find((item) => item.value == cellValue)?.name || cellValue;
    }
    //转换显示信息
    return cellValue;
  };
</script>
<style lang="scss" scoped></style>
<template>
  <star-horse-dialog
    :box-width="'40%'"
    :isShowBtnContinue="true"
    :dialogVisible="dialogProps.editVisible"
    :dialogProps="dialogProps"
    :title="'新增备份'"
  >
    <star-horse-form
      @refresh="dbBakeupRef.loadByPage()"
      :compUrl="dataUrl"
      :fieldList="tableFieldList"
      :rules="rules"
    />
  </star-horse-dialog>
  <star-horse-dialog
    :dialog-visible="dialogProps.viewVisible"
    :dialogProps="dialogProps"
    :title="'查看数据'"
    :isView="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl" />
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line' ? 'column' : 'row' }">
      <star-horse-search-comp
        @searchData="(data: any) => dbBakeupRef.createSearchParams(data)"
        :formData="searchFormData"
        :compUrl="dataUrl"
      />
      <hr />
      <star-horse-button-list
        @tableCompFunc="(fun: any) => dbBakeupRef.tableCompFunc(fun)"
        :compUrl="dataUrl"
        :dialogProps="dialogProps"
        :showType="Config.buttonStyle"
      />
    </div>
    <hr />
    <star-horse-table-comp
      ref="dbBakeupRef"
      :fieldList="tableFieldList"
      :primaryKey="primaryKey"
      :compUrl="dataUrl"
      :extandBtns="extBtns"
      :dataFormat="dataFormat"
    />
  </el-card>
</template>
