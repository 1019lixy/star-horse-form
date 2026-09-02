import piniaInstance from "@/store";
import {useDesignFormStore} from "@/store/DesignForm";
import {useCopyerOperationStore} from "@/store/CopyerOperation";
import {useFlowDesignStore} from "@/store/FlowDesign";

export const getDesignFormStore = () => useDesignFormStore(piniaInstance);
export const getCopyerOperationStore = () =>
  useCopyerOperationStore(piniaInstance);
/** 流程设计缓存 */
export const getFlowDesignStore = () => useFlowDesignStore(piniaInstance);
