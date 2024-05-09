<script>
import icon from "@/assets/icon";

export default {
  name: "StarHorsePopover",
  props: {
    menuIcon: {type:String}
  },
  data() {
    return {
      iconList: icon
    }
  },
  methods: {
    menuIconSelect(icon) {

    }
  }
}
</script>

<style scoped>

</style>
<template>
  <el-popover placement = "bottom" :width = "550" trigger = "click">
    <template #reference>
      <slot></slot>
    </template>
    <ul class = "system-icon">
      <li v-for = "sdata in iconList" @click = "menuIconSelect(sdata.menuIcon)"
          :class = "menuIcon==sdata.menuIcon?'icon-active':''">
        <el-tooltip :content = "sdata.label">
          <star-horse-icon :icon-class = "sdata.menuIcon"
                     style = "color:var(--star-horse-style);vertical-align: middle;font-size: 48px"/>
        </el-tooltip>
      </li>
    </ul>
  </el-popover>
</template>

