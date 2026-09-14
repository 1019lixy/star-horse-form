<template>
  <starhorse-form-item
    :showFormItem="showFormItem"
    :isDesign="isDesign"
    :disabled="disabled"
    :bareFlag="bareFlag"
    :field="field"
    :parentField="parentField"
  >
    <div class="mes-packing">
      <div class="mes-pk-boxhead">
        <el-tag v-if="capacity > 0" :type="isFull ? 'danger' : 'primary'" effect="plain">
          {{ currentBox.items.length }} / {{ capacity }}
        </el-tag>
        <el-tag v-else effect="plain" type="primary">{{ currentBox.items.length }} 件</el-tag>
        <span class="mes-pk-boxno">当前箱号：{{ currentBox.boxNo }}</span>
        <el-tag v-if="currentBox.sealed" type="warning" size="small">已封箱</el-tag>
        <span class="mes-pk-space"></span>
        <el-button
          v-if="boxNoMode === 'input'"
          size="small"
          :disabled="checkIsDisabled(props)"
          @click="manualBoxVisible = true"
        >
          设置箱号
        </el-button>
        <el-button
          size="small"
          type="warning"
          :disabled="checkIsDisabled(props) || currentBox.items.length === 0 || currentBox.sealed"
          @click="sealBox"
        >
          封箱
        </el-button>
      </div>

      <el-input
        ref="snInputRef"
        v-model="snValue"
        :placeholder="isFull ? '当前箱已满，请先封箱' : '扫序列号后回车装箱'"
        :disabled="checkIsDisabled(props) || currentBox.sealed"
        clearable
        :class="{'mes-pk--fail': flash}"
        @keyup.enter="handlePack"
      />

      <div v-if="lastMessage" :class="['mes-pk-msg', lastSuccess ? 'mes-pk-msg--ok' : 'mes-pk-msg--fail']">
        {{ lastMessage }}
      </div>

      <el-table :data="currentBox.items" size="small" max-height="200" border class="mes-pk-table">
        <el-table-column type="index" label="#" width="45" />
        <el-table-column prop="sn" label="序列号" min-width="140" show-overflow-tooltip />
        <el-table-column prop="time" label="时间" width="90" />
        <el-table-column label="操作" width="70" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="danger"
              size="small"
              :disabled="checkIsDisabled(props) || currentBox.sealed"
              @click="removeItem(row)"
            >
              移出
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <span style="font-size: 12px">暂无装箱明细</span>
        </template>
      </el-table>

      <div v-if="historyBoxes.length > 0" class="mes-pk-history">
        <div class="mes-pk-history__title">已封箱（{{ historyBoxes.length }}）</div>
        <el-tag
          v-for="box in historyBoxes"
          :key="box.boxNo"
          type="success"
          effect="plain"
          size="small"
          class="mes-pk-history__tag"
        >
          {{ box.boxNo }}（{{ box.items.length }}件）
        </el-tag>
      </div>

      <el-dialog v-model="manualBoxVisible" title="设置箱号" width="360px">
        <el-input v-model="manualBoxNo" placeholder="扫码或输入箱号" @keyup.enter="confirmManualBox" />
        <template #footer>
          <el-button @click="manualBoxVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmManualBox">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </starhorse-form-item>
</template>
<script setup lang="ts">
import {computed, nextTick, onMounted, reactive, ref} from "vue";
import {ItemPreps, checkIsDisabled, allAction} from "star-horse-lowcode";
import {useScanner} from "../utils/useScanner";

defineOptions({name: "MesPackingItem"});

interface PackItem {
  sn: string;
  time: string;
}

interface BoxData {
  boxNo: string;
  items: PackItem[];
  sealed: boolean;
  sealedTime?: string;
}

const props = withDefaults(defineProps<ItemPreps>(), {
  isDesign: false,
  disabled: false,
  showFormItem: false,
  bareFlag: false,
  isSearch: false,
});
const emits = defineEmits(["selfFunc", "selectItem"]);
const formData = defineModel("formData");

const preps = computed<any>(() => props.field?.preps || {});
const boxNoMode = computed(() => preps.value.boxNoMode || "auto");
const boxNoPrefix = computed(() => preps.value.boxNoPrefix || "BOX");
const boxNoField = computed(() => preps.value.boxNoField || "");
const capacity = computed(() => Number(preps.value.boxCapacity) || 0);

const snValue = ref("");
const snInputRef = ref();
const flash = ref<boolean>(false);
const lastMessage = ref("");
const lastSuccess = ref<boolean>(false);
const manualBoxVisible = ref(false);
const manualBoxNo = ref("");
const boxSeq = ref<number>(0);

const scanner = useScanner({
  allowRepeat: false,
  historySize: 200,
  soundTip: preps.value.soundTip !== false && preps.value.soundTip !== "false",
});

const genBoxNo = (): string => {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  boxSeq.value += 1;
  return `${boxNoPrefix.value}${ymd}${String(boxSeq.value).padStart(3, "0")}`;
};

const currentBox = reactive<BoxData>({
  boxNo: "",
  items: [],
  sealed: false,
});
const historyBoxes = reactive<BoxData[]>([]);

const isFull = computed(() => capacity.value > 0 && currentBox.items.length >= capacity.value);

const persistValue = () => {
  const fieldName = props.field?.fieldName;
  if (!fieldName || !formData.value) return;
  formData.value[fieldName] = {
    currentBox: {
      boxNo: currentBox.boxNo,
      items: currentBox.items.map((it) => it.sn),
      count: currentBox.items.length,
      sealed: currentBox.sealed,
    },
    historyBoxes: historyBoxes.map((b) => ({
      boxNo: b.boxNo,
      items: b.items.map((it) => it.sn),
      count: b.items.length,
      sealedTime: b.sealedTime,
    })),
  };
  allAction(props, emits, formData, "change");
};

const notify = (success: boolean, message: string) => {
  lastSuccess.value = success;
  lastMessage.value = message;
  flash.value = !success;
  scanner.beep(success);
  if (!success) {
    setTimeout(() => {
      flash.value = false;
    }, 600);
  }
};

const openNewBox = () => {
  currentBox.boxNo = boxNoMode.value === "auto" ? genBoxNo() : "";
  currentBox.items = [];
  currentBox.sealed = false;
};

const confirmManualBox = () => {
  const no = (manualBoxNo.value || "").trim();
  if (!no) return;
  if (currentBox.items.length > 0) {
    notify(false, "当前箱已有明细，请先封箱后再切换箱号");
    manualBoxVisible.value = false;
    return;
  }
  currentBox.boxNo = no;
  currentBox.sealed = false;
  manualBoxVisible.value = false;
  persistValue();
};

const handlePack = () => {
  if (props.isDesign || scanner.scanning.value) return;
  const sn = (snValue.value || "").trim();
  if (!sn) return;
  if (!currentBox.boxNo) {
    notify(false, "请先设置箱号");
    return;
  }
  if (currentBox.sealed) {
    notify(false, "当前箱已封箱，请设置新箱号");
    return;
  }
  if (isFull.value) {
    notify(false, `装箱已达上限 ${capacity.value} 件，请先封箱`);
    return;
  }
  if (scanner.isDuplicate(sn)) {
    notify(false, "该序列号已扫过，请勿重复装箱");
    return;
  }
  currentBox.items.push({sn, time: new Date().toLocaleTimeString()});
  scanner.markScanned(sn);
  notify(true, `已装入 ${sn}`);
  if (isFull.value) {
    sealBox(true);
  } else {
    persistValue();
  }
  snValue.value = "";
  nextTick(() => snInputRef.value?.focus?.());
};

const removeItem = (row: PackItem) => {
  const idx = currentBox.items.findIndex((it) => it.sn === row.sn);
  if (idx > -1) {
    currentBox.items.splice(idx, 1);
    scanner.unmarkScanned(row.sn);
    persistValue();
  }
};

const sealBox = (auto: boolean = false) => {
  if (currentBox.items.length === 0) return;
  currentBox.sealed = true;
  currentBox.sealedTime = new Date().toLocaleTimeString();
  historyBoxes.unshift({
    boxNo: currentBox.boxNo,
    items: [...currentBox.items],
    sealed: true,
    sealedTime: currentBox.sealedTime,
  });
  notify(true, auto ? `箱 ${currentBox.boxNo} 已满自动封箱（${currentBox.items.length}件）` : `箱 ${currentBox.boxNo} 封箱成功（${currentBox.items.length}件）`);
  persistValue();
  openNewBox();
};

const loadExisting = () => {
  const fieldName = props.field?.fieldName;
  const existing = fieldName ? formData.value?.[fieldName] : null;
  if (existing && typeof existing === "object") {
    if (existing.currentBox) {
      currentBox.boxNo = existing.currentBox.boxNo || "";
      currentBox.items = (existing.currentBox.items || []).map((sn: string) => ({
        sn,
        time: "",
      }));
      currentBox.sealed = !!existing.currentBox.sealed;
    }
    if (Array.isArray(existing.historyBoxes)) {
      historyBoxes.push(...existing.historyBoxes);
    }
  }
};

onMounted(() => {
  if (!props.field.preps) props.field.preps = {};
  loadExisting();
  if (boxNoMode.value === "auto" && !currentBox.boxNo) {
    openNewBox();
  }
  if (boxNoMode.value === "input" && boxNoField.value) {
    const externalBoxNo = formData.value?.[boxNoField.value];
    if (externalBoxNo && !currentBox.boxNo) {
      currentBox.boxNo = String(externalBoxNo);
    }
  }
  persistValue();
});
</script>
<style lang="scss" scoped>
.mes-packing {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mes-pk-boxhead {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.mes-pk-boxno {
  font-weight: 600;
  font-size: 13px;
}
.mes-pk-space {
  flex: 1;
}
.mes-pk--fail :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-color-danger) inset;
  animation: mes-pk-shake 0.3s;
}
@keyframes mes-pk-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.mes-pk-msg {
  font-size: 13px;
}
.mes-pk-msg--ok {
  color: var(--el-color-success);
}
.mes-pk-msg--fail {
  color: var(--el-color-danger);
}
.mes-pk-table {
  width: 100%;
}
.mes-pk-history {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.mes-pk-history__title {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.mes-pk-history__tag {
  margin-right: 4px;
}
</style>
