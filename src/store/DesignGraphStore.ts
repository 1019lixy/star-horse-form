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

export const DesignGraph: any = defineStore("DesignGraph", {
    state: () => {
        return {
            added: false as Boolean,
            graph: null as Graph | null,
            cell: null as Cell | null,
            dataIndex: 0,
            isView: false
        }
    },
    getters: {
        /**
         * 获取图像
         * @param state
         */
        getGraph: (state: any) => {
            return state.graph;
        },
        /**
         * 获取组件
         * @param state
         */
        getCell: (state: any) => {
            return state.cell;
        },
        /**
         * 获取添加事件
         * @param state
         */
        getAdded: (state: any) => {
            return state.added;
        }

    },
    actions: {
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
        setLineColor(color: string = "#A2B1C3", lineWidth: number = 1) {
            let _this = this;
            let cell = _this.cell!;
            if (!cell) {
                return;
            }
            if (cell.isNode()) {
                cell.setAttrs({
                    body: {stroke: color, strokeWidth: lineWidth},
                });
            } else {
                cell.attr('line/stroke', color);
            }

        },
        /**
         * 设置标签名称
         * @param name
         * @param color
         */
        setLabel(name: string, color: string = "#A2B1C3") {
            let _this = this;
            let cell = _this.graph!.getCellById(_this.cell!.id);
            if (cell.isNode()) {
                cell.attr("label/text", name);
            } else {
                cell.setLabels([{
                    attrs: {label: {text: name, fill: color}}
                }]);
            }
        },
        /**
         * 存视图
         * @param graph
         */
        setGraph(graph: Graph, isView: boolean = false) {
            let _this = this;
            _this.graph = graph;
            _this.isView = isView;
            //缩放大小，或者旋转
            graph.use(new Transform({
                    resizing: true,
                    rotating: true,
                }),
            );
            graph.use(new Snapline());
            if (!isView) {
                graph.use(new Keyboard());
                graph.use(new Clipboard());
                graph.use(new History());
            }
            graph.use(new Selection({
                    enabled: true,
                    multiple: true,
                    rubberband: true,
                    movable: true,
                    showNodeSelectionBox: true,
                }),
            );

            // #region 快捷键与事件
            graph.bindKey(['meta+c', 'ctrl+c'], () => {
                let cells = graph.getSelectedCells()
                if (cells.length) {
                    graph.copy(cells)
                }
                return false
            })
            graph.bindKey(['meta+x', 'ctrl+x'], () => {
                const cells = graph.getSelectedCells()
                if (cells.length) {
                    graph.cut(cells)
                }
                return false
            })
            graph.bindKey(['meta+v', 'ctrl+v'], () => {
                if (!graph.isClipboardEmpty()) {
                    const cells = graph.paste({offset: 32});
                    graph.cleanSelection()
                    graph.select(cells)
                }
                return false
            })

            // undo redo
            graph.bindKey(['meta+z', 'ctrl+z'], () => {
                if (graph.canUndo()) {
                    graph.undo()
                }
                return false
            })
            graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
                if (graph.canRedo()) {
                    graph.redo()
                }
                return false
            })

// select all
            graph.bindKey(['meta+a', 'ctrl+a'], () => {
                const nodes = graph.getNodes()
                if (nodes) {
                    graph.select(nodes)
                }
            })
            // zoom
            graph.bindKey(['ctrl+1', 'meta+1'], () => {
                const zoom = graph.zoom()
                if (zoom < 1.5) {
                    graph.zoom(0.1)
                }
            })
            graph.bindKey(['ctrl+2', 'meta+2'], () => {
                const zoom = graph.zoom()
                if (zoom > 0.5) {
                    graph.zoom(-0.1)
                }
            });

        },
        /**
         * 存组件
         * @param data
         * @param isAdd
         */
        setCell(data: Cell, isAdd: Boolean = false) {
            let _this = this;
            _this.cell = data;
            _this.added = isAdd;
        },
        /**
         * 获取所有节点
         */
        getAllCells() {
            let _this = this;
            let graph = _this.graph;
            let nodeDatas: Array<any> = [];
            let edgeDatas: Array<any> = [];
            let datas: Object = {};
            if (!graph) {
                warning("设计器未初始化");
                return datas;
            }
            let nodes = graph.getNodes();
            for (let index in nodes) {
                let node = nodes[index];
                let data = node.getData();
                data["instanceId"] = node.id;
                data["id"] = node.id;
                nodeDatas.push(data);
            }
            datas["nodes"] = nodeDatas;
            let edges = graph.getEdges();
            for (let index in edges) {
                let edge = edges[index];
                let data = edge.getData();
                data["instanceId"] = edge.id;
                data["id"] = edge.id;
                data["sourceId"] = edge.getSource().cell;
                data["targetId"] = edge.getTarget().cell;
                edgeDatas.push(data);
            }
            datas["edges"] = edgeDatas;
            return datas;
        },
        /**
         * 获取画布里的所有节点数据作为JSon 导出
         */
        getGraphData(): string {
            let _this = this;
            return JSON.stringify(_this.graph!.toJSON());
        },
        /**
         * 将数据渲染到画布上
         * @param json
         */
        renderFromJson(json: string, slient: boolean = false) {
            let _this = this;
            let graph = _this.graph;
            if (!graph) {
                console.error("画布还未初始化完成");
                return null;
            }
            if (!json) {
                console.log("json 数据为空");
            }
            graph.fromJSON(JSON.parse(json), {slient});
        },
        /**
         * 添加节点
         * @param data
         */
        addNode(data: NodeInfo): Cell {
            // console.log(data);
            let _this = this;
            let graph = _this.graph;
            if (!graph) {
                console.error("画布还未初始化完成");
                return null;
            }
            let point = graph.pageToLocal(data.posX || 0, data.posY || 0);
            let datat = {
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
            let ports = [];
            let items = data.items;
            //处理表格逻辑
            if (items) {
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
                datat["label"] = `${data["label"]}:${data["name"]} `;
                datat["width"] = data.width || 320;
                datat["height"] = data.lineHeight || 24;
                datat["ports"] = ports;
            }
            let cell = graph.createNode(datat);
            graph.addNode(cell);
            cell.setAttrByPath('use', {"xlink:href": data.icon ? `#icon-${data.icon}` : "#icon-default"});
            return cell;
        },
        /**
         * 添加节点间的连线
         */
        addEdge(edge: EdgeInfo) {
            let _this = this;
            let graph = _this.graph;
            if (!graph) {
                console.error("画布还未初始化完成");
                return null;
            }
            let sorceNode = graph.getCellById(edge.sourceId);
            let targetNode = graph.getCellById(edge.targetId);
            let sourcePorts = sorceNode.getPorts();
            let targetPorts = targetNode.getPorts();
            let sourceIndex = parseInt(sorceNode.getData().index);
            let targetIndex = parseInt(targetNode.getData().index);
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
            let sourcePoint = edge.sourcePoint || sourcePorts.find((item: any) => item.group == group.source)?.id;
            let targetPoint = edge.targetPoint || targetPorts.find((item: any) => item.group == group.target)?.id;
            let datat = {
                source: {cell: sorceNode, port: sourcePoint},
                target: {cell: targetNode, port: targetPoint}
            };
            let cell = graph.createEdge(datat);
            if (edge.data) {
                cell.setData(edge.data);
            }
            graph.addEdge(cell);
            cell.setLabels([{
                attrs: {label: {text: edge.label, fill: edge.color}}
            }]);
            return cell;
        },
        /**
         * 清除所有Tab
         */
        clearAll() {
            let _this = this;
            _this.graph = null;
            _this.cell = null;
            _this.isView = false;
            _this.dataIndex = 0;
        },
    },
    persist: {
        enabled: false, // 开启数据缓存
    }
});
