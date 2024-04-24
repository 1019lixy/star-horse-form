<script setup lang="ts" name="StarHorseDesign">
import {nextTick, onMounted, PropType, ref} from "vue";
import {Cell, Graph, Point, Shape} from "@antv/x6";
import {Transform} from '@antv/x6-plugin-transform'
import {Selection} from '@antv/x6-plugin-selection'
import {Snapline} from '@antv/x6-plugin-snapline'
import {Keyboard} from '@antv/x6-plugin-keyboard'
import {Clipboard} from '@antv/x6-plugin-clipboard'
import {History} from '@antv/x6-plugin-history'
import {confirm, warning} from "@/utils/message.ts";
import StarHorseDialog from "@/components/comp/StarHorseDialog.vue";
import StarHorseEditor from "@/components/comp/StarHorseEditor.vue";
import {CustomerItem} from "@/components/types/CompInfo.d.ts";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {commands,ports} from "@/utils/sh_design.ts.js";
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
  editable: {type: Boolean, default: true},
  //table,normal,其他待定
  compType: {type: String, default: "normal"},
  customerItems: {type: Array as PropType<CustomerItem[]>, default: []}
});
const emits = defineEmits(["lineClick", "nodeClick", "save", "validation", "preview"]);

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
      confirm("清空画布，所有的数据都会丢失，确定要清空吗？").then(res => {
        if (res) {
          nodeList.value = [];
          graph.value.resetCells([]);
        }
      });
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
const hasItemFlag = ref(false);
const hasItems = () => {
  return hasItemFlag.value = nodeList.value.length > 0;
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
        deleteNode(cells);
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
  // if (props.registerNode) {
  //   registerPort(props.registerNode.portName);
  //   registerNode(props.registerNode.name, props.registerNode.entity, props.registerNode.force);
  // }
  registerPort(props.registerNode.portName);
  await nextTick();
  graph.value = new Graph({
    autoResize: true,
    container: starHorseDesignRef.value,
    rotating: true,
    selecting: {
      enabled: true,
      rubberband: true,
      showNodeSelectionBox: true,
    },
    snapline: true,
    keyboard: true,
    clipboard: true,
    highlighting: {
      // 当连接桩可以被链接时，在连接桩外围渲染一个 2px 宽的红色矩形框
      magnetAdsorbed: {
        name: 'stroke',
        args: {
          attrs: {
            fill: '#5F95FF',
            stroke: '#5F95FF',
          },
        },
      },
    },
    connecting: {
      router: {
        name: 'manhattan',
        args: {
          padding: 1,
        },
      },
      connector: {
        name: 'rounded',
        args: {
          radius: 8,
        },
      },
      anchor: 'center',
      connectionPoint: 'anchor',
      allowBlank: false,
      snap: {
        radius: 20,
      },
      createEdge() {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: '#A2B1C3',
              strokeWidth: 2,
              targetMarker: {
                name: 'block',
                width: 12,
                height: 8,
              },
            },
          },
          zIndex: 0,
        })
      },
      validateConnection({targetMagnet}) {
        return !!targetMagnet
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
    mousewheel: {
      enabled: true,
      zoomAtMousePosition: true,
      modifiers: 'ctrl',
      maxScale: 4,
      minScale: 0.2,
    },
  });
  if (props.compType != "table") {
    //缩放大小，或者旋转
    graph.value.use(
        new Transform({
          resizing: true,
          rotating: true,
        }),
    );
  }

  graph.value.use(new Selection({
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
      const cells = graph.value.paste({offset: 32});
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
      deleteNode(cells);

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
    // if (props.tableFlag) {
    //   return;
    // }
    for (let i = 0, len = ports.length; i < len; i += 1) {
      ports[i].style.visibility = show ? 'visible' : 'hidden'
    }
  }
  graph.value.on('node:mouseenter', () => {
    const ports = starHorseDesignRef.value.querySelectorAll(
        '.x6-port-body',
    ) as NodeListOf<SVGElement>;
    console.log(ports);
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
/**
 * 删除指定节点
 * @param cells
 */
const deleteNode = (cells: Array<any>) => {
  for (let cindex in cells) {
    let cell = cells[cindex];
    for (let index in nodeList.value) {
      let temp = nodeList.value[index];
      if (temp.id == cell.id) {
        nodeList.value.splice(Number(index), 1);
      }
    }
  }
}
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
  Graph.registerNode(
      'custom-rect',
      {
        inherit: 'rect',
        width: 100,
        height: 40,
        attrs: {
          body: {
            strokeWidth: 1,
            stroke: '#5F95FF',
            fill: '#EFF4FF',
          },
          text: {
            fontSize: 12,
            fill: '#262626',
          },
        },
        ports: { ...ports },
      },
      true,
  );
  // Graph.registerPortLayout(
  //     portName,
  //     (portsPositionArgs) => {
  //       return portsPositionArgs.map((_, index) => {
  //         return {
  //           position: {
  //             x: 0,
  //             y: (index + 1) * props.lineHeight,
  //           },
  //           angle: 0,
  //         }
  //       })
  //     },
  //     true,
  // );
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
const dratStart = (item: any, evt: DragEvent) => {
      let dt = evt.dataTransfer!;
      dt.effectAllowed = "copy";
      dt.setData("text/plain", JSON.stringify(item));
    }
;
const dragDrop = (evt: DragEvent) => {
  let dt = evt.dataTransfer!;
  let data = JSON.parse(dt.getData("text/plain"));
  let fdata = nodeList.value.filter((item: any) => item.store.data["name"] == data["name"]);
  if (fdata?.length >= 3) {
    warning("相同的表最多能添加三次");
    return;
  }
  let point = graph.value.pageToLocal(evt.pageX, evt.pageY);
  if (data["items"]) {
    createTableNode(data, point);
  } else {
    //创建普通节点
    createNormalNode(data, point);
  }

};
const createNormalNode = (data: any, position: Point) => {
  let datat = {
    "shape": "custom-rect",
    "label": data["label"],
    "name": data["name"],
    position: {
      x: position.x,
      y: position.y
    },
  };
  addNode(datat);
}
const createTableNode = (data: any, position: Point, tableWidth: Number = 320) => {
  let ports = [];
  let items = data["items"];
  for (let index in items) {
    let temp = items[index];
    let field = {
      group: "list",
      "attrs": {}
    };
    for (let key in temp) {
      field["attrs"][key] = {"text": temp[key]};
    }
    ports.push(field);
  }
  let datat = {
    "shape": "er-rect",
    "label": `${data["label"]}:${data["name"]} `,
    "name": data["name"],
    "width": tableWidth,
    position: {
      x: position.x,
      y: position.y
    },
    "height": 24,
    "ports": ports
  };
  addNode(datat);
};
const dragOver = (evt: DragEvent) => {
  evt.preventDefault();
}
onMounted(() => {
  init();
});
defineExpose({
  graph, registerPort, registerNode, addNode, nodeList, getEdgeInfo, edgeList
})
</script>

<template>
  <star-horse-dialog :dialogVisible="dataPreviewVisible" :title="'JSON'"
                     @closeAction="closeAction"
                     :isBatch="false" :isView="true">
    <star-horse-editor :lang="'json'" v-model:value="jsonData"/>
  </star-horse-dialog>
  <el-row style="height: 100%;">
    <el-col :span="3" style="height: inherit">
      <el-collapse accordion>
        <template v-for="item in customerItems">
          <el-collapse-item :name="item.name" :title="item.title">
            <el-scrollbar>
              <ul>
                <li
                    draggable="true"
                    @dragstart="evt=>dratStart(sitem,evt)"
                    class="field-item"
                    v-for="sitem in item.compItems"
                >&nbsp;&nbsp;<span>&nbsp;&nbsp;<star-horse-icon icon-class="default"/>&nbsp;{{ sitem.label }}</span>
                </li>
              </ul>
            </el-scrollbar>
          </el-collapse-item>
        </template>
      </el-collapse>
    </el-col>
    <el-col :span="21">
      <div class="inner_button">
        <el-menu mode="horizontal" style="height: inherit;width: 100%;">
          <template v-for="item in commands">
            <el-menu-item v-if="hasItems()||item.defaultEdit">
              <el-tooltip class="item" :content="item.label"
                          effect="dark"
                          placement="bottom">
                <star-horse-icon @click="transform(item.key)" :icon-class="item.icon" size="24px" color="#303133"/>
              </el-tooltip>
            </el-menu-item>
          </template>
        </el-menu>
      </div>
      <div class="backgournd-grid-app">
        <div id="graph-dropdown" @dragover.prevent="dragOver" @drop="dragDrop" class="app-content" ref=
            "starHorseDesignRef"></div>
        <el-dropdown ref="contextmenuRef" v-if="contextMenuVisible" @visibleChange="visibleChange" trigger=
            "contextmenu"
                     :style=
                         "{'z-index': 99999999,
          'position': 'absolute',
          'top':menuPosition.top,
          'left':menuPosition.left
          }">
          <span class="el-dropdown-link"> 右键菜单</span>
          <template #dropdown>
            <el-dropdown-menu @click="contextMenuOperation">
              <el-dropdown-item command="cut" divided>剪切</el-dropdown-item>
              <el-dropdown-item command="copy" divided>复制</el-dropdown-item>
              <el-dropdown-item command="paste" divided>粘贴</el-dropdown-item>
              <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
              <el-dropdown-item command="clear" divided>清空</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-col>
  </el-row>

</template>

<style scoped lang="scss">
ul {
  padding-left: 10px; /* 重置IE11默认样式 */
  margin: 0; /* 重置IE11默认样式 */
  margin-block-start: 0;
  margin-block-end: 0.25em;
  padding-inline-start: 10px;

  &:after {
    content: '';
    display: block;
    clear: both;
  }

  .field-item {
    display: inline-block;
    height: 28px;
    line-height: 28px;
    width: 100%;
    margin: 2px 6px 6px 0;
    cursor: move;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    background: #f1f2f3;
  }

  .field-item:hover {
    background: #ebeef5;
    outline: 1px solid #999999;
  }

  .drag-handler {
    position: absolute;
    top: 0;
    left: 160px;
    background-color: #dddddd;
    border-radius: 5px;
    padding-right: 5px;
    font-size: 11px;
    color: #666666;
  }
}

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