const flowTemplate = (flowName: string, processId: string) => {
    return `
      <bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" 
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
      xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
      xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
      targetNamespace="http://bpmn.io/schema/bpmn" 
      xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
      <bpmn2:process id="Process${processId}" name="${flowName}">
        <bpmn2:startEvent id="StartEvent_01" name="开始" />
        <bpmn2:endEvent id="EndEvent_01" name="结束" />
      </bpmn2:process>
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
    </bpmn2:definitions>`;
}

export {flowTemplate};
