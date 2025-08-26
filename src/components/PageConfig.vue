<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  piniaInstance,
  SelectOption,
  useGlobalConfigStore,
} from "star-horse-lowcode";
import { useDark, useToggle } from "@vueuse/core";
import { Config } from "@/api/settings";
import { i18n } from "@/lang";

let configStore = useGlobalConfigStore(piniaInstance);
let sizeList = ref<Array<SelectOption>>([
  { name: i18n("size.large"), value: "large" },
  { name: i18n("size.medium"), value: "default" },
  { name: i18n("size.small"), value: "small" },
]);
let showTypeList = ref<Array<SelectOption>>([
  { name: i18n("displayStyle.arrangement"), value: "line" },
  { name: i18n("displayStyle.dropdown"), value: "dropdown" },
]);
let tableTypeList = ref<Array<SelectOption>>([
  { name: i18n("displayStyle.list"), value: "list" },
  { name: i18n("displayStyle.card"), value: "card" },
]);
let classicsList = ref<Array<any>>([
  { code: "white", color: "#ffffff", name: i18n("color.white") },
  { code: "snow", color: "#fffafa", name: i18n("color.snow") },
  { code: "whitesmoke", color: "#f5f5f5", name: i18n("color.whitesmoke") },
  { code: "floralwhite", color: "#fffaf0", name: i18n("color.floralwhite") },
  { code: "antiquewhite", color: "#faebd7", name: i18n("color.antiquewhite") },
  { code: "ghostwhite", color: "#f8f8ff", name: i18n("color.ghostwhite") },
  { code: "mintcream", color: "#f5fffa", name: i18n("color.mintcream") },
  { code: "ivory", color: "#fffff0", name: i18n("color.ivory") },
  { code: "oldlace", color: "#fdf5e6", name: i18n("color.oldlace") },
  { code: "linen", color: "#faf0e6", name: i18n("color.linen") },
  { code: "beige", color: "#f5f5dc", name: i18n("color.beige") },
  { code: "azure", color: "#f0ffff", name: i18n("color.azure") },
  { code: "honeydew", color: "#f0fff0", name: i18n("color.honeydew") },
  { code: "aliceblue", color: "#f0f8ff", name: i18n("color.aliceblue") },
  {
    code: "lightgoldenrodyellow",
    color: "#fafad2",
    name: i18n("color.lightgoldenrodyellow"),
  },
  { code: "lightyellow", color: "#ffffe0", name: i18n("color.lightyellow") },
  { code: "lemonchiffon", color: "#fffacd", name: i18n("color.lemonchiffon") },
  { code: "cornsilk", color: "#fff8dc", name: i18n("color.cornsilk") },
  { code: "seaShell", color: "#fff5ee", name: i18n("color.seaShell") },
  {
    code: "lavenderblush",
    color: "#fff0f5",
    name: i18n("color.lavenderblush"),
  },
  { code: "papayawhip", color: "#ffefd5", name: i18n("color.papayawhip") },
  {
    code: "blanchedalmond",
    color: "#ffebcd",
    name: i18n("color.blanchedalmond"),
  },
  { code: "mistyrose", color: "#ffe4e1", name: i18n("color.mistyrose") },
  { code: "bisque", color: "#ffe4c4", name: i18n("color.bisque") },
  { code: "moccasin", color: "#ffe4b5", name: i18n("color.moccasin") },
  { code: "navajowhite", color: "#ffdead", name: i18n("color.navajowhite") },
  { code: "peachpuff", color: "#ffdab9", name: i18n("color.peachpuff") },
  { code: "yellow", color: "#ffff00", name: i18n("color.yellow") },
  { code: "gold", color: "#ffd700", name: i18n("color.gold") },
  { code: "orange", color: "#ffa500", name: i18n("color.orange") },
  { code: "darkorange", color: "#ff8c00", name: i18n("color.darkorange") },
  { code: "coral", color: "#ff7f50", name: i18n("color.coral") },
  { code: "pink", color: "#ffc0cb", name: i18n("color.pink") },
  { code: "lightpink", color: "#ffb6c1", name: i18n("color.lightpink") },
  { code: "lightsalmon", color: "#ffa07a", name: i18n("color.lightsalmon") },
  { code: "hotpink", color: "#ff69b4", name: i18n("color.hotpink") },
  { code: "tomato", color: "#ff6347", name: i18n("color.tomato") },
  { code: "orangered", color: "#ff4500", name: i18n("color.orangered") },
  { code: "deeppink", color: "#ff1493", name: i18n("color.deeppink") },
  { code: "fuchsia", color: "#ff00ff", name: i18n("color.fuchsia") },
  { code: "magenta", color: "#ff00ff", name: i18n("color.magenta") },
  { code: "red", color: "#ff0000", name: i18n("color.red") },
  { code: "salmon", color: "#fa8072", name: i18n("color.salmon") },
  { code: "wheat", color: "#f5deb3", name: i18n("color.wheat") },
  { code: "sandybrown", color: "#f4a460", name: i18n("color.sandybrown") },
  { code: "khaki", color: "#f0e68c", name: i18n("color.khaki") },
  { code: "lightcoral", color: "#f08080", name: i18n("color.lightcoral") },
  {
    code: "palegoldenrod",
    color: "#eee8aa",
    name: i18n("color.palegoldenrod"),
  },
  { code: "violet", color: "#ee82ee", name: i18n("color.violet") },
  { code: "darksalmon", color: "#e9967a", name: i18n("color.darksalmon") },
  { code: "lavender", color: "#e6e6fa", name: i18n("color.lavender") },
  { code: "lightcyan", color: "#e0ffff", name: i18n("color.lightcyan") },
  { code: "burlywood", color: "#deb887", name: i18n("color.burlywood") },
  { code: "plum", color: "#dda0dd", name: i18n("color.plum") },
  { code: "gainsboro", color: "#dcdcdc", name: i18n("color.gainsboro") },
  { code: "crimson", color: "#dc143c", name: i18n("color.crimson") },
  {
    code: "palevioletred",
    color: "#db7093",
    name: i18n("color.palevioletred"),
  },
  { code: "goldenrod", color: "#daa520", name: i18n("color.goldenrod") },
  { code: "orchid", color: "#da70d6", name: i18n("color.orchid") },
  { code: "thistle", color: "#d8bfd8", name: i18n("color.thistle") },
  { code: "lightgrey", color: "#d3d3d3", name: i18n("color.lightgrey") },
  { code: "tan", color: "#d2b48c", name: i18n("color.tan") },
  { code: "chocolate", color: "#d2691e", name: i18n("color.chocolate") },
  { code: "peru", color: "#cd853f", name: i18n("color.peru") },
  { code: "indianred", color: "#cd5c5c", name: i18n("color.indianred") },
  {
    code: "mediumvioletred",
    color: "#c71585",
    name: i18n("color.mediumvioletred"),
  },
  { code: "silver", color: "#c0c0c0", name: i18n("color.silver") },
  { code: "darkkhaki", color: "#bdb76b", name: i18n("color.darkkhaki") },
  { code: "rosybrown", color: "#bc8f8f", name: i18n("color.rosybrown") },
  { code: "mediumorchid", color: "#ba55d3", name: i18n("color.mediumorchid") },
  {
    code: "darkgoldenrod",
    color: "#b8860b",
    name: i18n("color.darkgoldenrod"),
  },
  { code: "firebrick", color: "#b22222", name: i18n("color.firebrick") },
  { code: "powderblue", color: "#b0e0e6", name: i18n("color.powderblue") },
  {
    code: "lightsteelblue",
    color: "#b0c4de",
    name: i18n("color.lightsteelblue"),
  },
  {
    code: "paleturquoise",
    color: "#afeeee",
    name: i18n("color.paleturquoise"),
  },
  { code: "greenyellow", color: "#adff2f", name: i18n("color.greenyellow") },
  { code: "lightblue", color: "#add8e6", name: i18n("color.lightblue") },
  { code: "darkgrey", color: "#a9a9a9", name: i18n("color.darkgrey") },
  { code: "brown", color: "#a52a2a", name: i18n("color.brown") },
  { code: "sienna", color: "#a0522d", name: i18n("color.sienna") },
  { code: "darkorchid", color: "#9932cc", name: i18n("color.darkorchid") },
  { code: "palegreen", color: "#98fb98", name: i18n("color.palegreen") },
  { code: "darkviolet", color: "#9400d3", name: i18n("color.darkviolet") },
  { code: "mediumpurple", color: "#9370db", name: i18n("color.mediumpurple") },
  { code: "lightgreen", color: "#90ee90", name: i18n("color.lightgreen") },
  { code: "darkseagreen", color: "#8fbc8f", name: i18n("color.darkseagreen") },
  { code: "saddlebrown", color: "#8b4513", name: i18n("color.saddlebrown") },
  { code: "darkmagenta", color: "#8b008b", name: i18n("color.darkmagenta") },
  { code: "darkred", color: "#8b0000", name: i18n("color.darkred") },
  { code: "blueviolet", color: "#8a2be2", name: i18n("color.blueviolet") },
  { code: "lightskyblue", color: "#87cefa", name: i18n("color.lightskyblue") },
  { code: "skyblue", color: "#87ceeb", name: i18n("color.skyblue") },
  { code: "olive", color: "#808000", name: i18n("color.olive") },
  { code: "purple", color: "#800080", name: i18n("color.purple") },
  { code: "maroon", color: "#800000", name: i18n("color.maroon") },
  { code: "aquamarine", color: "#7fffd4", name: i18n("color.aquamarine") },
  { code: "chartreuse", color: "#7fff00", name: i18n("color.chartreuse") },
  { code: "lawngreen", color: "#7cfc00", name: i18n("color.lawngreen") },
  {
    code: "mediumslateblue",
    color: "#7b68ee",
    name: i18n("color.mediumslateblue"),
  },
  {
    code: "lightslategrey",
    color: "#778899",
    name: i18n("color.lightslategrey"),
  },
  { code: "slategrey", color: "#708090", name: i18n("color.slategrey") },
  { code: "olivedrab", color: "#6b8e23", name: i18n("color.olivedrab") },
  { code: "slateblue", color: "#6a5acd", name: i18n("color.slateblue") },
  { code: "grey", color: "#808080", name: i18n("color.grey") },
  { code: "dimgray", color: "#696969", name: i18n("color.dimgray") },
  {
    code: "mediumaquamarine",
    color: "#66cdaa",
    name: i18n("color.mediumaquamarine"),
  },
  {
    code: "cornflowerblue",
    color: "#6495ed",
    name: i18n("color.cornflowerblue"),
  },
  { code: "cadetblue", color: "#5f9ea0", name: i18n("color.cadetblue") },
  {
    code: "darkolivegreen",
    color: "#556b2f",
    name: i18n("color.darkolivegreen"),
  },
  { code: "indigo", color: "#4b0082", name: i18n("color.indigo") },
  {
    code: "mediumturquoise",
    color: "#48d1cc",
    name: i18n("color.mediumturquoise"),
  },
  {
    code: "darkslateblue",
    color: "#483d8b",
    name: i18n("color.darkslateblue"),
  },
  { code: "steelblue", color: "#4682b4", name: i18n("color.steelblue") },
  { code: "royalblue", color: "#4169e1", name: i18n("color.royalblue") },
  { code: "turquoise", color: "#40e0d0", name: i18n("color.turquoise") },
  {
    code: "mediumseagreen",
    color: "#3cb371",
    name: i18n("color.mediumseagreen"),
  },
  { code: "limegreen", color: "#32cd32", name: i18n("color.limegreen") },
  {
    code: "darkslategrey",
    color: "#2f4f4f",
    name: i18n("color.darkslategrey"),
  },
  { code: "seagreen", color: "#2e8b57", name: i18n("color.seagreen") },
  { code: "forestgreen", color: "#228b22", name: i18n("color.forestgreen") },
  {
    code: "lightseagreen",
    color: "#20b2aa",
    name: i18n("color.lightseagreen"),
  },
  { code: "dodgerblue", color: "#1e90ff", name: i18n("color.dodgerblue") },
  { code: "midnightblue", color: "#191970", name: i18n("color.midnightblue") },
  { code: "aqua", color: "#00ffff", name: i18n("color.aqua") },
  { code: "cyan", color: "#00ffff", name: i18n("color.cyan") },
  { code: "springgreen", color: "#00ff7f", name: i18n("color.springgreen") },
  { code: "lime", color: "#00ff00", name: i18n("color.lime") },
  {
    code: "mediumspringgreen",
    color: "#00fa9a",
    name: i18n("color.mediumspringgreen"),
  },
  {
    code: "darkturquoise",
    color: "#00ced1",
    name: i18n("color.darkturquoise"),
  },
  {
    code: "darkturquoise1",
    color: "#00c7e1",
    name: i18n("color.darkturquoise1"),
  },
  { code: "deepskyblue", color: "#00bfff", name: i18n("color.deepskyblue") },
  { code: "darkcyan", color: "#008b8b", name: i18n("color.darkcyan") },
  { code: "teal", color: "#008080", name: i18n("color.teal") },
  { code: "green", color: "#008000", name: i18n("color.green") },
  { code: "darkgreen", color: "#006400", name: i18n("color.darkgreen") },
  { code: "blue", color: "#0000ff", name: i18n("color.blue") },
  { code: "mediumblue", color: "#0000cd", name: i18n("color.mediumblue") },
  { code: "darkblue", color: "#00008b", name: i18n("color.darkblue") },
  { code: "navy", color: "#000080", name: i18n("color.navy") },
  { code: "black", color: "#000000", name: i18n("color.black") },
]);
let configInfo = computed(() => configStore.configFormInfo);
const init = () => {
  configStore.clearAll();
  // for (let a in classicsList.value) {
  //   let temp = classicsList.value[a];
  //   for (let b = parseInt(a) + 1; b < classicsList.value.length; b++) {
  //     let temp1 = classicsList.value[b];
  //     if (temp.code == temp1.code) {
  //       console.log(temp1);
  //     }
  //   }
  //
  // }
};
const isDark = useDark({
  storageKey: "vitepress-theme-appearance",
});

const toggle = () => {
  console.log(isDark);
  useToggle(isDark);
};
const changeOperation = (_val: any) => {
  configStore.setConfigFormInfo(configInfo.value);
};
const resetDefault = () => {
  let defaultConfig = {
    tagsView: "Y",
    inputSize: "small",
    buttonSize: "small",
    buttonShowType: "dropdown",
    themeColor: "#409EFF",
    position: "left",
    menusCfg: "tradition",
    shortCutMenus: "Y",
  };
  configStore.setConfigFormInfo(defaultConfig);
};
const classicsTheme = (color: string) => {
  configInfo.value.themeColor = color;
  changeOperation(null);
};
onMounted(() => {
  init();
});
</script>
<template>
  <el-card class="inner_content">
    <el-scrollbar height="100%">
      <el-form
        class="page-config"
        :model="configInfo"
        :size="Config.compSize"
        label-position="top"
      >
        <el-divider content-position="left">
          <el-form-item
            prop="themeColor"
            :label="i18n('pageConfig.color')"
            :label-position="'left'"
          >
            <el-color-picker
              v-model="configInfo.themeColor"
              @change="changeOperation"
            />
          </el-form-item>
        </el-divider>
        <el-form-item
          prop="themeColor"
          :label="i18n('pageConfig.themeColor')"
          style="height: 200px; width: 100%; overflow: auto"
        >
          <template v-for="item in classicsList">
            <div class="theme-item" @click="classicsTheme(item.color)">
              <el-tag
                :color="item.color"
                style="margin-right: 8px"
                :size="Config.compSize"
              />
              <span>{{ item.name }}</span>
            </div>
          </template>
        </el-form-item>
        <el-divider content-position="left">
          <h4>{{ i18n("pageConfig.sizeAndList") }}</h4>
        </el-divider>
        <el-row gutter="10">
          <el-col :span="8">
            <el-form-item
              prop="inputSize"
              :label="i18n('pageConfig.componentSize')"
            >
              <el-select
                v-model="configInfo.inputSize"
                @change="changeOperation"
              >
                <el-option
                  v-for="item in sizeList"
                  :value="item.value"
                  :label="item.name"
                  :key="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              prop="buttonSize"
              :label="i18n('pageConfig.buttonSize')"
            >
              <el-select
                v-model="configInfo.buttonSize"
                @change="changeOperation"
              >
                <el-option
                  v-for="item in sizeList"
                  :value="item.value"
                  :label="item.name"
                  :key="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              prop="tableType"
              :label="i18n('pageConfig.dataDisplay')"
            >
              <el-select
                v-model="configInfo.tableType"
                @change="changeOperation"
              >
                <el-option
                  v-for="item in tableTypeList"
                  :value="item.value"
                  :label="item.name"
                  :key="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">
          <h4>{{ i18n("pageConfig.menu") }}</h4>
        </el-divider>
        <el-row gutter="10">
          <el-col :span="12">
            <el-form-item
              prop="position"
              :label="i18n('pageConfig.menuPosition')"
            >
              <el-radio-group
                v-model="configInfo.position"
                @change="changeOperation"
              >
                <el-radio :label="i18n('pageConfig.top')" value="top" />
                <el-radio :label="i18n('pageConfig.left')" value="left" />
                <el-radio :label="i18n('pageConfig.right')" value="right" />
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="menusCfg" :label="i18n('pageConfig.menuStyle')">
              <el-radio-group
                v-model="configInfo.menusCfg"
                @change="changeOperation"
              >
                <el-radio
                  :label="i18n('pageConfig.traditionalStyle')"
                  value="tradition"
                />
                <el-radio
                  :label="i18n('pageConfig.fixedWidth')"
                  value="fixed"
                />
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">
          <h4>{{ i18n("pageConfig.otherConfig") }}</h4>
        </el-divider>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item prop="tagsView" :label="i18n('pageConfig.tagsView')">
              <el-switch
                v-model="configInfo.tagsView"
                :active-value="'Y'"
                :inactive-value="'N'"
                @change="changeOperation"
              >
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              prop="shortCutMenus"
              :label="i18n('pageConfig.shortcutMenu')"
            >
              <el-switch
                v-model="configInfo.shortCutMenus"
                :active-value="'Y'"
                :inactive-value="'N'"
                @change="changeOperation"
              >
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              prop="buttonShowType"
              :label="i18n('pageConfig.buttonDisplayStyle')"
            >
              <el-select
                v-model="configInfo.buttonShowType"
                @change="changeOperation"
              >
                <el-option
                  v-for="item in showTypeList"
                  :value="item.value"
                  :label="item.name"
                  :key="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="reset-button">
        <el-button :size="Config.compSize" @click="resetDefault">
          <star-horse-icon icon-class="reset" />
          {{ i18n("pageConfig.resetDefaultConfig") }}
        </el-button>
      </div>
    </el-scrollbar>
  </el-card>
</template>
<style scoped lang="scss">
.page-config {
  height: 100%;
  overflow: hidden;
  width: 95%;
  margin: 10px auto;
}

.reset-button {
  margin-top: 15px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-item {
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  width: 25%;
  overflow: auto;
}

.el-tag {
  border: none;
  aspect-ratio: 1;
}
</style>
