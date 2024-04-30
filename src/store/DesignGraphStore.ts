import {defineStore} from "pinia";
import {Graph, Cell} from "@antv/x6";
import {warning} from "@/utils/message";
import {Transform} from '@antv/x6-plugin-transform';
import {Snapline} from '@antv/x6-plugin-snapline';
import {Keyboard} from '@antv/x6-plugin-keyboard';
import {Clipboard} from '@antv/x6-plugin-clipboard';
import {History} from '@antv/x6-plugin-history';
import {Selection} from '@antv/x6-plugin-selection';

export const DesignGraph: any = defineStore("DesignGraph", {
    state: () => {
        return {
            added: false as Boolean,
            graph: null as Graph | null,
            cell: null as Cell | null,
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
         * 设置线条颜色
         * @param color
         */
        setLineColor(color: string = "#A2B1C3") {
            let _this = this;
            _this.cell?.attr('line/stroke', color);
        },
        /**
         * 设置标签名称
         * @param name
         * @param color
         */
        setLabel(name: string, color: string = "#A2B1C3") {
            let _this = this;
            console.log(_this.cell);
            if (_this.cell!.isNode()) {
                _this.cell!.attr("label/text", name);
            } else {
                _this.cell!.removeLabelAt(0);
                _this.cell!.insertLabel("OK", 0);
                let label = _this.cell!.getLabelAt(0);
                label['attrs']['label'] = {
                    fill: color,
                    text: name
                }
            }

        },
        /**
         * 存视图
         * @param graph
         */
        setGraph(graph: Graph) {
            let _this = this;
            _this.graph = graph;
            //缩放大小，或者旋转
            graph.use(
                new Transform({
                    resizing: true,
                    rotating: true,
                }),
            );
            graph.use(new Selection({
                    rubberband: true,
                    showNodeSelectionBox: true,
                }),
            );
            graph.use(new Snapline())
                .use(new Keyboard())
                .use(new Clipboard())
                .use(new History());
            graph.use(
                new Selection({
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
        getAllNodes() {
            let _this = this;
            let graph = _this.graph;
            let datas: Array<any> = [];
            if (!graph) {
                warning("设计器未初始化");
                return datas;
            }
            let nodes = graph.getNodes();
            for (let index in nodes) {
                let node = nodes[index];
                datas.push(...node.getData());
            }
            return datas;
        },
        /**
         * 获取画布里的所有节点数据作为JSon 导出
         */
        getGraphData(): string {
            let _this = this;
            return JSON.stringify(_this.graph!.toJson());
        },
        /**
         * 将数据渲染到画布上
         * @param json
         */
        renderFromJson(json: string, slient: boolean = false) {
            let _this = this;
            if (!json) {
                console.log("json 数据为空");
            }
            _this.graph!.fromJSON(JSON.parse(json), {slient});
        },
        /**

         /**
         * 清除所有Tab
         */
        clearAll() {
            let _this = this;
            _this.graph = null;
            _this.cell = null;
        },
    },
    persist: {
        enabled: false, // 开启数据缓存
    }
});