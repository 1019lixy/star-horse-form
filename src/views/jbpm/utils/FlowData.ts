import BpmnModeler from "bpmn-js/lib/Modeler";
import {postRequest} from "@/api/star_horse.ts";
import {warning} from "@/utils/message.ts";
import {ref, unref, markRaw} from "vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {initTemplate} from "@/views/jbpm/utils/template.ts";
import {uuid} from "@/api/system.ts";

let bpmnModeler: any = null;
let scale = ref<number>(1);
let execution = ref<string>("exec1");
let executionLabel = ref<string>('模拟运行');
let canRedo = ref<boolean>(true);
const flowDesign = useFlowDesign(piniaInstance);

/**
 * 导出Bpmn文件
 */
const handleExportBpmn = async () => {
    const {xml} = await bpmnModeler.saveXML();
    let data: any = setEncoded('BPMN', xml);
    if (data.href && data.filename) {
        let a = document.createElement('a');
        a.download = data.filename; //指定下载的文件名
        a.href = data.href; //  URL对象
        a.click(); // 模拟点击
        URL.revokeObjectURL(a.href); // 释放URL 对象
    }
};
/**
 * 导出SVG文件
 */
const handleExportSvg = async () => {
    const {svg} = await bpmnModeler.saveSVG();
    let data: any = setEncoded('SVG', svg);
    if (data.href && data.filename) {
        let a = document.createElement('a');
        a.download = data.filename;
        a.href = data.href;
        a.click();
        URL.revokeObjectURL(a.href);
    }
};
const setEncoded = (type: String, data: any) => {
    const encodedData = encodeURIComponent(data);
    if (data) {
        if (type === 'XML') {
            return {
                filename: 'diagram.bpmn20.xml',
                href: "data:application/bpmn20-xml;charset=UTF-8," + encodedData,
                data: data
            }
        }
        if (type === 'BPMN') {
            return {
                filename: 'diagram.bpmn',
                href: "data:application/bpmn20-xml;charset=UTF-8," + encodedData,
                data: data
            }
        }
        if (type === 'SVG') {
            // initData.value.svg = data;
            return {
                filename: 'diagram.svg',
                href: "data:application/text/xml;charset=UTF-8," + encodedData,
                data: data
            }
        }
    }
};
/**
 *
 * @param type 2 垂直对齐 1 水平对齐
 */
const elementAlign = (type: any) => {
    // warning("功能开发中");
    // bpmnModeler.get("alignElements").trigger("bottom");
    //let modeling= bpmnModeler.get("modeling");
    //bpmnModeler.get("elements.align").trigger("bottom");
    // bpmnModeler.get("modeling").autoPlace();
    //alignElements.trigger(Elements, type);
    const AlignElements = bpmnModeler.get("alignElements");
    const Selection = bpmnModeler.get('selection');
    const Elements = Selection.get();
    /**
     * Executes the alignment of a selection of elements
     * 執行元素選擇的對齊
     *
     * @param  {Array} elements 一般爲節點元素
     * @param  {string} type 可用：left|right|center|top|bottom|middle
     */
    AlignElements.trigger(Elements, type);
};
/**
 * 初始化bpmnModel 对象
 * @param modeler
 */
const setBpmnModeler = (modeler: BpmnModeler) => {
    console.log(modeler);
    bpmnModeler = modeler;
}


const deploy = async () => {
    const result_xml = await bpmnModeler.saveXML();
    const result_svg = await bpmnModeler.saveSVG();
    const {xml} = result_xml;
    const {svg} = result_svg;
    postRequest("jbpm/deploy", {
        processKey: "test",
        processName: "test",
        resourceName: "test",
        xml: xml,
        svg: svg,
    }).then((data: any) => {
    }).catch((err) => {
        warning(err);
    });
};
const save = async () => {
    const result_xml = await bpmnModeler.saveXML();
    const result_svg = await bpmnModeler.saveSVG();
    let dataForm = flowDesign.flowFormInfo.value;
    const {xml} = result_xml;
    const {svg} = result_svg;
    dataForm["flowXml"] = xml;
    dataForm["flowSvg"] = svg;
    // ruleForm.validate((valid: boolean) => {
    //     if (!valid) {
    //         return;
    //     }
    //     if (type > 0) {
    //
    //     }
    // });
};


const undo = () => {
    bpmnModeler.get("commandStack").undo();
    canRedo.value = bpmnModeler.get("commandStack").canRedo();
};
const redo = () => {
    if (!unref(canRedo)) {
        return;
    }
    bpmnModeler.get("commandStack").redo();
    canRedo.value = bpmnModeler.get("commandStack").canRedo();
};
const zoom = (action: string) => {
    let context: any = {};
    if (action === 'zoomIn') {
        action = 'stepZoom';

        context = {
            value: 1
        };
    }

    if (action === 'zoomOut') {
        action = 'stepZoom';

        context = {
            value: -1
        };
    }

    if (action === 'resetZoom') {
        action = 'zoom';

        context = {
            value: 1
        };
    }

    if (action === 'zoomFit') {
        action = 'zoom';

        context = {
            value: 'fit-viewport'
        };
    }
    let actionEvent = bpmnModeler.get('editorActions');
    actionEvent.trigger(action, context);
    // scale.value = newScale;
};

let active = ref<boolean>(false);
/**
 * 模拟执行
 */
const exec = () => {
    console.log(bpmnModeler.get("toggleMode"));
    active.value = !active.value;
    bpmnModeler.get("toggleMode").toggleMode(active.value);
    const simulationSupport = bpmnModeler.get('simulationSupport');
// enable simulation
    if (active.value) {
        execution.value = "cancel";
        executionLabel.value = "停止模拟";
        simulationSupport.toggleSimulation(active);
        // 获取BPMN模拟器中的ElementRegistry对象
        const elementRegistry = bpmnModeler.get('elementRegistry');
// 获取所有的开始事件节点
        const startEvents = elementRegistry.filter((element: any) => {
            return element.type === 'bpmn:StartEvent';
        });
        simulationSupport.triggerElement(startEvents.id);
    } else {
        execution.value = "exec1";
        executionLabel.value = "模拟运行";
    }
}

// const elementsAlign = (align: string) => {
//     if (!bpmnModeler) return;
//     const Align = bpmnModeler.get('alignElements');
//     const Selection = bpmnModeler.get('selection');
//     const SelectedElements = Selection.get();
//     if (!SelectedElements || SelectedElements.length <= 1) {
//         warning('请按住 Ctrl 键选择多个元素对齐');
//         return;
//     }
//     Align.trigger(SelectedElements, align);
//
// };
/**
 * 新建文件
 */
const newFile = async () => {
    let eventBus = bpmnModeler.get('eventBus');
    console.log(bpmnModeler, eventBus);
    // let define = bpmnModeler.getDefinitions();
    bpmnModeler.clear();
    // bpmnModeler.init(define);
    // bpmnModeler.get('eventBus').fire('diagram.clear');
    // bpmnModeler.get('eventBus').fire('diagram.init');
    // 新建一个空白BPMN图表
    // let newDiagram = await bpmnModeler.createDiagram();
    // 渲染图表
    await bpmnModeler.importXML(initTemplate("新流程", uuid()));
    changeLocation();
}
const changeLocation = () => {
    const canvas = bpmnModeler.get("canvas");
    canvas.zoom("fit-viewport", true);
}
const importLocalFile = async () => {
// 创建一个隐藏的文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = ".xml,.bpmn,.jbpm";
    fileInput.style.display = 'none';
// 添加到文档中
    document.body.appendChild(fileInput);
// 监听文件选择事件
    fileInput.addEventListener('change', (event) => {
        const files = event.target.files; // 获取选中的文件列表
        console.log(files); // 输出文件信息到控制台
        const reader = new FileReader();
        reader.readAsText(files[0]);
        reader.onload = async () => {
            const xmlStr = reader.result as string;
            if (bpmnModeler) {
                let {warnings} = await bpmnModeler.importXML(xmlStr);
                if (warnings && warnings.length) {
                    warnings.forEach((warn: any) => console.warn(warn));
                }
                changeLocation();
            }
        };
        // 清除文件输入，以便再次选择
        fileInput.value = '';
    });
// 触发文件选择
    fileInput.click();
}


/**
 * 设置BPMN的连接线
 * @param nodeConfig
 */
const setBpmnConnect = (nodeConfig: any) => {
    console.log('>>>>>>>>>>>>> 设置BPMN的连接线 Begin');
    if (!nodeConfig || !bpmnModeler) return;
    const next = (nodeConfig: any, endElement?: any) => {
        const element = nodeConfig.endElement ? nodeConfig.endElement : nodeConfig.element;
        let y = nodeConfig.element.y;
        let lines = [...element.outgoing];

        if (!bpmnModeler) return;
        if (nodeConfig.conditionNodes) {
            console.log('nodeConfig >>>', nodeConfig);
            if (nodeConfig.endElement) {
                bpmnModeler.get('modeling').resizeShape(nodeConfig.endElement, {
                    x: nodeConfig.element.x,
                    y: nodeConfig.element.y,
                    width: nodeConfig.endElement.width,
                    height: nodeConfig.endElement.height,
                });
            }
            nodeConfig.conditionNodes.forEach((row: any, index: number) => {
                if (row.childNode && bpmnModeler) {
                    const properties = {
                        id: row.element.id,
                        name: row.element.businessObject.name,
                        extensionElements: row.extensionElements,
                        conditionExpression: row.conditionExpression,
                    };
                    bpmnModeler
                        .get('modeling')
                        .removeElements([
                            row.element,
                            ...row.childNode.element.outgoing,
                            ...row.childNode.element.incoming,
                        ]);
                    row.element = markRaw(
                        bpmnModeler.get('modeling').connect(nodeConfig.element, row.childNode.element),
                    );
                    bpmnModeler.get('modeling').updateProperties(row.element, properties);
                    bpmnModeler.get('modeling').resizeShape(row.childNode.element, {
                        x: element.x + index * 150,
                        y: y + 80,
                        width: row.childNode.element.width,
                        height: row.childNode.element.height,
                    });
                    row.childNode && next(row.childNode, nodeConfig.endElement);
                }
            });
        }

        if (nodeConfig.childNode) {
            bpmnModeler.get('modeling').resizeShape(nodeConfig.childNode.element, {
                x: element.x,
                y: element.y + 100,
                width: nodeConfig.childNode.element.width,
                height: nodeConfig.childNode.element.height,
            });
            lines = lines.concat([...nodeConfig.childNode.element.incoming]);
            bpmnModeler.get('modeling').connect(element, nodeConfig.childNode.element);
            next(nodeConfig.childNode, endElement);
        } else if (endElement) {
            if (endElement.y < element.y + 100) {
                bpmnModeler.get('modeling').resizeShape(endElement, {
                    x: endElement.x,
                    y: element.y + 120,
                    width: endElement.width,
                    height: endElement.height,
                });
            }
            bpmnModeler.get('modeling').connect(element, endElement);
        } else {
            const EndEvent = bpmnModeler.get('elementRegistry').find(el => el.type === 'bpmn:EndEvent');
            bpmnModeler.get('modeling').resizeShape(EndEvent, {
                x: element.x,
                y: element.y + 120,
                width: EndEvent.width,
                height: EndEvent.height,
            });
            bpmnModeler.get('modeling').connect(element, EndEvent);
        }

        bpmnModeler.get('modeling').removeElements(lines);
    };

    const StartEvent = bpmnModeler
        .get('elementRegistry')
        .find((el: any) => el.type === 'bpmn:StartEvent');
    const EndEvent = bpmnModeler
        .get('elementRegistry')
        .find((el: any) => el.type === 'bpmn:EndEvent');
    const lines = [
        ...StartEvent.outgoing,
        ...EndEvent.incoming,
        ...nodeConfig.element.outgoing,
        ...nodeConfig.element.incoming,
    ];
    bpmnModeler.get('modeling').removeElements(lines);
    bpmnModeler.get('modeling').connect(StartEvent, nodeConfig.element);
    next(nodeConfig);

    console.log('>>>>>>>>>>>>> 设置BPMN的连接线 End');
};
const diagramType = ref<string>("dingding");
/**
 * 设置流程类型
 */
const setDiagramType = () => {
    if (!bpmnModeler) return;
    const process = bpmnModeler
        .get('elementRegistry')
        .find((el: any) => el.type === 'bpmn:Process');
    if (!process.businessObject.extensionElements) {
        const ExtensionElements = bpmnModeler.get('moddle').create('bpmn:ExtensionElements', {
            values: [
                bpmnModeler.get('moddle').create('flowable:Properties', {
                    values: [
                        bpmnModeler.get('moddle').create('flowable:Property', {
                            name: '$OrangeDiagramType',
                            value: diagramType.value,
                        }),
                    ],
                }),
            ],
        });

        bpmnModeler.get('modeling').updateProperties(process, {
            extensionElements: ExtensionElements,
        });
    } else {
        let hasDiagramType = false;
        let properties: any | null = null;
        process.businessObject.extensionElements.values.forEach((row: any) => {
            if (row.$type === 'flowable:Properties') {
                properties = row;
                row.values.forEach((item: any) => {
                    if (item.name === '$OrangeDiagramType') {
                        bpmnModeler?.get('modeling').updateModdleProperties(row, item, {
                            value: diagramType.value,
                        });
                        hasDiagramType = true;
                    }
                });
            }
        });
        if (!hasDiagramType) {
            bpmnModeler
                .get('modeling')
                .updateModdleProperties(process.businessObject.extensionElements, properties, {
                    values: [
                        ...(properties!.values || properties!.$children),
                        bpmnModeler.get('moddle').create('flowable:Property', {
                            name: '$OrangeDiagramType',
                            value: diagramType.value,
                        }),
                    ],
                });
        }
    }
};
const valid = () => {
    let linting = bpmnModeler.get('linting');
    let errorDatas: Array<any> = [];
    if (!linting.isActive()) {
        linting.setErrors(errorDatas);
        linting.activate();
    }
    let context = {
        id: 'foo',
        message: 'Foo'
    };
    bpmnModeler.get('linting').showError(context);
    console.log(context,errorDatas,linting);

};
const buttonList = ref<Array<any>>([
    {
        icon: "left_panel",
        defaultEdit: true,
        disabled: false,
        key: 'leftPanel',
        label: '左侧工具栏',
    },
    {
        icon: "new-file",
        defaultEdit: true,
        key: 'newFile',
        disabled: false,
        action: async () => {
            await newFile()
        },
        label: '创建新流程图',
    },
    {
        icon: "open-file",
        defaultEdit: true,
        key: 'openFile',
        disabled: false,
        action: () => {
            importLocalFile();
        },
        label: '打开本地文件',
    },
    {
        icon: "zoom_in",
        defaultEdit: true,
        key: 'zoomIn',
        disabled: false,
        action: () => {
            zoom("zoomIn");
        },
        label: '放大(0.2)',
    },
    {
        icon: "zoom_out",
        defaultEdit: true,
        disabled: false,
        key: 'zoomOut',
        action: () => {
            zoom("zoomOut");
        },
        label: '缩小(-0.2)',
    },
    {
        icon: "reset",
        defaultEdit: true,
        key: 'zoomTo',
        disabled: false,
        action: () => {
            zoom("zoomFit");
        },
        label: '调整适合大小',
    },
    {
        icon: "equal",
        defaultEdit: true,
        key: 'zoomTo',
        disabled: false,
        action: () => {
            zoom("resetZoom");
        },
        label: '1:1大小',
    },
    {
        icon: "align_top",
        key: 'alignTop',
        disabled: false,
        action: () => {
            elementAlign("top");
        },
        label: '向上对齐',
    },
    {
        icon: "align_bottom",
        key: 'alignBottom',
        disabled: false,
        action: () => {
            elementAlign("bottom");
        },
        label: '向下对齐',
    },
    {
        icon: "align_left",
        key: 'alignLeft',
        disabled: false,
        action: () => {
            elementAlign("left");
        },
        label: '向左对齐',
    },
    {
        icon: "align_right",
        key: 'alignRight',
        disabled: false,
        action: () => {
            elementAlign("right");
        },
        label: '向右对齐',
    },
    {
        icon: "center",
        key: 'centerContent',
        disabled: false,
        action: () => {
            elementAlign("center");
        },
        label: '居中',
    },

    {
        icon: "undo",
        key: 'unDo',
        disabled: false,
        action: () => {
            undo();
        },
        label: '后退一步',
    },
    {
        icon: "redo",
        key: 'reDo',
        disabled: false,
        action: () => {
            redo();
        },
        label: '前进一步',
    },

    {
        icon: "preview",
        key: 'preview',
        disabled: false,
        action: () => {

        },
        label: '预览',
    },
    {
        icon: "json_file",
        key: 'json',
        disabled: false,
        action: () => {

        },
        label: 'JSON数据',
    },
    {
        icon: "valid",
        key: 'valid',
        disabled: false,
        action: () => {
            valid();
        },
        label: '校验',
    },
    {
        icon: "download",
        key: 'download',
        disabled: false,
        action: () => {
            handleExportBpmn();
        },
        label: '下载Bpmn流程图',
    },
    {
        icon: "download-svg",
        key: 'downloadSvg',
        action: () => {
            handleExportSvg();
        },
        label: '下载Svg流程图',
    },
    {
        icon: "save",
        key: 'save',
        disabled: false,
        action: () => {
            save();
        },
        label: '保存',
    },
    {
        icon: execution,
        key: 'exec',
        disabled: false,
        action: () => {
            exec();
        },
        label: executionLabel,
    },
    {
        icon: "right_panel",
        defaultEdit: true,
        disabled: false,
        key: 'rightPanel',
        label: '右侧属性栏',
    },
]);
export {buttonList, setBpmnModeler, elementAlign, setBpmnConnect, handleExportBpmn, handleExportSvg}
