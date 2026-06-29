import { ModuleEnums } from "@/components/enums/ModuleEnums";
import {
  dyAltDown,
  dyAltLeft,
  dyAltRight,
  dyAltUp,
  dyBackspace,
  dyCopy,
  dyCtrlDown,
  dyCtrlLeft,
  dyCtrlRight,
  dyCtrlUp,
  dyCut,
  dyDelete,
  dyDeleteAll,
  dyDown,
  dyEnter,
  dyEscape,
  dyExchange,
  dyFind,
  dyGroup,
  dyLeft,
  dyNew,
  dyOpen,
  dyPaste,
  dyPreview,
  dyPrint,
  dyRedo,
  dyReturn,
  dyRight,
  dySave,
  dySelectAll,
  dyTab,
  dyUndo,
  dyUnGroup,
  dyUp,
} from "@/api/dyform-short-key-operation";

/**
 * 复制
 * @param model 模块
 */
const copyFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyCopy();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const cutFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyCut();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const pasteFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyPaste();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const enterFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyEnter();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const tabFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyTab();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const escapeFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyEscape();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const backspaceFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyBackspace();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};

const redoFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyRedo();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const undoFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyUndo();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const newFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyNew();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const saveFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dySave();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const openFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyOpen();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const deleteFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyDelete();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const selectAllFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dySelectAll();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const deleteAllFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyDeleteAll();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const findFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyFind();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const exchangeFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyExchange();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const groupFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyGroup();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const unGroupFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyUnGroup();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const printFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyPrint();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const previewFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyPreview();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const returnFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyReturn();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const upFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyUp();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const downFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyDown();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const leftFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyLeft();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const rightFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyRight();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const altUpFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyAltUp();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const altDownFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyAltDown();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const altLeftFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyAltLeft();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const altRightFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyAltRight();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const ctrlUpFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyCtrlUp();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const ctrlDownFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyCtrlDown();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const ctrlLeftFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyCtrlLeft();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
const ctrlRightFun = (model: ModuleEnums) => {
  switch (model) {
    case ModuleEnums.DYNAMIC_FORM:
      dyCtrlRight();
      break;
    case ModuleEnums.DYNAMIC_PAGE:
      break;
  }
};
export {
  copyFun,
  cutFun,
  pasteFun,
  enterFun,
  escapeFun,
  backspaceFun,
  tabFun,
  redoFun,
  undoFun,
  newFun,
  saveFun,
  openFun,
  deleteFun,
  selectAllFun,
  deleteAllFun,
  findFun,
  exchangeFun,
  groupFun,
  unGroupFun,
  printFun,
  previewFun,
  returnFun,
  upFun,
  downFun,
  leftFun,
  rightFun,
  altUpFun,
  altDownFun,
  altLeftFun,
  altRightFun,
  ctrlUpFun,
  ctrlDownFun,
  ctrlLeftFun,
  ctrlRightFun,
};
