<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {SelectOption} from "@/components/types/SearchProps.d.ts";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";

let configInfo = ref<any>({tagsView: 'Y'});
let configStore = GlobalConfig(piniaInstance);
let sizeList = ref<Array<SelectOption>>([
  {name: "大", value: "large"},
  {name: "中", value: "default"},
  {name: "小", value: "small"},
]);
let showTypeList = ref<Array<SelectOption>>([
  {name: "排列展示", value: "line"},
  {name: "下拉展示", value: "dropdown"},
]);
let classicsList = ref<Array<any>>([
  {code: "white", color: "#ffffff", name: "白色"},
  {code: "snow", color: "#fffafa", name: "雪白色"},
  {code: "whitesmoke", color: "#f5f5f5", name: "烟白色"},
  {code: "floralwhite", color: "#fffaf0", name: "花白色"},
  {code: "antiquewhite", color: "#faebd7", name: "古董白"},
  {code: "ghostwhite", color: "#f8f8ff", name: "幽灵白"},
  {code: "mintcream", color: "#f5fffa", name: "薄荷色"},
  {code: "ivory", color: "#fffff0", name: "象牙色"},
  {code: "oldlace", color: "#fdf5e6", name: "老花色"},
  {code: "linen", color: "#faf0e6", name: "亚麻色"},
  {code: "beige", color: "#f5f5dc", name: "米色"},
  {code: "azure", color: "#f0ffff", name: "天蓝色"},
  {code: "honeydew", color: "#f0fff0", name: "蜜色"},
  {code: "aliceblue", color: "#f0f8ff", name: "艾利斯兰"},
  {code: "lightgoldenrodyellow", color: "#fafad2", name: "亮金黄色"},
  {code: "lightyellow", color: "#ffffe0", name: "亮黄色"},
  {code: "lemonchiffon", color: "#fffacd", name: "柠檬绸色"},
  {code: "cornsilk", color: "#fff8dc", name: "米绸色"},
  {code: "seaShell", color: "#fff5ee", name: "海贝色"},
  {code: "lavenderblush", color: "#fff0f5", name: "淡紫红"},
  {code: "papayawhip", color: "#ffefd5", name: "番木色"},
  {code: "blanchedalmond", color: "#ffebcd", name: "白杏色"},
  {code: "mistyrose", color: "#ffe4e1", name: "浅玫瑰色"},
  {code: "bisque", color: "#ffe4c4", name: "桔黄色"},
  {code: "moccasin", color: "#ffe4b5", name: "鹿皮色"},
  {code: "navajowhite", color: "#ffdead", name: "纳瓦白"},
  {code: "peachpuff", color: "#ffdab9", name: "桃色"},
  {code: "yellow", color: "#ffff00", name: "黄色"},
  {code: "gold", color: "#ffd700", name: "金色"},
  {code: "orange", color: "#ffa500", name: "橙色"},
  {code: "darkorange", color: "#ff8c00", name: "暗桔黄色"},
  {code: "coral", color: "#ff7f50", name: "珊瑚色"},
  {code: "pink", color: "#ffc0cb", name: "粉红色"},
  {code: "lightpink", color: "#ffb6c1", name: "亮粉红色"},
  {code: "lightsalmon", color: "#ffa07a", name: "亮肉色"},

  {code: "hotpink", color: "#ff69b4", name: "热粉红色"},
  {code: "tomato", color: "#ff6347", name: "西红柿色"},
  {code: "orangered", color: "#ff4500", name: "红橙色"},
  {code: "deeppink", color: "#ff1493", name: "深粉红色"},
  {code: "fuchsia", color: "#ff00ff", name: "紫红色"},
  {code: "magenta", color: "#ff00ff", name: "红紫色"},
  {code: "red", color: "#ff0000", name: "红色"},
  {code: "salmon", color: "#fa8072", name: "鲜肉色"},
  {code: "wheat", color: "#f5deb3", name: "浅黄色"},
  {code: "sandybrown", color: "#f4a460", name: "沙褐色"},
  {code: "khaki", color: "#f0e68c", name: "黄褐色"},
  {code: "lightcoral", color: "#f08080", name: "亮珊瑚色"},
  {code: "palegoldenrod", color: "#eee8aa", name: "苍麒麟色"},
  {code: "violet", color: "#ee82ee", name: "紫罗兰色"},
  {code: "darksalmon", color: "#e9967a", name: "暗肉色"},
  {code: "lavender", color: "#e6e6fa", name: "淡紫色"},
  {code: "lightcyan", color: "#e0ffff", name: "亮青色"},
  {code: "burlywood", color: "#deb887", name: "实木色"},
  {code: "plum", color: "#dda0dd", name: "洋李色"},
  {code: "gainsboro", color: "#dcdcdc", name: "淡灰色"},
  {code: "crimson", color: "#dc143c", name: "暗深红色"},
  {code: "palevioletred", color: "#db7093", name: "苍紫罗兰色"},
  {code: "goldenrod", color: "#daa520", name: "金麒麟色"},
  {code: "orchid", color: "#da70d6", name: "淡紫色"},
  {code: "thistle", color: "#d8bfd8", name: "蓟色"},
  {code: "lightgrey", color: "#d3d3d3", name: "亮灰色"},
  {code: "tan", color: "#d2b48c", name: "茶色"},
  {code: "chocolate", color: "#d2691e", name: "巧可力色"},
  {code: "peru", color: "#cd853f", name: "秘鲁色"},
  {code: "indianred", color: "#cd5c5c", name: "印第安红"},
  {code: "mediumvioletred", color: "#c71585", name: "中紫罗兰色"},
  {code: "silver", color: "#c0c0c0", name: "银色"},
  {code: "darkkhaki", color: "#bdb76b", name: "暗黄褐色"},
  {code: "rosybrown", color: "#bc8f8f", name: "褐玫瑰红"},
  {code: "mediumorchid", color: "#ba55d3", name: "中粉紫色"},
  {code: "darkgoldenrod", color: "#b8860b", name: "暗金黄色"},
  {code: "firebrick", color: "#b22222", name: "火砖色"},
  {code: "powderblue", color: "#b0e0e6", name: "粉蓝色"},
  {code: "lightsteelblue", color: "#b0c4de", name: "亮钢兰色"},
  {code: "paleturquoise", color: "#afeeee", name: "苍宝石绿"},
  {code: "greenyellow", color: "#adff2f", name: "黄绿色"},
  {code: "lightblue", color: "#add8e6", name: "亮蓝色"},
  {code: "darkgrey", color: "#a9a9a9", name: "暗灰色"},
  {code: "brown", color: "#a52a2a", name: "褐色"},
  {code: "sienna", color: "#a0522d", name: "赭色"},
  {code: "darkorchid", color: "#9932cc", name: "暗紫色"},
  {code: "palegreen", color: "#98fb98", name: "苍绿色"},
  {code: "darkviolet", color: "#9400d3", name: "暗紫罗兰色"},
  {code: "mediumpurple", color: "#9370db", name: "中紫色"},
  {code: "lightgreen", color: "#90ee90", name: "亮绿色"},
  {code: "darkseagreen", color: "#8fbc8f", name: "暗海兰色"},
  {code: "saddlebrown", color: "#8b4513", name: "重褐色"},
  {code: "darkmagenta", color: "#8b008b", name: "暗洋红"},
  {code: "darkred", color: "#8b0000", name: "暗红色"},
  {code: "blueviolet", color: "#8a2be2", name: "紫罗兰蓝色"},
  {code: "lightskyblue", color: "#87cefa", name: "亮天蓝色"},
  {code: "skyblue", color: "#87ceeb", name: "天蓝色"},
  {code: "olive", color: "#808000", name: "橄榄色"},
  {code: "purple", color: "#800080", name: "紫色"},
  {code: "maroon", color: "#800000", name: "粟色"},
  {code: "aquamarine", color: "#7fffd4", name: "碧绿色"},
  {code: "chartreuse", color: "#7fff00", name: "黄绿色"},
  {code: "lawngreen", color: "#7cfc00", name: "草绿色"},
  {code: "mediumslateblue", color: "#7b68ee", name: "中暗蓝色"},
  {code: "lightslategrey", color: "#778899", name: "亮蓝灰"},
  {code: "slategrey", color: "#708090", name: "灰石色"},
  {code: "olivedrab", color: "#6b8e23", name: "深绿褐色"},
  {code: "slateblue", color: "#6a5acd", name: "石蓝色"},
  {code: "grey", color: "#808080", name: "灰色"},
  {code: "dimgray", color: "#696969", name: "暗灰色"},
  {code: "mediumaquamarine", color: "#66cdaa", name: "中绿色"},
  {code: "cornflowerblue", color: "#6495ed", name: "菊兰色"},
  {code: "cadetblue", color: "#5f9ea0", name: "军兰色"},
  {code: "darkolivegreen", color: "#556b2f", name: "暗橄榄绿"},
  {code: "indigo", color: "#4b0082", name: "靛青色"},
  {code: "mediumturquoise", color: "#48d1cc", name: "中绿宝石"},
  {code: "darkslateblue", color: "#483d8b", name: "暗灰蓝色"},
  {code: "steelblue", color: "#4682b4", name: "钢兰色"},
  {code: "royalblue", color: "#4169e1", name: "皇家蓝"},
  {code: "turquoise", color: "#40e0d0", name: "青绿色"},
  {code: "mediumseagreen", color: "#3cb371", name: "中海蓝"},
  {code: "limegreen", color: "#32cd32", name: "橙绿色"},
  {code: "darkslategrey", color: "#2f4f4f", name: "暗瓦灰色"},
  {code: "seagreen", color: "#2e8b57", name: "海绿色"},
  {code: "forestgreen", color: "#228b22", name: "森林绿"},
  {code: "lightseagreen", color: "#20b2aa", name: "亮海蓝色"},
  {code: "dodgerblue", color: "#1e90ff", name: "闪兰色"},
  {code: "midnightblue", color: "#191970", name: "中灰兰色"},
  {code: "aqua", color: "#00ffff", name: "浅绿色"},
  {code: "cyan", color: "#00ffff", name: "青色"},
  {code: "springgreen", color: "#00ff7f", name: "春绿色"},
  {code: "lime", color: "#00ff00", name: "酸橙色"},
  {code: "mediumspringgreen", color: "#00fa9a", name: "中春绿色"},
  {code: "darkturquoise", color: "#00ced1", name: "暗宝石绿"},
  {code: "deepskyblue", color: "#00bfff", name: "深天蓝色"},
  {code: "darkcyan", color: "#008b8b", name: "暗青色"},
  {code: "teal", color: "#008080", name: "水鸭色"},
  {code: "green", color: "#008000", name: "绿色"},
  {code: "darkgreen", color: "#006400", name: "暗绿色"},
  {code: "blue", color: "#0000ff", name: "蓝色"},
  {code: "mediumblue", color: "#0000cd", name: "中兰色"},
  {code: "darkblue", color: "#00008b", name: "暗蓝色"},
  {code: "navy", color: "#000080", name: "海军色"},
  {code: "black", color: "#000000", name: "黑色"}
]);
configInfo = computed(() => configStore.configFormInfo);
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
const changeOperation = (val: any) => {
  configStore.setConfigFormInfo(configInfo.value);
};
const resetDefault = () => {
  let defaultConfig = {
    tagsView: 'Y',
    inputSize: 'small',
    buttonSize: 'small',
    buttonShowType: "dropdown",
    themeColor: "#3a8ee6",
    shortCutMenus: "Y"
  };
  configStore.setConfigFormInfo(defaultConfig);
};
const classicsTheme = (color: string) => {
  configInfo.value.themeColor = color;
  changeOperation();
};
onMounted(() => {
  init();
});
</script>
<template>
  <el-form style="height: 100%;overflow: hidden;" :model="configInfo" size="small" label-position="top">
    <el-scrollbar height="100%">
      <el-divider content-position="left">
        <h4>布局</h4>
      </el-divider>
      <el-form-item prop="buttonShowType" label="页面按钮显示风格">
        <el-select v-model="configInfo.buttonShowType" @change="changeOperation">
          <el-option v-for="item in showTypeList" :value="item.value" :label="item.name" :key="item.value"/>
        </el-select>
      </el-form-item>
      <el-divider content-position="left">
        <h4>颜色</h4>
      </el-divider>
      <el-form-item prop="themeColor" label="主题颜色">
        <template v-for="item in classicsList">
          <div class="theme-item" @click="classicsTheme(item.color)">
            <el-tag :color="item.color" style="margin-right: 8px" size="small"/>
            <span>{{ item.name }}</span>
          </div>
        </template>
      </el-form-item>
      <el-form-item prop="themeColor" label="自定义颜色">
        <el-color-picker v-model="configInfo.themeColor" @change="changeOperation"/>
      </el-form-item>
      <el-divider content-position="left">
        <h4>尺寸</h4>
      </el-divider>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="inputSize" label="组件尺寸">
            <el-select v-model="configInfo.inputSize" @change="changeOperation">
              <el-option v-for="item in sizeList" :value="item.value" :label="item.name" :key="item.value"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="buttonSize" label="按钮尺寸 ">
            <el-select v-model="configInfo.buttonSize" @change="changeOperation">
              <el-option v-for="item in sizeList" :value="item.value" :label="item.name" :key="item.value"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">
        <h4>菜单</h4>
      </el-divider>
      <el-divider content-position="left">
        <h4>其他配置</h4>
      </el-divider>
      <el-form-item prop="tagsView" label="开启/关闭TagsView ">
        <el-switch v-model="configInfo.tagsView" :active-value="'Y'" inactive-value="'N'" @change="changeOperation">
        </el-switch>
      </el-form-item>
      <el-form-item prop="shortCutMenus" label="开启/关闭快捷菜单 ">
        <el-switch v-model="configInfo.shortCutMenus" :active-value="'Y'" inactive-value="'N'"
                   @change="changeOperation">
        </el-switch>
      </el-form-item>
      <el-form-item prop="shortCutMenus" label=" ">
        <el-button @click="resetDefault">一键默认配置</el-button>
      </el-form-item>
    </el-scrollbar>
  </el-form>
</template>

<style scoped lang="scss">

.theme-item {
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  width: 25%;
}

.el-tag {
  border: none;
  aspect-ratio: 1;
}
</style>
