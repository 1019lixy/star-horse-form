import {defineStore} from "pinia";
import {Cell, Graph,} from "@antv/x6";
import {warning} from "@/utils/message";
import {Transform} from '@antv/x6-plugin-transform';
import {Snapline} from '@antv/x6-plugin-snapline';
import {Keyboard} from '@antv/x6-plugin-keyboard';
import {Clipboard} from '@antv/x6-plugin-clipboard';
import {History} from '@antv/x6-plugin-history';
import {Selection} from '@antv/x6-plugin-selection';
import {EdgeInfo, NodeInfo} from "@/components/types/CompInfo";
import {ref, unref} from "vue";

export const DesignGraph: any = defineStore("DesignGraph", () => {
    const added = ref<boolean>(false);
    const graph = ref<Graph | null>(null);
    const cell = ref<Cell | null>(null);
    const dataIndex = ref<number>(0);
    const isView = ref<boolean>(false);

    /**
     * 设置已添加组件
     */
    // setAddFlag() {
    //     this.added = true;
    // },
    /**
     * 设置线条或者边框颜色
     * @param color
     * @param lineWidth
     */
    const setLineColor = (color: string = "#A2B1C3", lineWidth: number = 1) => {
        const tempCell = cell.value!;
        if (!tempCell) {
            return;
        }
        if (tempCell.isNode()) {
            tempCell.setAttrs({
                body: {stroke: color, strokeWidth: lineWidth},
            });
        } else {
            tempCell.attr('line/stroke', color);
        }
    }
    /**
     * 设置标签名称
     * @param name
     * @param color
     */
    const setLabel = (name: string, color: string = "#A2B1C3") => {
        const tempCell: any = graph.value!.getCellById(cell.value!.id);
        if (tempCell.isNode()) {
            tempCell.attr("label/text", name);
        } else {
            tempCell.setLabels([{
                attrs: {label: {text: name, fill: color}}
            }]);
        }
    }
    /**
     * 存视图
     * @param g
     * @param viewFlag
     */
    const setGraph = (g: Graph, viewFlag: boolean = false) => {

        graph.value = g;
        isView.value = viewFlag;
        //缩放大小，或者旋转
        graph.value.use(new Transform({
                resizing: true,
                rotating: true,
            }),
        );
        graph.value.use(new Snapline());
        if (!isView) {
            graph.value.use(new Keyboard());
            graph.value.use(new Clipboard());
            graph.value.use(new History());
        }
        graph.value.use(new Selection({
                enabled: true,
                multiple: true,
                rubberband: true,
                movable: true,
                showNodeSelectionBox: true,
            }),
        );
        // #region 快捷键与事件
        graph.value.bindKey(['meta+c', 'ctrl+c'], () => {
            const cells = graph.value!.getSelectedCells()
            if (cells.length) {
                graph.value!.copy(cells)
            }
            return false
        })
        graph.value.bindKey(['meta+x', 'ctrl+x'], () => {
            const cells = graph.value!.getSelectedCells()
            if (cells.length) {
                graph.value!.cut(cells)
            }
            return false
        })
        graph.value.bindKey(['meta+v', 'ctrl+v'], () => {
            if (!graph.value!.isClipboardEmpty()) {
                const cells = graph.value!.paste({offset: 32});
                graph.value!.cleanSelection()
                graph.value!.select(cells)
            }
            return false
        })
        // undo redo
        graph.value.bindKey(['meta+z', 'ctrl+z'], () => {
            if (graph.value!.canUndo()) {
                graph.value!.undo()
            }
            return false
        })
        graph.value.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
            if (graph.value!.canRedo()) {
                graph.value!.redo()
            }
            return false
        })
// select all
        graph.value.bindKey(['meta+a', 'ctrl+a'], () => {
            const nodes = graph.value!.getNodes()
            if (nodes) {
                graph.value!.select(nodes)
            }
        })
        // zoom
        graph.value.bindKey(['ctrl+1', 'meta+1'], () => {
            const zoom = graph.value!.zoom()
            if (zoom < 1.5) {
                graph.value!.zoom(0.1)
            }
        })
        graph.value.bindKey(['ctrl+2', 'meta+2'], () => {
            const zoom = graph.value!.zoom()
            if (zoom > 0.5) {
                graph.value!.zoom(-0.1)
            }
        });
    }
    /**
     * 存组件
     * @param data
     * @param isAdd
     */
    const setCell = (data: Cell, isAdd: boolean = false) => {
        cell.value = data;
        added.value = isAdd;
    }
    /**
     * 获取所有节点
     */
    const getAllCells = () => {

        const graphTemp = unref(graph);
        const nodeDatas: Array<any> = [];
        const edgeDatas: Array<any> = [];
        const datas: any = {};
        if (!graphTemp) {
            warning("设计器未初始化");
            return datas;
        }
        const nodes = graphTemp.getNodes();
        for (const index in nodes) {
            const node = nodes[index];
            const data = node.getData();
            data["instanceId"] = node.id;
            data["id"] = node.id;
            nodeDatas.push(data);
        }
        datas["nodes"] = nodeDatas;
        const edges = graphTemp.getEdges();
        for (const index in edges) {
            const edge: any = edges[index];
            const data = edge.getData();
            data["instanceId"] = edge.id;
            data["id"] = edge.id;
            data["sourceId"] = edge.getSource().cell;
            data["targetId"] = edge.getTarget().cell;
            edgeDatas.push(data);
        }
        datas["edges"] = edgeDatas;
        return datas;
    }
    /**
     * 获取画布里的所有节点数据作为JSon 导出
     */
    const getGraphData = (): string => {
        return JSON.stringify(graph.value!.toJSON());
    }
    /**
     * 将数据渲染到画布上
     * @param json
     */
    const renderFromJson = (json: string, slient: boolean = false) => {
        const graphTemp = unref(graph);
        if (!graphTemp) {
            console.error("画布还未初始化完成");
            return null;
        }
        if (!json) {
            console.log("json 数据为空");
        }
        graphTemp.fromJSON(JSON.parse(json), {slient});
    }
    /**
     * 添加节点
     * @param data
     */
    const addNode = (data: NodeInfo): Cell | null => {

        const graphTemp = unref(graph);
        if (!graphTemp) {
            console.error("画布还未初始化完成");
            return null;
        }
        const point = graphTemp.pageToLocal(data.posX || 0, data.posY || 0);
        const datat: any = {
            shape: data.shape,
            label: "\t\t" + data.label,
            name: data.name,
            compType: data.compType || "normal",
            data: {index: data.index, label: data.label},
            position: {
                x: point.x,
                y: point.y
            },
        };
        datat["data"] = {...datat["data"], ...(data.data || data)};
        if (data["id"]) {
            datat["id"] = data["id"];
        }
        const ports = [];
        const items = data.items;
        //处理表格逻辑
        if (items) {
            for (const index in items) {
                const temp = items[index];
                const field: any = {
                    group: "list",
                    "attrs": {}
                };
                for (const key in temp) {
                    field["attrs"][key] = {"text": temp[key]};
                }
                ports.push(field);
            }
            datat["label"] = `${data["label"]}:${data["name"]} `;
            datat["width"] = data.width || 320;
            datat["height"] = data.lineHeight || 24;
            datat["ports"] = ports;
        }
        const cell = graphTemp.createNode(datat);
        graphTemp.addNode(cell);
        cell.setAttrByPath('use', {"xlink:href": data.icon ? `#icon-${data.icon}` : "#icon-default"});
        return cell;
    }
    /**
     * 添加节点间的连线
     */
    const addEdge = (edge: EdgeInfo) => {
        const graphTemp = unref(graph);
        if (!graphTemp) {
            console.error("画布还未初始化完成");
            return null;
        }
        const sorceNode: any = graphTemp.getCellById(edge.sourceId);
        const targetNode: any = graphTemp.getCellById(edge.targetId);
        const sourcePorts = sorceNode.getPorts();
        const targetPorts = targetNode.getPorts();
        const sourceIndex = parseInt(sorceNode.getData().index);
        const targetIndex = parseInt(targetNode.getData().index);
        let group = {
            source: "bottom",
            target: "top"
        }
        if (sourceIndex > targetIndex) {
            group = {
                source: "right",
                target: "right"
            }
        }
        const sourcePoint = edge.sourcePoint || sourcePorts.find((item: any) => item.group == group.source)?.id;
        const targetPoint = edge.targetPoint || targetPorts.find((item: any) => item.group == group.target)?.id;
        const datat = {
            source: {cell: sorceNode, port: sourcePoint},
            target: {cell: targetNode, port: targetPoint}
        };
        const cell = graphTemp.createEdge(datat);
        if (edge.data) {
            cell.setData(edge.data);
        }
        graphTemp.addEdge(cell);
        cell.setLabels([{
            attrs: {label: {text: edge.label, fill: edge.color}}
        }]);
        return cell;
    }
    /**
     * 清除所有Tab
     */
    const clearAll = () => {
        graph.value = null;
        cell.value = null;
        isView.value = false;
        dataIndex.value = 0;
    }
    return {
        graph,
        cell,
        isView,
        dataIndex,
        setLineColor,
        setGraph,
        setCell,
        setLabel,
        getAllCells,
        getGraphData,
        renderFromJson,
        addNode,
        addEdge,
        clearAll,
    }
}, {
    persist: {
        enabled: false, // 开启数据缓存
    }
});
