export var xmlStrNew = `<?xml version='1.0' encoding='UTF-8'?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:flowable="http://flowable.org/bpmn" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" typeLanguage="http://www.w3.org/2001/XMLSchema" expressionLanguage="http://www.w3.org/1999/XPath" targetNamespace="https://flowable.org/bpmn20">
  <process id="0d69199c-4677-47ea-a806-06101b680bb0" name="测试" isExecutable="true">
    <documentation>测试</documentation>
    <startEvent id="73341001-cbda-4ea4-a8bf-536c9eda1a70" name="发起人"/>
    <sequenceFlow id="73341001-cbda-4ea4-a8bf-536c9eda1a70-743fa9d1-31ab-45df-8900-e8f37e256004" sourceRef="73341001-cbda-4ea4-a8bf-536c9eda1a70" targetRef="743fa9d1-31ab-45df-8900-e8f37e256004"/>
    <userTask id="743fa9d1-31ab-45df-8900-e8f37e256004" name="审批人" flowable:assignee="aa">
    </userTask>
    <sequenceFlow id="743fa9d1-31ab-45df-8900-e8f37e256004-d7193906-9f02-4196-ab3e-e67854d7e3ac" sourceRef="743fa9d1-31ab-45df-8900-e8f37e256004" targetRef="d7193906-9f02-4196-ab3e-e67854d7e3ac"/>
    <serviceTask id="d7193906-9f02-4196-ab3e-e67854d7e3ac" name="抄送人"/>
    <sequenceFlow id="d7193906-9f02-4196-ab3e-e67854d7e3ac-0b696dfb-c13c-46a7-85fa-30b348162274" sourceRef="d7193906-9f02-4196-ab3e-e67854d7e3ac" targetRef="0b696dfb-c13c-46a7-85fa-30b348162274"/>
    <endEvent id="0b696dfb-c13c-46a7-85fa-30b348162274" name="结束"/>
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_0d69199c-4677-47ea-a806-06101b680bb0">
    <bpmndi:BPMNPlane bpmnElement="0d69199c-4677-47ea-a806-06101b680bb0" id="BPMNPlane_0d69199c-4677-47ea-a806-06101b680bb0">
      <bpmndi:BPMNShape bpmnElement="0b696dfb-c13c-46a7-85fa-30b348162274" id="BPMNShape_0b696dfb-c13c-46a7-85fa-30b348162274">
        <omgdc:Bounds height="30.0" width="30.0" x="380.0" y="15.0"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="73341001-cbda-4ea4-a8bf-536c9eda1a70" id="BPMNShape_73341001-cbda-4ea4-a8bf-536c9eda1a70">
        <omgdc:Bounds height="30.0" width="30.0" x="0.0" y="15.0"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="743fa9d1-31ab-45df-8900-e8f37e256004" id="BPMNShape_743fa9d1-31ab-45df-8900-e8f37e256004">
        <omgdc:Bounds height="60.0" width="100.0" x="80.0" y="0.0"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="d7193906-9f02-4196-ab3e-e67854d7e3ac" id="BPMNShape_d7193906-9f02-4196-ab3e-e67854d7e3ac">
        <omgdc:Bounds height="60.0" width="100.0" x="230.0" y="0.0"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge bpmnElement="d7193906-9f02-4196-ab3e-e67854d7e3ac-0b696dfb-c13c-46a7-85fa-30b348162274" id="BPMNEdge_d7193906-9f02-4196-ab3e-e67854d7e3ac-0b696dfb-c13c-46a7-85fa-30b348162274">
        <omgdi:waypoint x="330.0" y="30.0"/>
        <omgdi:waypoint x="342.0" y="30.0"/>
        <omgdi:waypoint x="342.0" y="30.000000000000004"/>
        <omgdi:waypoint x="380.0" y="30.000000000000004"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="73341001-cbda-4ea4-a8bf-536c9eda1a70-743fa9d1-31ab-45df-8900-e8f37e256004" id="BPMNEdge_73341001-cbda-4ea4-a8bf-536c9eda1a70-743fa9d1-31ab-45df-8900-e8f37e256004">
        <omgdi:waypoint x="30.0" y="30.0"/>
        <omgdi:waypoint x="42.0" y="30.0"/>
        <omgdi:waypoint x="42.0" y="30.000000000000007"/>
        <omgdi:waypoint x="80.0" y="30.000000000000007"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="743fa9d1-31ab-45df-8900-e8f37e256004-d7193906-9f02-4196-ab3e-e67854d7e3ac" id="BPMNEdge_743fa9d1-31ab-45df-8900-e8f37e256004-d7193906-9f02-4196-ab3e-e67854d7e3ac">
        <omgdi:waypoint x="180.0" y="30.0"/>
        <omgdi:waypoint x="192.0" y="30.0"/>
        <omgdi:waypoint x="192.0" y="30.000000000000007"/>
        <omgdi:waypoint x="230.0" y="30.000000000000007"/>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>
`;
