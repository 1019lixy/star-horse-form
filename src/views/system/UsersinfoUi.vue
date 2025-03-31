<script setup lang="ts" name="Usersinfo">
  import { apiInstance, dialogPreps } from "star-horse-lowcode";
  import { Config } from "@/api/settings.ts";
  import { computed, nextTick, onMounted, provide, reactive, ref } from "vue";
  import { ApiUrls, SearchFields , PageFieldInfo ,SearchParams,useGlobalConfigStore } from "star-horse-lowcode";
  import { createCondition, loadById } from "star-horse-lowcode";
  import { analysisData } from "@/api/deptment";
  import { ElTreeV2 } from "element-plus";
  import { TreeNodeData } from "element-plus/es/components/tree-v2/src/types";
  import { postRequest, trim } from "star-horse-lowcode";
  import { success, warning } from "star-horse-lowcode";
  import {
    baseUserFields,
    deptList,
    initSelectData,
    rolesList,
    sexList,
    userFormat
  } from "@/views/system/utils/UserFields.ts";
  import {piniaInstance} from "star-horse-lowcode";

  const props = defineProps({
    viewRolesinfoId: { type: String },
    disableAction: { type: Boolean, default: false }
  });
  const dataUrl: ApiUrls = apiInstance("system-config", "system/usersinfoEntity");
  const usersinfoTableListRef = ref();
  const searchFormData = reactive<SearchFields>({
    fieldList: [
      { label: "姓名", fieldName: "name", defaultVisible: true, type: "input", matchType: "lk" },
      { label: "用户名", fieldName: "username", defaultVisible: true, type: "input", matchType: "lk" },
      { label: "员工编号", fieldName: "employeeNo", defaultVisible: true, type: "input", matchType: "lk" },
      {
        label: "所属用户组",
        fieldName: "idRolesinfo",
        type: "select",
        prefix: "b",
        defaultValue: props.viewRolesinfoId,
        optionList: rolesList,
        disabled: !!props.viewRolesinfoId
      }
    ]
  });
  let configStore = useGlobalConfigStore(piniaInstance);
  let compSize = computed(() => configStore.configFormInfo?.inputSize || Config.compSize);
  //修改密码方法
  const pwdFormRef = ref();
  const resetForm = () => {
    let data = pwdFormRef.value.getFormData();
    data.value.password = "";
    data.value.rePassword = "";
    // ruleForm.value = {};
  };
  const pwdMerge = () => {
    pwdFormRef.value.$refs.starHorseFormRef.validate((valid: any) => {
      if (!valid) {
        return;
      }
      let pwdForm = pwdFormRef.value.getFormData().value;
      let pwd = pwdForm.password;
      let rePwd = pwdForm.rePassword;
      if (!trim(pwd)) {
        warning("不能设置空格密码");
        return;
      }
      if (pwd.length < 6 || pwd.length > 15) {
        warning("请设置长度为6到15的密码");
        return;
      }
      if (pwd !== rePwd) {
        warning("两次密码不一致，请重新录入");
        return;
      }
      postRequest(
        "/system-config/system/usersAuditEntity/refreshInvalidPassword/" +
          pwdForm.username +
          "/" +
          pwd +
          "/" +
          (pwdForm.oldPassword || "0") +
          "/" +
          pwdForm.phone,
        {}
      ).then((res) => {
        let redata = res.data;
        if (redata.code == 1) {
          warning(redata.cnMessage);
          return;
        }
        success(redata.cnMessage);
        dialogProps.bakeVisible3 = false;
      });
    });
  };
  const editPwd = async (row: any) => {
    let data = await loadById(dataUrl.loadByIdUrl!, row[primaryKey], {});
    console.log(dialogProps.bakeVisible3);
    dialogProps.bakeVisible3 = true;
    await nextTick();
    pwdFormRef.value.setFormData(data);
  };
  const tableFieldList = reactive<PageFieldInfo | any>({
    fieldList: baseUserFields,
    stopAutoLoad: !!props.viewRolesinfoId,
    userTableFuncs: [
      {
        authority: "edit",
        btnName: "修改密码",
        funcName: (row: any) => {
          editPwd(row);
        }
      }
    ]
  });
  const primaryKey = "idUsersinfo";
  const rules = {};
  const dialogProps = dialogPreps();
  provide("dialogProps", dialogProps);

  const dataFormat = (name: string, cellValue: any, row: any): any => {
    if (name == "sex") {
      let fdata = sexList.value.find((item: any) => parseInt(item.value) == parseInt(cellValue));
      return fdata?.name || cellValue;
    }

    return userFormat(name, cellValue, row);
  };
  const treeRef = ref<InstanceType<typeof ElTreeV2>>();
  const query = ref("");
  const onQueryChanged = (query: string) => {
    treeRef.value!.filter(query);
  };
  const filterMethod = (query: string, node: any) => {
    return node.name.toLowerCase()!.includes(query?.toLowerCase());
  };
  /**
   * 点击事件
   * @param data
   * @param checked
   */
  const checkChange = (data: TreeNodeData, checked: boolean) => {
    // let checkedNodes = treeRef.value.getCheckedNodes();
    // if (checkedNodes?.length > 0) {
    //   checkedNodes.forEach(item => {
    //     treeRef.value.setChecked(item.value, false);
    //   });
    // }
    // treeRef.value.setChecked(data.value, (checked instanceof Boolean) ? checked : true);
    let conditions: Array<SearchParams> = [];
    console.log(data);

    conditions.push(createCondition("c.idDepartment", data.idDepartment));
    // menuTableListRef.value.setDataInfo(conditions, null);
    usersinfoTableListRef.value.createSearchParams(conditions);
  };

  const initData = async () => {
    await initSelectData();
    await nextTick();
    //如果是从其它页面加载的该页面，则将条件加入查询
    if (props.viewRolesinfoId) {
      let params: SearchParams[] = [{ propertyName: "b.idRolesinfo", value: props.viewRolesinfoId }];
      usersinfoTableListRef.value.createSearchParams(params);
    }
  };
  onMounted(async () => {
    await initData();
  });
  const pwdFieldInfo = reactive<PageFieldInfo | any>({
    fieldList: [
      [
        {
          label: "工号",
          fieldName: "employeeNo",
          type: "tag",
          formVisible: true
        },
        {
          label: "用户名",
          fieldName: "username",
          type: "tag",
          formVisible: true
        }
      ],
      [
        {
          label: "密码",
          fieldName: "password",
          type: "password",
          formVisible: true
        },
        {
          label: "确认密码",
          fieldName: "rePassword",
          type: "password",
          formVisible: true
        }
      ]
    ]
  });
</script>
<template>
  <star-horse-dialog
    :dialog-visible="dialogProps.bakeVisible3"
    :is-show-reset="false"
    :is-show-save="false"
    :is-show-btn-continue="false"
    :self-func="true"
    :title="'修改密码'"
    :dialogProps="dialogProps"
    @merge="pwdMerge"
    @reset="resetForm"
  >
    <star-horse-form :compUrl="dataUrl" :fieldList="pwdFieldInfo" ref="pwdFormRef" />
  </star-horse-dialog>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
      @refresh="usersinfoTableListRef.loadByPage()"
      :compUrl="dataUrl"
      :fieldList="tableFieldList"
      :rules="rules"
    />
  </star-horse-dialog>
  <star-horse-dialog
    :dialog-visible="dialogProps.viewVisible"
    :dialogProps="dialogProps"
    :title="'查看数据'"
    :is-view="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl" />
  </star-horse-dialog>
  <el-card class="inner_content">
    <!--    <el-row style="height: 100%;" :gutter="10">
          <el-col :span="viewRolesinfoId?5:5" class="h100">
            <star-horse-tree v-model:tree-datas="deptList" :preps="{
            label:'deptName',
            value:'idDepartment'
          }" @selectData="checkChange" :comp-size="compSize"/>
          </el-col>
          <el-col :span="viewRolesinfoId?19:19" class="h100">
            <el-card class="inner_content h100">-->
    <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line' ? 'column' : 'row' }">
      <star-horse-search-comp
        @searchData="(data: any) => usersinfoTableListRef.createSearchParams(data)"
        :formData="searchFormData"
        :compUrl="dataUrl"
      />
      <hr />
      <star-horse-button-list
        v-if="!viewRolesinfoId"
        @tableCompFunc="(fun: any) => usersinfoTableListRef.tableCompFunc(fun)"
        :compUrl="dataUrl"
        :dialogProps="dialogProps"
        :showType="Config.buttonStyle"
      />
    </div>
    <hr />
    <star-horse-table-comp
      ref="usersinfoTableListRef"
      :fieldList="tableFieldList"
      :primaryKey="primaryKey"
      :compUrl="dataUrl"
      :dataFormat="dataFormat"
      :disableAction="disableAction"
    />
    <!--        </el-card>
          </el-col>
        </el-row>-->
  </el-card>
</template>
<style lang="scss" scoped></style>
