<script setup lang = "ts" name = "StarHorseDesign">
import {nextTick, onMounted, ref} from "vue";
import {Cell, Graph, Shape} from "@antv/x6";
import {Transform} from '@antv/x6-plugin-transform'
import {Selection} from '@antv/x6-plugin-selection'
import {Snapline} from '@antv/x6-plugin-snapline'
import {Keyboard} from '@antv/x6-plugin-keyboard'
import {Clipboard} from '@antv/x6-plugin-clipboard'
import {History} from '@antv/x6-plugin-history'
import {warning, confirm} from "@/utils/message.ts";
import StarHorseDialog from "@/components/comp/StarHorseDialog.vue";
import DataPreview from "@/views/dyform/DataPreview.vue";
import StarHorseEditor from "@/components/comp/StarHorseEditor.vue";
import {Stencil} from "@antv/x6-plugin-stencil";

const starHorseDesignRef = ref();
const graph = ref();
const contextmenuRef = ref();
const connectorStyle = ref<String>("normal");
const menuPosition = ref({
  top: "0px",
  left: "0px"
});
const props = defineProps({
  registerNode: {type: Object, default: null},
  lineHeight: {type: Number, default: 24},
  tableWidth: {type: Number, default: 320},
  tableFlag: {type: Boolean, default: false},
  editable: {type: Boolean, default: true}
});
const emits = defineEmits(["lineClick", "nodeClick", "save", "validation", "preview"]);
const commands = [
  {
    icon: "zoom_in",
    key: 'zoomIn',
    label: '放大(0.2)',
  },
  {
    icon: "zoom_out",
    key: 'zoomOut',
    label: '缩小(-0.2)',
  },
  {
    icon: "auto_fit",
    key: 'zoomToFit',
    label: '自适应',
  },
  {
    icon: "equal",
    key: 'zoomTo',
    label: '1:1大小',
  },
  {
    icon: "line_arrow",
    key: 'lineMode',
    label: '直线连接模式',
  },
  {
    icon: "vertical_arrow",
    key: 'verticalMode',
    label: '直角连接模式',
  },
  {
    icon: "align_top",
    key: 'alignTop',
    label: '向上对齐',
  },
  {
    icon: "align_bottom",
    key: 'alignBottom',
    label: '向下对齐',
  },
  {
    icon: "align_left",
    key: 'alignLeft',
    label: '向左对齐',
  },
  {
    icon: "align_right",
    key: 'alignRight',
    label: '向右对齐',
  },
  {
    icon: "center",
    key: 'centerContent',
    label: '居中',
  },
  {
    icon: "dustbin",
    key: 'deleteItem',
    label: '删除元素',
  },
  {
    icon: "empty_setting",
    key: 'empty',
    label: '清空画布',
  },
  {
    icon: "undo",
    key: 'unDo',
    label: '后退一步',
  },
  {
    icon: "redo",
    key: 'reDo',
    label: '前进一步',
  },
  {
    icon: "json_file",
    key: 'json',
    label: 'JSON数据',
  },
  {
    icon: "valid",
    key: 'valid',
    label: '校验',
  },
  {
    icon: "preview",
    key: 'preview',
    label: '预览',
  },
  {
    icon: "save",
    key: 'save',
    label: '保存',
  },

];
const jsonData = ref<String>();
const dataPreviewVisible = ref<Boolean>(false);
let list = ref<Array<any>>([]);
const transform = (command: string) => {
  switch (command) {
    case 'translate':
      graph.value.translate(20, 20)
      break
    case 'zoomIn':
      graph.value.zoom(0.2)
      break
    case 'zoomOut':
      graph.value.zoom(-0.2)
      break
    case 'zoomTo':
      graph.value.zoomTo(1)
      break
    case 'zoomToFit':
      graph.value.zoomToFit()
      break
    case 'centerContent':
      graph.value.centerContent()
      break
    case 'reDo':
      graph.value.redo();
      break;
    case 'unDo':
      graph.value.undo();
      break;
    case 'lineMode':
      connectorStyle.value = "normal";
      break;
    case 'verticalMode':
      connectorStyle.value = "rounded";
      break;
    case 'empty':
      graph.value.clearCells();
      break;
    case 'valid':
      dataValid();
      break;
    case 'json':
      //显示JSON数据
      jsonData.value = JSON.stringify(graph.value.toJSON(), null, 4);
      dataPreviewVisible.value = true;
      break;
    default:
      alignOperation(command);
      break
  }
};
const closeAction = () => {
  dataPreviewVisible.value = false;
};
const dataValid = () => {

};
const alignOperation = (align: string) => {
  let cells = graph.value.getSelectedCells();
  console.log("cells", cells);
  if (align == "deleteItem") {
    if (!cells || cells.length == 0) {
      warning("请先选择要删除的对象");
      return;
    }
    confirm("确定要删除所选的元素吗？").then(res => {
      if (res) {
        graph.value.removeCells(cells);
      }
    });
    return;
  }
  if (!cells || cells.length == 0) {
    cells = graph.value.getNodes();
  }
  if (cells?.length == 0) {
    // warning("画布内没有任何组件");
    return;
  }
  for (let index in cells) {
    let cell = cells[index];
    console.log(cell.position());
  }
  if (align == "alignTop") {
    let pos = cells.map(item => item.position().y);
    let min = Math.min(...pos);
    for (let index in cells) {
      let cell = cells[index];
      cell.setPosition(cell.position().x, min);
    }
  }

  if (align == "alignBottom") {
    let pos = cells.map(item => item.position().y);
    let max = Math.max(...pos);
    for (let index in cells) {
      let cell = cells[index];
      cell.setPosition(cell.position().x, max);
    }
  }
  if (align == "alignLeft") {
    let pos = cells.map(item => item.position().x);
    let min = Math.min(...pos);
    for (let index in cells) {
      let cell = cells[index];
      cell.setPosition(min, cell.position().y);
    }
  }
  if (align == "alignRight") {
    let pos = cells.map(item => item.position().x);
    let max = Math.max(...pos);
    for (let index in cells) {
      let cell = cells[index];
      cell.setPosition(max, cell.position().y);
    }
  }
}
const contextMenuVisible = ref<Boolean>(false);
const visibleChange = (flag: boolean) => {
  if (!flag) {
    contextMenuVisible.value = false;
  }
};
let nodeList = ref<Array<Cell>>([]);
const init = async () => {
  if (props.registerNode) {
    registerPort(props.registerNode.portName);
    registerNode(props.registerNode.name, props.registerNode.entity, props.registerNode.force);
  }
  await nextTick();
  graph.value = new Graph({
    autoResize: true,
    container: starHorseDesignRef.value,
    background: {
      color: '#F2F7FA',
    },
    scroller: {
      enabled: true,
    },
    // minimap: {
    //   enabled: true,
    //   container: minimapContainer,
    // },
    highlighting: {
      // 当连接桩可以被链接时，在连接桩外围渲染一个 2px 宽的红色矩形框
      magnetAvailable: {
        name: 'stroke',
        args: {
          padding: 4,
          attrs: {
            'stroke-width': 2,
            stroke: 'red',
          },
        },
      },
    },
    connecting: {
      allowMulti: true,
      connector: connectorStyle.value,
      router: {
        name: 'er',
        args: {
          offset: 25,
          direction: 'H',
        },
      },
      createEdge() {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: '#A2B1C3',
              strokeWidth: 2,
            },
          },
        })
      },
    },
    grid: {
      visible: true,
      type: 'doubleMesh',
      args: [
        {
          color: '#eee', // 主网格线颜色
          thickness: 1, // 主网格线宽度
        },
        {
          color: '#ddd', // 次网格线颜色
          thickness: 1, // 次网格线宽度
          factor: 4, // 主次网格线间隔
        },
      ],
    },
    // panning: true,
    mousewheel: {
      enabled: true,
      modifiers: 'Ctrl',
      maxScale: 4,
      minScale: 0.2,
    },
  });
  graph.value.use(
      new Transform({
        resizing: true,
        rotating: true,
      }),
  ).use(new Selection({
        rubberband: true,
        showNodeSelectionBox: true,
      }),
  ).use(new Snapline())
      .use(new Keyboard())
      .use(new Clipboard())
      .use(new History());
  // #region 快捷键与事件
  graph.value.bindKey(['meta+c', 'ctrl+c'], () => {
    const cells = graph.value.getSelectedCells()
    if (cells.length) {
      graph.value.copy(cells)
    }
    return false
  })
  graph.value.bindKey(['meta+x', 'ctrl+x'], () => {
    const cells = graph.value.getSelectedCells()
    if (cells.length) {
      graph.value.cut(cells)
    }
    return false
  })
  graph.value.bindKey(['meta+v', 'ctrl+v'], () => {
    if (!graph.value.isClipboardEmpty()) {
      const cells = graph.value.paste({offset: 32})
      graph.value.cleanSelection()
      graph.value.select(cells)
    }
    return false
  })

// undo redo
  graph.value.bindKey(['meta+z', 'ctrl+z'], () => {
    if (graph.value.canUndo()) {
      graph.value.undo()
    }
    return false
  })
  graph.value.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
    if (graph.value.canRedo()) {
      graph.value.redo()
    }
    return false
  })

// select all
  graph.value.bindKey(['meta+a', 'ctrl+a'], () => {
    const nodes = graph.value.getNodes()
    if (nodes) {
      graph.value.select(nodes)
    }
  })

// delete
  graph.value.bindKey(['backspace', 'delete'], () => {
    const cells = graph.value.getSelectedCells()
    if (cells.length) {
      for (let cindex in cells) {
        let cell = cells[cindex];
        for (let index in nodeList.value) {
          let temp = nodeList.value[index];
          if (temp.id == cell.id) {
            nodeList.value.splice(index, 1);
          }
        }
      }
      graph.value.removeCells(cells)
    }
  })

// zoom
  graph.value.bindKey(['ctrl+1', 'meta+1'], () => {
    const zoom = graph.value.zoom()
    if (zoom < 1.5) {
      graph.value.zoom(0.1)
    }
  })
  graph.value.bindKey(['ctrl+2', 'meta+2'], () => {
    const zoom = graph.value.zoom()
    if (zoom > 0.5) {
      graph.value.zoom(-0.1)
    }
  })

// 控制连接桩显示/隐藏
  const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
    if (props.tableFlag) {
      return;
    }
    for (let i = 0, len = ports.length; i < len; i += 1) {
      ports[i].style.visibility = show ? 'visible' : 'hidden'
    }
  }
  graph.value.on('node:mouseenter', () => {
    const ports = starHorseDesignRef.value.querySelectorAll(
        '.x6-port-body',
    ) as NodeListOf<SVGElement>
    showPorts(ports, true)
  });
  graph.value.on('node:mouseleave', () => {
    const ports = starHorseDesignRef.value.querySelectorAll(
        '.x6-port-body',
    ) as NodeListOf<SVGElement>
    showPorts(ports, false)
  })
// #endregion

  graph.value.use(
      new Selection({
        enabled: true,
        multiple: true,
        rubberband: true,
        movable: true,
        showNodeSelectionBox: true,
      }),
  );
  //节点右键菜单
  graph.value.on("node:contextmenu", ({e, x, y, cell, view}) => {
    contextMenu(e, x, y, cell, view);
  });
  //连线右键菜单
  graph.value.on("edge:contextmenu", ({e, x, y, cell, view}) => {
    contextMenu(e, x, y, cell, view);
  });
  //点击节点
  graph.value.on('node:click', ({e, x, y, edge, view}) => {
    console.log(e, x, y, edge, view.cell);
    emits("nodeClick", view.cell);
  });
  //点击连线
  graph.value.on('edge:dblclick', ({e, x, y, edge, view}) => {
    console.log(e, x, y, edge, view.cell);
    emits("lineClick", getEdgeInfo(view.cell));
  });

};
let currentView = ref(null);
const contextMenuOperation = (type: any) => {
  console.log(type);
};
const contextMenu = (e, x, y, cell, view) => {
  const menuWidth = 280;
  currentView.value = view;
  const windowWidth = window.innerWidth;
  const maxLeft = windowWidth - menuWidth; // 弹窗最大允许的 left 值
  contextMenuVisible.value = true;
  let left = e.clientX;
  if (left > maxLeft) {
    left = maxLeft;
  }
  menuPosition.value = {
    top: `${e.clientY - 80}px`,
    left: `${left - 200}px`
  };
  nextTick(() => {
    contextmenuRef.value.handleOpen();
  });
};
/**
 * 添加节点
 * @param data
 */
const addNode = (data: any) => {
  if (!data) {
    return;
  }
  let cell = graph.value.createNode(data);
  nodeList.value.push(cell);
  graph.value.resetCells(nodeList.value);
  // graph.value.zoomToFit({padding: 10, maxScale: 1});
  // transform("centerContent");
  return cell;
};
const stencilCompRef = ref();
const createStencil = (groupNames: Array<any>, datas: Object, shape: String, options: Object = {
  columns: 1, columnWidth: 100, rowHeight: 55
}) => {
  if (!groupNames || groupNames.length == 0) {
    groupNames = [{
      name: "group1"
    }];
  }

  // #region 初始化 stencil
  const stencil = new Stencil({
    title: '组件列表',
    target: graph.value,
    stencilGraphWidth: 200,
    stencilGraphHeight: 180,
    collapsable: true,
    search: true,
    groups: groupNames,
    layoutOptions: options,
  });
  let dataArr = [];
  for (let key in datas) {
    let temp = datas[key];
    let node = graph.value.createNode({
      shape: shape,
      label: temp.comment,
      key: temp.key,
      configId: temp.datasourceConfigId
    });
    dataArr.push(node);
  }
  stencilCompRef.value!.appendChild(stencil.container);
  stencil.load(dataArr, "group1");
};
/**
 * 注册节点
 * @param name
 * @param entry
 */
const registerNode = (name: string, entry: any, force: boolean = false) => {
  Graph.registerNode(name, entry, force);
};
/**
 * 注册装
 */
const registerPort = (portName: string = "portPosition") => {
  Graph.registerPortLayout(
      portName,
      (portsPositionArgs) => {
        return portsPositionArgs.map((_, index) => {
          return {
            position: {
              x: 0,
              y: (index + 1) * props.lineHeight,
            },
            angle: 0,
          }
        })
      },
      true,
  );
};
/**
 * 获取
 * @param cell
 */
const getEdgeInfo = (cell: any) => {
  if (!cell) {
    return;
  }
  let sourceNode = cell.getSourceNode();
  let sourceInfo = sourceNode.store.data;
  let sourcePort = sourceNode.getPort(cell.store.data.source.port);
  let targetNode = cell.getTargetNode();
  let targetInfo = targetNode.store.data;
  if (!targetInfo) {
    console.log("连线没有目标节点")
    return;
  }
  let targetPort = targetNode.getPort(cell.store.data.target.port);
  if (!targetPort) {
    console.log("连线没有目标属性")
    return;
  }
  let from = sourceInfo.name || sourceInfo.id;
  let fromPort = sourcePort.attrs['name'].text || sourcePort.id;
  let to = targetInfo.name || sourceInfo.id;
  let toPort = targetPort.attrs['name'].text || targetPort.id;
  return {from, fromPort, to, toPort};
}
/**
 * 获取所有连线的数据
 */
const edgeList = () => {
  let edgeList = graph.value.getEdges();
  let dataList: any = [];
  if (edgeList && edgeList.length > 0) {
    edgeList.forEach((item: any) => {
      dataList.push(getEdgeInfo(item));
    })
  }
  return dataList;
}
const dragDrop = (evt) => {
  console.log("over",evt);
};
const dragEnd = (evt) => {
  console.log("end", evt);
}
onMounted(() => {
  init();
});

defineExpose({
  graph, registerPort, registerNode, addNode, nodeList, getEdgeInfo, edgeList, createStencil
})
</script>

<template>
  <star-horse-dialog :dialogVisible = "dataPreviewVisible" :title = "'JSON'"
                     @closeAction = "closeAction"
                     :isBatch = "false" :isView = "true">

    <star-horse-editor :lang = "'json'" v-model:value = "jsonData"/>
  </star-horse-dialog>
  <!--  <el-container>
      <el-aside>
        <div ref = "stencilCompRef"/>
      </el-aside>
      <el-main>-->
  <div class = "inner_button">
    <el-menu mode = "horizontal" style = "height: inherit;width: 100%;">
      <el-menu-item v-for = "item in commands">
        <el-tooltip class = "item" :content = "item.label"
                    effect = "dark"
                    placement = "bottom">
          <star-horse-icon @click = "transform(item.key)" :icon-class = "item.icon" size = "24px"
                           color = "#303133"/>
        </el-tooltip>
      </el-menu-item>
    </el-menu>
  </div>
  <div className = "backgournd-grid-app">

    <div id = "graph-dropdown" @drop="dragEnd" @dragover = "dragDrop" className = "app-content" ref =
        "starHorseDesignRef"/>
    <el-dropdown ref = "contextmenuRef" v-if = "contextMenuVisible" @visibleChange = "visibleChange" trigger =
        "contextmenu"
                 :style =
                     "{'z-index': 99999999,
          'position': 'absolute',
          'top':menuPosition.top,
          'left':menuPosition.left
          }">
      <span class = "el-dropdown-link"> 右键菜单</span>
      <template #dropdown>
        <el-dropdown-menu @click = "contextMenuOperation">
          <el-dropdown-item command = "cut" divided>剪切</el-dropdown-item>
          <el-dropdown-item command = "copy" divided>复制</el-dropdown-item>
          <el-dropdown-item command = "paste" divided>粘贴</el-dropdown-item>
          <el-dropdown-item command = "delete" divided>删除</el-dropdown-item>
          <el-dropdown-item command = "clear" divided>清空</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>

  <!--    </el-main>
    </el-container>-->

</template>

<style scoped lang = "scss">
.inner_button {
  width: 99%;
  height: 48px;
  text-align: left;
  justify-content: flex-start;
  background-color: #fafafa;
  border: solid 1px #ccc;
  -moz-user-select: none;
  margin-left: 7px;
  -webkit-user-select: none;
  -ms-user-select: none;
  -khtml-user-select: none;
  user-select: none;
}

.backgournd-grid-app {
  display: flex;
  width: 100%;
  height: 100%;
  padding: 0;
  font-family: sans-serif;

  .app-content {
    flex: 1;
    height: 280px;
    margin-right: 8px;
    margin-left: 8px;
    border-radius: 5px;
    box-shadow: 0 12px 5px -10px rgb(0 0 0 / 10%), 0 0 4px 0 rgb(0 0 0 / 10%);
  }
}
</style>