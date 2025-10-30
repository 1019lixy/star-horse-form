<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";
import {useFlexDesignStore} from "@/store/FlexDesign";
import {type FlexDesignData, saveFlexDesign} from "@/api/flexDesign";
import {apiInstance, ApiUrls, PageFieldInfo, piniaInstance} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {loadRolesInfo, loadSvgIcons, loadSystemInfo} from "@/api/star_horse_utils.js";
import {permissionMenus} from "@/api/star_horse_apis.js";
import {ServiceEnums} from "@/components/enums/ServiceEnums.js";
import {getUserInfo} from "@/utils/auth.js";

interface Props {
  dialogVisible: boolean;
  designName?: string;
  designDescription?: string;
  designId?: string;
  isEdit?: boolean;
}

const dataUrl: ApiUrls = apiInstance("userdb-manage", "userdb/dynamicPages");
const props = defineProps<Props>();
const emit = defineEmits<{
  closeDialog: [];
  saved: [result: FlexDesignData];
}>();

const flexDesign = useFlexDesignStore(piniaInstance);

const dynamicPagesFormRef = ref();
let informationsList = ref<any>([]);
let menusInfoList = ref<any>([]);
let rolesList = ref<any>([]);

const loadMenus = (val: any) => {
  if (!val) {
    return;
  }
  permissionMenus({}, val).then((res: any) => {
    menusInfoList.value = res.data.data;
  });
  loadRolesInfo([]).then((res: any) => {
    rolesList.value = res;
  });
};
const tableFieldList = reactive<PageFieldInfo | any>({
  "fieldList": [[{
    "label": "页面名称",
    "fieldName": "pageName",
    "type": "input",
    "required": true,
    "formVisible": true,
    "listVisible": true,
    "preps": {}
  }, {
    "label": "页面编码",
    "fieldName": "pageCode",
    "type": "input",
    "required": true,
    "formVisible": true,
    "listVisible": true,
    "preps": {}
  }], [{
    "label": "归属系统",
    "fieldName": "sysId",
    "type": "tselect",
    "required": true,
    "formVisible": true,
    "listVisible": true,
    actions: {
      change: (val: any) => {
        loadMenus(val["sysId"]);
      },
    },
    "preps": {
      checkStrictly: true,
      data: informationsList,
    }
  },], [{
    "label": "是否创建菜单",
    "fieldName": "createMenu",
    "type": "switch",
    "required": false,
    "formVisible": true,
    "listVisible": true,
    "preps": {
      dataRelation: {
        actionName: "change",
        relationDetails: [
          {
            matchType: "eq",
            controlCondition: "eqVisible",
            relationFields: ["parentMenuId", "userGroupIds"],
            matchFieldValue: "Y",
          },
        ],
      },
      activeValue: "Y",
      inactiveValue: "N"
    }
  }, {
    "label": "是否发布",
    "fieldName": "isPublish",
    "type": "switch",
    "required": false,
    "formVisible": true,
    defaultValue: "Y",
    "listVisible": true,
    "preps": {
      activeValue: "Y",
      inactiveValue: "N"
    }
  }, {
    "label": "是否需要认证",
    "fieldName": "authFlag",
    "type": "switch",
    "required": false,
    "formVisible": true,
    defaultValue: "Y",
    "listVisible": true,
    "preps": {
      activeValue: "Y",
      inactiveValue: "N"
    }
  }], [{
    "label": "父菜单",
    "fieldName": "parentMenuId",
    "type": "tselect",
    "required": false,
    "formVisible": false,
    "listVisible": true,
    "preps": {
      checkStrictly: true,
      data: menusInfoList,
      props: {
        label: "menuName",
        value: "dataNo",
      },
    }
  }, {
    "label": "授权用户组",
    "fieldName": "userGroupIds",
    "type": "select",
    "required": false,
    "formVisible": false,
    "listVisible": true,
    "preps": {
      multiple: true,
      values: rolesList,
    }
  }], [{
    "label": "页面风格",
    "fieldName": "pageStyle",
    "type": "select",
    "required": false,
    "formVisible": true,
    "listVisible": true,
    "preps": {}
  }, {
    "label": "父节点",
    "fieldName": "parentId",
    "type": "select",
    "required": false,
    "formVisible": true,
    "listVisible": true,
    "preps": {}
  }], [{
    "label": "模板标识",
    "fieldName": "templateFlag",
    "type": "switch",
    "required": false,
    "formVisible": true,
    "listVisible": true,
    "preps": {
      activeValue: "Y",
      inactiveValue: "N"
    }
  }, {
    "label": "页面图标",
    "fieldName": "pageIcon",
    "type": "icon",
    "required": false,
    "formVisible": true,
    "listVisible": true,
    defaultValue: "document",
    "preps": {
      iconType: "user",
      values: loadSvgIcons()
    }
  }], ],
  "batchFieldList": [],
  "userTableFuncs": [],
  "dynamicFormas": [],
  "orderBy": [{"fieldName": "idDynamicPage", "ascOrDesc": "desc"}],
  "batchName": "batchDataList",
  "cellEditable": false,
  "stopAutoLoad": false
});


const isSaving = ref(false);
const handleSave = async (type: string) => {
  if (!dynamicPagesFormRef.value) return;
  try {
    let validResult = await dynamicPagesFormRef.value.validate();
    if (!validResult) return;
    let formData = unref(dynamicPagesFormRef.value.getFormData());
    let result = await saveFlexDesign(formData);
    if (result) {
      closeDialog();
    }

  } catch (error) {
    console.error("保存失败:", error);
  } finally {
    isSaving.value = false;
  }
};

const closeDialog = () => {
  emit("closeDialog");
};
const init = async () => {
  let params = [{propertyName: "statusCode", value: "1"}];
  informationsList.value = await loadSystemInfo(
      params,
      `${ServiceEnums.SYSTEM_PREFIX}informations/getUserSystem/${getUserInfo()?.idUsersinfo}`,
  );
};
onMounted(() => {
  init();
});

</script>
<template>
  <star-horse-dialog
      :dialogVisible="dialogVisible"
      @closeAction="closeDialog"
      :selfFunc="true"
      :boxWidth="'50%'"
      :full-screen="false"
      :title="
      isEdit
        ? i18n('system.flex.saveDialog.title.save')
        : i18n('system.flex.saveDialog.title.saveAs')
    "
      @merge="handleSave"
  >
    <star-horse-form :compUrl="dataUrl"
                     :fieldList="tableFieldList"
                     ref="dynamicPagesFormRef"
                     :rules="{}"/>
  </star-horse-dialog>
</template>
<style lang="scss" scoped>

</style>
