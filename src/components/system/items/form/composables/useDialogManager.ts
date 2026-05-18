import {ref} from "vue";
import {getDesignFormStore} from "star-horse-lowcode";


export function useDialogManager() {
    const dialogStates = ref({
        codeDialogVisible: false,
        configDialogVisible: false,
        batchEditFieldVisible: false,
        previewVisible: false,
        formFieldLayer: false,
        // Adding missing dialog states for ItemPropertiesPanel
        buttonEventDialog: false,
        dataRelationDialog: false,
        dataSourceDialog: false,
        paramsDialog: false,
        containerDialog: false,
        jsEditor: false,
        preOrPendDialog: false,
        userDefinePrepsDialog: false,
        bindFieldVisible: false
    });

    const setShortKeyDisabled = (disabled: boolean) => {
        getDesignFormStore().setShortKeyDisabled(disabled);
    };

    const openDialog = (dialogName: string) => {
        // Close all dialogs first
        Object.keys(dialogStates.value).forEach((key) => {
            dialogStates.value[key as keyof typeof dialogStates.value] = false;
        });

        // Open the requested dialog
        if (dialogName in dialogStates.value) {
            dialogStates.value[dialogName as keyof typeof dialogStates.value] = true;
            setShortKeyDisabled(true);
        }
    };

    const closeAllDialogs = () => {
        Object.keys(dialogStates.value).forEach((key) => {
            dialogStates.value[key as keyof typeof dialogStates.value] = false;
        });
        setShortKeyDisabled(false);
    };

    const closeDialog = (dialogName: string) => {
        if (dialogName in dialogStates.value) {
            dialogStates.value[dialogName as keyof typeof dialogStates.value] = false;
            setShortKeyDisabled(false);
        }
    };

    return {
        dialogStates,
        openDialog,
        closeAllDialogs,
        closeDialog,
    };
}
