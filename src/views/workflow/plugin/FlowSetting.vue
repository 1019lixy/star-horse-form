<template>
  <div class="designer-wrap">
    <MenuShot :menus="menus" @change="changeMenu" />
    <div class="designer-content-box">
      <div class="flowSetting-box">
        <div v-if="!scale.isMobile()" class="flowSetting-nav-box">
          <div class="flowSetting-nav-group">
            <div
              v-for="(menu, i) in menus"
              :key="i"
              :class="{ 'act-item': menu.activate == true }"
              class="flowSetting-nav-group-item"
              @click="changeMenu(menu)"
            >
              <img :src="flowCommon.settingBaseIcon" />
              <span>{{ menu.name }}</span>
            </div>
          </div>
        </div>
        <div class="flowSetting-content-box">
          <Advanced v-if="currentContext == 1"></Advanced>
          <Exhibition v-if="currentContext == 2"></Exhibition>
          <Remind v-if="currentContext == 3"></Remind>
          <Print v-if="currentContext == 5"></Print>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { flowCommon } from "@/views/workflow/plugin/utils/flowCommon.ts";
  import MenuShot from "@/views/workflow/plugin/config/MenuShot.vue";
  import Advanced from "@/views/workflow/plugin/config/Advanced.vue";
  import Exhibition from "@/views/workflow/plugin/config/Exhibition.vue";
  import Remind from "@/views/workflow/plugin/config/Remind.vue";
  import Print from "@/views/workflow/plugin/config/Print.vue";
  import { computed, ref } from "vue";
  import { scale } from "@/views/workflow/plugin/utils/deviceUtil.ts";
  import { useFlowDesignStore } from "@/store/FlowDesign.ts";
  import {piniaInstance} from "star-horse-lowcode";

  const flowDesign = useFlowDesignStore(piniaInstance);
  const props = defineProps({
    navable: {
      type: Boolean,
      default: true
    },
    readable: {
      type: Boolean,
      default: false
    }
  });
  const emits = defineEmits(["save"]);
  const nodeData = computed(() => flowDesign.node);
  let currentNav = ref<number>(2);
  let currentContext = ref<number>(1);
  let buttonName = ref<string>("保存");
  let menus = ref<Array<any>>([
    {
      name: "基本配置",
      code: 1,
      activate: true
    },
    {
      name: "展示设置",
      code: 2,
      activate: false
    },
    {
      name: "提醒填写",
      code: 3,
      activate: false
    },
    /* {
    name: '审批人设置',
    code: 4,
    activate: false,
  }, */
    {
      name: "打印模板",
      code: 5,
      activate: false
    }
  ]);
  // const isActivate=computed(()=>menu.value.activate)
  const toReturn = () => {};
  const change = (type) => {};
  const changeMenu = (menu) => {
    currentContext.value = menu.code;
    menus.value.forEach((m) => {
      if (m.name == menu.name) {
        m.activate = true;
      } else {
        m.activate = false;
      }
    });
  };
  const save = () => {
    emits("save", nodeData);
  };
</script>
