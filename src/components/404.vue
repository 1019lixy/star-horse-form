<script lang="ts" setup name="NotFound">
import {useRouter} from "vue-router";
import {i18n} from "@/lang";

const router = useRouter();
const backFun = () => {
  router.go(-2);
};
</script>
<style lang="scss" scoped>
.inner_content {
  min-height: 450px;
  height: 100vh;
  margin: 0;
  padding: 0;
  background: radial-gradient(circle, var(--star-horse-style), #1f4f96, #1b2949, #000);
}

.stage {
  height: 80%;
  width: 80%;
  margin: auto;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  perspective: 9999px;
  transform-style: preserve-3d;
}

.layer {
  width: 100%;
  height: 100%;
  position: absolute;
  transform-style: preserve-3d;
  animation: star_horse 5s infinite alternate ease-in-out -7.5s;
  animation-fill-mode: forwards;
  transform: rotateY(5deg) rotateX(3deg) translateZ(0);
}

.layer:after {
  font: 150px/0.65 "Pacifico",
  "Kaushan Script",
  Futura,
  "Roboto",
  "Trebuchet MS",
  Helvetica,
  sans-serif;
  content: "Star Horse Say :\A\A 404  :( \A\A   Page not Found";
  white-space: pre;
  text-align: center;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 50px;
  color: whitesmoke;
  letter-spacing: -2px;
  text-shadow: 4px 0 10px rgba(0, 0, 0, 0.13);
}

.layer:nth-child(1):after {
  transform: translateZ(0px);
}

.layer:nth-child(2):after {
  transform: translateZ(-1.5px);
}

.layer:nth-child(3):after {
  transform: translateZ(-3px);
}

.layer:nth-child(4):after {
  transform: translateZ(-4.5px);
}

.layer:nth-child(5):after {
  transform: translateZ(-6px);
}

.layer:nth-child(6):after {
  transform: translateZ(-7.5px);
}

.layer:nth-child(7):after {
  transform: translateZ(-9px);
}

.layer:nth-child(8):after {
  transform: translateZ(-10.5px);
}

.layer:nth-child(9):after {
  transform: translateZ(-12px);
}

.layer:nth-child(10):after {
  transform: translateZ(-13.5px);
}

.layer:nth-child(11):after {
  transform: translateZ(-15px);
}

.layer:nth-child(12):after {
  transform: translateZ(-16.5px);
}

.layer:nth-child(13):after {
  transform: translateZ(-18px);
}

.layer:nth-child(14):after {
  transform: translateZ(-19.5px);
}

.layer:nth-child(15):after {
  transform: translateZ(-21px);
}

.layer:nth-child(16):after {
  transform: translateZ(-22.5px);
}

.layer:nth-child(17):after {
  transform: translateZ(-24px);
}

.layer:nth-child(18):after {
  transform: translateZ(-25.5px);
}

.layer:nth-child(19):after {
  transform: translateZ(-27px);
}

.layer:nth-child(20):after {
  transform: translateZ(-28.5px);
}

.layer:nth-child(n + 10):after {
  -webkit-text-stroke: 3px rgba(0, 0, 0, 0.25);
}

.layer:nth-child(n + 11):after {
  -webkit-text-stroke: 15px var(--star-horse-style);
  text-shadow: 6px 0 6px #00366b,
  5px 5px 5px #002951,
  0 6px 6px #00366b;
}

.layer:nth-child(n + 12):after {
  -webkit-text-stroke: 15px var(--star-horse-style);
}

.layer:last-child:after {
  -webkit-text-stroke: 17px rgba(0, 0, 0, 0.1);
}

.layer:first-child:after {
  color: var(--star-horse-white);
  text-shadow: none;
}

@keyframes star_horse {
  100% {
    transform: rotateY(-40deg) rotateX(-43deg);
  }
}

.go-back {
  width: 70px;
  line-height: 35px;
  height: 35px;
  padding-left: 15px;
  font-weight: bold;
  border-radius: 3px;
  color: var(--star-horse-white);
  cursor: pointer;

  &:hover {
    background: var(--star-horse-style);
  }

  &:after {
    content: "Go Back";
  }
}

.main-copyright {
  position: absolute;
  bottom: 0;
  padding: 0;
  margin: 0;
}

:deep(.el-card__body) {
  margin: unset !important;
}
</style>
<template>
  <el-card class="inner_content">
    <div class="stage">
      <div class="layer"></div>
      <div class="layer"></div>
      <div class="layer"></div>
      <div class="layer"></div>
      <div class="layer"></div>
      <div class="layer"></div>
      <div class="layer"></div>
      <div class="layer"></div>
      <div class="layer"></div>
      <div class="layer"></div>
      <div class="layer"></div>
      <div class="layer"></div>
      <div class="layer"></div>
      <div class="layer"></div>
      <div class="layer"></div>
      <div class="layer"></div>
      <div class="layer"></div>
      <div class="layer"></div>
      <div class="layer"></div>
      <div class="layer"></div>
      <div @click="backFun" class="go-back"></div>
    </div>
    <div class="main-copyright">{{ i18n("starhorse.copyright") }}</div>
  </el-card>
</template>
