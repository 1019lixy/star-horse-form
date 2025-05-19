const flowTemplate = (flowName: string, processId: string) => {
    return `
      <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
 xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
 xmlns:modeler="http://camunda.org/schema/modeler/1.0" 
  targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler"
   exporterVersion="5.0.0" modeler:executionPlatform="Camunda Platform"
   modeler:executionPlatformVersion="7.17.0">
      <bpmn:process id="Process${processId}" name="${flowName}" isExecutable="true">
        <bpmn:startEvent id="StartEvent_01" name="开始" />
        <bpmn:endEvent id="EndEvent_01" name="结束" />
      </bpmn:process>
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process${processId}">
          <bpmndi:BPMNShape id="StartEvent_01_1" bpmnElement="StartEvent_01">
            <dc:Bounds x="142" y="212" width="36" height="36" />
            <bpmndi:BPMNLabel>
              <dc:Bounds x="149" y="255" width="22" height="14" />
            </bpmndi:BPMNLabel>
          </bpmndi:BPMNShape>
          <bpmndi:BPMNShape id="EndEvent_01_1" bpmnElement="EndEvent_01">
            <dc:Bounds x="342" y="212" width="36" height="36" />
            <bpmndi:BPMNLabel>
              <dc:Bounds x="349" y="255" width="22" height="14" />
            </bpmndi:BPMNLabel>
          </bpmndi:BPMNShape>
        </bpmndi:BPMNPlane>
      </bpmndi:BPMNDiagram>
    </bpmn:definitions>`;
};

export {flowTemplate};
