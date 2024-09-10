import BpmnModeler from 'camunda-bpmn-js/lib/camunda-platform/Modeler';
import TokenSimulationModule from "bpmn-js-token-simulation";
import SimulationSupportModule from "bpmn-js-token-simulation/lib/simulation-support";

import lintingAnnotationsModule from '@camunda/linting/modeler';
import {BpmnJSTracking as bpmnJSTracking} from 'bpmn-js-tracking';
import contextPadTracking from 'bpmn-js-tracking/lib/features/context-pad';
import elementTemplatesTracking from 'bpmn-js-tracking/lib/features/element-templates';
import modelingTracking from 'bpmn-js-tracking/lib/features/modeling';
import popupMenuTracking from 'bpmn-js-tracking/lib/features/popup-menu';
import paletteTracking from 'bpmn-js-tracking/lib/features/palette';

import {postRequest} from "@/api/star_horse.ts";
import {warning} from "@/utils/message.ts";
import {markRaw, ref, unref} from "vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {flowTemplate} from "@/views/jbpm/utils/template.ts";
import {uuid} from "@/api/system.ts";
import customTranslate from "@/views/jbpm/utils/zh_CN.ts";
import {CommandStack} from "camunda-bpmn-js/lib/util/ExtensionElementsUtil";
import BpmnEditorActions from "bpmn-js/lib/features/editor-actions/BpmnEditorActions";
import {Canvas, EventBus} from "bpmn-js/lib/features/context-pad/ContextPadProvider";
import Modeling from "bpmn-js/lib/features/modeling/Modeling";
import {Moddle} from "bpmn-js/lib/model/Types";
import {ModdleElement} from "bpmnlint/lib/types";

let bpmnModeler: any = null;
const execution = ref<string>("exec1");
const executionLabel = ref<string>('模拟运行');
const canRedo = ref<boolean>(true);
const flowDesign = useFlowDesign(piniaInstance);
const createXml = (str: string) => {
    if (document.all) {
        const xmlDom = new ActiveXObject("Microsoft.XMLDOM")
        xmlDom.loadXML(str);
        return xmlDom;
    } else {
        return new DOMParser().parseFromString(str, "text/xml");
    }
};
// 流程校验使用
const setUrlParam = (name: string, value: any) => {
    const url = new URL(window.location.href);
    if (value) {
        url.searchParams.set(name, 1);
    } else {
        url.searchParams.delete(name);
    }
    window.history.replaceState({}, null, url.href);
}
// 流程校验使用
const getUrlParam = (name: string) => {
    const url = new URL(window.location.href);
    return url.searchParams.has(name);
}
const createBpmnModeler = (canvas: any) => {
    const translatezhCn = {
        translate: ['value', customTranslate]
    };
    bpmnModeler = markRaw(new BpmnModeler({
        container: canvas,
        additionalModules: [
            translatezhCn,
            TokenSimulationModule, SimulationSupportModule,
            lintingAnnotationsModule,
            bpmnJSTracking,
            contextPadTracking,
            elementTemplatesTracking,
            modelingTracking,
            popupMenuTracking,
            paletteTracking
        ],
        // moddleExtensions: _moddleExtensions,
        exporter: {
            name: 'bpmn-js-token-simulation',
            version: "1"
        },
        keyboard: {
            bindTo: document
        }
    }));
    $(".bjs-powered-by").remove();
    $(".bts-toggle-mode").remove();
    return bpmnModeler;
}
/**
 * 导出Bpmn文件
 */
const handleExportBpmn = async (modeler: BpmnModeler) => {
    const {xml} = await modeler.saveXML();
    const data: any = setEncoded('BPMN', xml);
    if (data.href && data.filename) {
        const a = document.createElement('a');
        a.download = data.filename; //指定下载的文件名
        a.href = data.href; //  URL对象
        a.click(); // 模拟点击
        URL.revokeObjectURL(a.href); // 释放URL 对象
    }
};
/**
 * 导出SVG文件
 */
const handleExportSvg = async (modeler: BpmnModeler) => {
    const {svg} = await modeler.saveSVG();
    const data: any = setEncoded('SVG', svg);
    if (data.href && data.filename) {
        const a = document.createElement('a');
        a.download = data.filename;
        a.href = data.href;
        a.click();
        URL.revokeObjectURL(a.href);
    }
};
const setEncoded = (type: string, data: any) => {
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
 * @param modeler
 * @param type 2 垂直对齐 1 水平对齐
 */
const elementAlign = (modeler: BpmnModeler, type: any) => {
    // warning("功能开发中");
    // bpmnModeler.get("alignElements").trigger("bottom");
    //let modeling= bpmnModeler.get("modeling");
    //bpmnModeler.get("elements.align").trigger("bottom");
    // bpmnModeler.get("modeling").autoPlace();
    //alignElements.trigger(Elements, type);
    const alignElements = modeler.get<any>("alignElements");
    const selection = modeler.get<any>('selection');
    const elements = selection.get();
    /**
     * Executes the alignment of a selection of elements
     * 執行元素選擇的對齊
     *
     * @param  {Array} elements 一般爲節點元素
     * @param  {string} type 可用：left|right|center|top|bottom|middle
     */
    alignElements.trigger(elements, type);
};
/**
 * 初始化bpmnModel 对象
 * @param modeler
 */
const setBpmnModeler = (modeler: BpmnModeler) => {
    console.log(modeler);
    bpmnModeler = modeler;
}


const deploy = async (modeler: BpmnModeler) => {
    const result_xml = await modeler.saveXML();
    const result_svg = await modeler.saveSVG();
    const {xml} = result_xml;
    const {svg} = result_svg;
    postRequest("jbpm/deploy", {
        processKey: "test",
        processName: "test",
        resourceName: "test",
        xml: xml,
        svg: svg,
    }).then((_data: any) => {
    }).catch((err) => {
        warning(err);
    });
};
const save = async (modeler: BpmnModeler) => {
    const result_xml = await modeler.saveXML();
    const result_svg = await modeler.saveSVG();
    const dataForm = flowDesign.flowFormInfo.value;
    const {xml} = result_xml;
    const {svg} = result_svg;
    dataForm["flowXml"] = xml;
    dataForm["flowSvg"] = svg;
};


const undo = (modeler: BpmnModeler) => {
    const commandStack = modeler.get<CommandStack>("commandStack");
    commandStack.undo();
    canRedo.value = commandStack.canRedo();
};
const redo = (modeler: BpmnModeler) => {
    const commandStack = modeler.get<CommandStack>("commandStack");
    if (!unref(canRedo)) {
        return;
    }
    commandStack.redo();
    canRedo.value = commandStack.canRedo();
};
const zoom = (modeler: BpmnModeler, action: string) => {
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
    const actionEvent = modeler.get<BpmnEditorActions>('editorActions');
    actionEvent.trigger(action, context);
    // scale.value = newScale;
};

const active = ref<boolean>(false);
/**
 * 模拟执行
 */
const exec = (modeler: BpmnModeler) => {
    const toggleMode = modeler.get<any>("toggleMode");
    console.log(toggleMode);
    active.value = !active.value;

    toggleMode.toggleMode(active.value);
    // const simulationSupport = bpmnModeler.get('simulationSupport');
// enable simulation
    if (active.value) {
        execution.value = "cancel";
        executionLabel.value = "停止模拟";
        // simulationSupport.toggleSimulation(active);
//         // 获取BPMN模拟器中的ElementRegistry对象
//         const elementRegistry = bpmnModeler.get('elementRegistry');
// // 获取所有的开始事件节点
//         const startEvents = elementRegistry.filter((element: any) => {
//             return element.type === 'bpmn:StartEvent';
//         });
//         simulationSupport.triggerElement(startEvents.id);
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
const newFile = async (modeler: BpmnModeler) => {
    const eventBus = modeler.get<EventBus>('eventBus');
    console.log(modeler, eventBus);
    // let define = bpmnModeler.getDefinitions();
    // modeler.clear();
    // bpmnModeler.init(define);
    // bpmnModeler.get('eventBus').fire('diagram.clear');
    // bpmnModeler.get('eventBus').fire('diagram.init');
    // 新建一个空白BPMN图表
    // let newDiagram = await bpmnModeler.createDiagram();
    // 渲染图表
    await modeler.importXML(flowTemplate("新流程", uuid()));
    changeLocation(modeler);
}
/**
 * 创建新流程
 * @param modeler
 * @param xml
 */
const createNewFlow = async (modeler: BpmnModeler, xml: string) => {
    // 将字符串转换成图显示出来
    try {
        const result = await modeler.importXML(xml);
        // 打开小地图
        modeler.get<any>("minimap").open();
        // 屏幕自适应
        changeLocation(modeler);
        console.log(result.warnings);
    } catch (err) {
        console.error(err);
    }
};
const changeLocation = (modeler: BpmnModeler) => {
    const canvas = modeler.get<Canvas>("canvas");
    canvas.zoom("fit-viewport", true);
}
const importLocalFile = async (modeler: BpmnModeler) => {
// 创建一个隐藏的文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = ".xml,.bpmn,.jbpm";
    fileInput.style.display = 'none';
// 添加到文档中
    document.body.appendChild(fileInput);
// 监听文件选择事件
    fileInput.addEventListener('change', (event) => {
        const files = event.target!.files; // 获取选中的文件列表
        console.log(files); // 输出文件信息到控制台
        const reader = new FileReader();
        reader.readAsText(files[0]);
        reader.onload = async () => {
            const xmlStr = reader.result as string;
            if (modeler) {
                const {warnings} = await modeler.importXML(xmlStr);
                if (warnings && warnings.length) {
                    warnings.forEach((warn: any) => console.warn(warn));
                }
                changeLocation(modeler);
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
const setBpmnConnect = (modeler: BpmnModeler, nodeConfig: any) => {
    console.log('>>>>>>>>>>>>> 设置BPMN的连接线 Begin');
    if (!nodeConfig || !bpmnModeler) return;
    const modeling = modeler.get<Modeling>("modeling");
    const elementRegistry = modeler.get<any>('elementRegistry');
    const next = (nodeConfig: any, endElement?: any) => {
        const element = nodeConfig.endElement ? nodeConfig.endElement : nodeConfig.element;
        const y = nodeConfig.element.y;
        let lines = [...element.outgoing];

        if (!bpmnModeler) return;
        if (nodeConfig.conditionNodes) {
            console.log('nodeConfig >>>', nodeConfig);
            if (nodeConfig.endElement) {
                modeling.resizeShape(nodeConfig.endElement, {
                    x: nodeConfig.element.x,
                    y: nodeConfig.element.y,
                    width: nodeConfig.endElement.width,
                    height: nodeConfig.endElement.height,
                });
            }
            nodeConfig.conditionNodes.forEach((row: any, index: number) => {
                if (row.childNode && modeler) {
                    const properties = {
                        id: row.element.id,
                        name: row.element.businessObject.name,
                        extensionElements: row.extensionElements,
                        conditionExpression: row.conditionExpression,
                    };
                    modeling
                        .removeElements([
                            row.element,
                            ...row.childNode.element.outgoing,
                            ...row.childNode.element.incoming,
                        ]);
                    row.element = markRaw(
                        modeling.connect(nodeConfig.element, row.childNode.element, {}),
                    );
                    modeling.updateProperties(row.element, properties);
                    modeling.resizeShape(row.childNode.element, {
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
            modeling.resizeShape(nodeConfig.childNode.element, {
                x: element.x,
                y: element.y + 100,
                width: nodeConfig.childNode.element.width,
                height: nodeConfig.childNode.element.height,
            });
            lines = lines.concat([...nodeConfig.childNode.element.incoming]);
            modeling.connect(element, nodeConfig.childNode.element, {});
            next(nodeConfig.childNode, endElement);
        } else if (endElement) {
            if (endElement.y < element.y + 100) {
                modeling.resizeShape(endElement, {
                    x: endElement.x,
                    y: element.y + 120,
                    width: endElement.width,
                    height: endElement.height,
                });
            }
            modeling.connect(element, endElement, {});
        } else {
            const EndEvent = elementRegistry.find((el: ModdleElement) => el.type === 'bpmn:EndEvent');
            modeling.resizeShape(EndEvent, {
                x: element.x,
                y: element.y + 120,
                width: EndEvent.width,
                height: EndEvent.height,
            });
            modeling.connect(element, EndEvent, {});
        }
        modeling.removeElements(lines);
    };

    const StartEvent = elementRegistry.find((el: any) => el.type === 'bpmn:StartEvent');
    const EndEvent = elementRegistry.find((el: any) => el.type === 'bpmn:EndEvent');
    const lines = [
        ...StartEvent.outgoing,
        ...EndEvent.incoming,
        ...nodeConfig.element.outgoing,
        ...nodeConfig.element.incoming,
    ];
    modeling.removeElements(lines);
    modeling.connect(StartEvent, nodeConfig.element, {});
    next(nodeConfig);

    console.log('>>>>>>>>>>>>> 设置BPMN的连接线 End');
};
const diagramType = ref<string>("dingding");
/**
 * 设置流程类型
 */
const setDiagramType = (modeler: BpmnModeler) => {
    if (!modeler) return;
    const elementRegistry = modeler.get<ModdleElement>('elementRegistry');
    const moddle = modeler.get<Moddle>('moddle');
    const modeling = modeler.get<Modeling>("modeling");
    const process = elementRegistry
        .find((el: any) => el.type === 'bpmn:Process');
    if (!process.businessObject.extensionElements) {
        const ExtensionElements = moddle.create('bpmn:ExtensionElements', {
            values: [
                moddle.create('flowable:Properties', {
                    values: [
                        moddle.create('flowable:Property', {
                            name: '$OrangeDiagramType',
                            value: diagramType.value,
                        }),
                    ],
                }),
            ],
        });

        modeling.updateProperties(process, {
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
                        modeling.updateModdleProperties(row, item, {
                            value: diagramType.value,
                        });
                        hasDiagramType = true;
                    }
                });
            }
        });
        if (!hasDiagramType) {
            modeling
                .updateModdleProperties(process.businessObject.extensionElements, properties, {
                    values: [
                        ...(properties!.values || properties!.$children),
                        moddle.create('flowable:Property', {
                            name: '$OrangeDiagramType',
                            value: diagramType.value,
                        }),
                    ],
                });
        }
    }
};
const valid = (modeler: BpmnModeler) => {
    const linting: any = modeler.get<any>('linting');
    const errorDatas: Array<any> = [];
    if (!linting.isActive()) {
        linting.setErrors(errorDatas);
        linting.activate();
    }
    const context = {
        id: 'foo',
        message: 'Foo'
    };
    linting.showError(context);
    console.log(context, errorDatas, linting);

};

const flowButtonList = (modeler: BpmnModeler) => {
    return ref<Array<any>>([
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
                await newFile(modeler)
            },
            label: '创建新流程图',
        },
        {
            icon: "open-file",
            defaultEdit: true,
            key: 'openFile',
            disabled: false,
            action: () => {
                importLocalFile(modeler);
            },
            label: '打开本地文件',
        },
        {
            icon: "zoom_in",
            defaultEdit: true,
            key: 'zoomIn',
            disabled: false,
            action: () => {
                zoom(modeler, "zoomIn");
            },
            label: '放大(0.2)',
        },
        {
            icon: "zoom_out",
            defaultEdit: true,
            disabled: false,
            key: 'zoomOut',
            action: () => {
                zoom(modeler, "zoomOut");
            },
            label: '缩小(-0.2)',
        },
        {
            icon: "reset",
            defaultEdit: true,
            key: 'zoomTo',
            disabled: false,
            action: () => {
                zoom(modeler, "zoomFit");
            },
            label: '调整适合大小',
        },
        {
            icon: "equal",
            defaultEdit: true,
            key: 'zoomTo',
            disabled: false,
            action: () => {
                zoom(modeler, "resetZoom");
            },
            label: '1:1大小',
        },
        {
            icon: "align_top",
            key: 'alignTop',
            disabled: false,
            action: () => {
                elementAlign(modeler, "top");
            },
            label: '向上对齐',
        },
        {
            icon: "align_bottom",
            key: 'alignBottom',
            disabled: false,
            action: () => {
                elementAlign(modeler, "bottom");
            },
            label: '向下对齐',
        },
        {
            icon: "align_left",
            key: 'alignLeft',
            disabled: false,
            action: () => {
                elementAlign(modeler, "left");
            },
            label: '向左对齐',
        },
        {
            icon: "align_right",
            key: 'alignRight',
            disabled: false,
            action: () => {
                elementAlign(modeler, "right");
            },
            label: '向右对齐',
        },
        {
            icon: "center",
            key: 'centerContent',
            disabled: false,
            action: () => {
                elementAlign(modeler, "center");
            },
            label: '居中',
        },

        {
            icon: "undo",
            key: 'unDo',
            disabled: false,
            action: () => {
                undo(modeler);
            },
            label: '后退一步',
        },
        {
            icon: "redo",
            key: 'reDo',
            disabled: false,
            action: () => {
                redo(modeler);
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
                valid(modeler);
            },
            label: '校验',
        },
        {
            icon: "download",
            key: 'download',
            disabled: false,
            action: () => {
                handleExportBpmn(modeler);
            },
            label: '下载Bpmn流程图',
        },
        {
            icon: "download-svg",
            key: 'downloadSvg',
            action: () => {
                handleExportSvg(modeler);
            },
            label: '下载Svg流程图',
        },
        {
            icon: "save",
            key: 'save',
            disabled: false,
            action: () => {
                save(modeler);
            },
            label: '保存',
        },
        {
            icon: execution,
            key: 'exec',
            disabled: false,
            action: () => {
                exec(modeler);
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
}

export {
    flowButtonList, setBpmnModeler, elementAlign, setBpmnConnect, handleExportBpmn, handleExportSvg,
    createBpmnModeler, createNewFlow
}
