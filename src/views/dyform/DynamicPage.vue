<script lang="ts" setup name="DynamicPage">
import {onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {i18n} from "@/lang/index.js";
import {error, piniaInstance, success} from "star-horse-lowcode";
import {useFlexDesignStore} from "@/store/FlexDesign";
import FlexSaveDialog from "@/components/system/dialogs/FlexSaveDialog.vue";
import FlexPublishDialog from "@/components/system/dialogs/FlexPublishDialog.vue";
import FlexShareDialog from "@/components/system/dialogs/FlexShareDialog.vue";
import {FlexDesignData, ShareResult,PublishResult} from "@/api/flexDesign";
let route = useRoute();
const router = useRouter();
const flexCompRef = ref();
const flexDesign = useFlexDesignStore(piniaInstance);
// Dialog states
const saveDialogVisible = ref(false);

const shareDialogVisible = ref(false);
const publishDialogVisible = ref(false);

// Design metadata
const currentDesignId = ref<string>("");
const currentDesignName = ref<string>(
    i18n("system.flex.starHorseFlexComp.design.untitled"),
);
const currentDesignDescription = ref<string>("");
const returnRouter = () => {
  router.push({
    path: "/dyform/DynamicPagesUi",
  });
};
const saveData = () => {
  saveDialogVisible.value = true;
};


const publishPage = () => {
  const validation = flexDesign.validateDesign();
  if (!validation.isValid) {
    error(i18n("system.flex.starHorseFlexComp.publishValidationFailed"));
    console.warn(
        i18n("system.flex.starHorseFlexComp.validationError"),
        validation.errors,
    );
    return;
  }
  publishDialogVisible.value = true;
};

const sharePage = () => {
  const validation = flexDesign.validateDesign();
  if (!validation.isValid) {
    error(i18n("system.flex.starHorseFlexComp.shareValidationFailed"));
    console.warn(
        i18n("system.flex.starHorseFlexComp.validationError"),
        validation.errors,
    );
    return;
  }
  shareDialogVisible.value = true;
};

const handleSaved = (result: FlexDesignData) => {
  currentDesignId.value = result.id || "";
  currentDesignName.value = result.name;
  currentDesignDescription.value = result.description || "";
  saveDialogVisible.value = false;
  success(i18n("system.flex.starHorseFlexComp.saveSuccess"));
};

const handleShared = (result: ShareResult) => {
  shareDialogVisible.value = false;
  success(i18n("system.flex.starHorseFlexComp.shareSuccess"));
  console.log(i18n("system.flex.starHorseFlexComp.shareResult"), result);
};

const handlePublished = (result: PublishResult) => {
  publishDialogVisible.value = false;
  success(i18n("system.flex.starHorseFlexComp.publishSuccess"));
  console.log(i18n("system.flex.starHorseFlexComp.publishResult"), result);
};


const init = () => {

};
const loadData = (query: any) => {
  if (!query?.pageId) return;
  console.log(query);
};
onMounted(() => {
  init();
});
onBeforeUnmount(() => {
  flexCompRef.value?.reset();
});
watch(() => route.query, (query) => {
  loadData(query);
}, {immediate: true});

</script>
<template>
  <!-- Save Dialog -->
  <FlexSaveDialog
      :dialogVisible="saveDialogVisible"
      :designName="currentDesignName"
      :designDescription="currentDesignDescription"
      :designId="currentDesignId"
      :isEdit="!!currentDesignId"
      @closeDialog="saveDialogVisible = false"
      @saved="handleSaved"
  />


  <!-- Share Dialog -->
  <FlexShareDialog
      :dialogVisible="shareDialogVisible"
      :designName="currentDesignName"
      :designDescription="currentDesignDescription"
      @closeDialog="shareDialogVisible = false"
      @shared="handleShared"
  />

  <!-- Publish Dialog -->
  <FlexPublishDialog
      :dialogVisible="publishDialogVisible"
      :designName="currentDesignName"
      :designDescription="currentDesignDescription"
      @closeDialog="publishDialogVisible = false"
      @published="handlePublished"
  />
  <StarHorsePageDesign ref="flexCompRef" :autoSave="false">
    <template #header>
      <el-tooltip
          :content="i18n('system.flex.starHorseFlexComp.tooltip.save')"
      >
        <el-button @click="saveData" class="h-full border-0">
          <star-horse-icon icon-class="save" cursor="pointer"/>
        </el-button>
      </el-tooltip>
      <el-tooltip
          :content="i18n('system.flex.starHorseFlexComp.tooltip.publish')"
      >
        <el-button @click="publishPage" class="h-full border-0">
          <star-horse-icon icon-class="publish" cursor="pointer"/>
        </el-button>
      </el-tooltip>
      <el-tooltip
          :content="i18n('system.flex.starHorseFlexComp.tooltip.share')"
      >
        <el-button @click="sharePage" class="h-full border-0">
          <star-horse-icon icon-class="share" cursor="pointer"/>
        </el-button>
      </el-tooltip>

      <el-tooltip
          class="item"
          :content="i18n('system.flex.starHorseFlexComp.tooltip.return')"
          effect="dark"
          placement="bottom"
      >
        <el-button @click="returnRouter" class="h-full border-0">
          <star-horse-icon
              icon-class="return"
              size="24px"
              cursor="pointer"
              style="color: var(--star-horse-style)"
          />
        </el-button>
      </el-tooltip>
    </template>
  </StarHorsePageDesign>
</template>

<style lang="scss" scoped>

</style>
