import piniaInstance from "@/store";
import {useDesignFormStore} from "@/store/DesignForm";
import {useCopyerOperationStore} from "@/store/CopyerOperation";

export const getDesignFormStore = () => useDesignFormStore(piniaInstance);
export const getCopyerOperationStore = () => useCopyerOperationStore(piniaInstance);
