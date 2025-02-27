export var xmlStr = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:flowable="http://flowable.org/bpmn" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" typeLanguage="http://www.w3.org/2001/XMLSchema" expressionLanguage="http://www.w3.org/1999/XPath" targetNamespace="http://www.flowable.org/test">
  <process id="Process_5309a6e7d18a4672b98d7120d7d09d22" name="测试复杂流程流程15" isExecutable="true">
    <startEvent id="Start_02833f05f54f432eb73808b49886ded6" name="开始"></startEvent>
    <endEvent id="End_943951230e0c47ad86979ffa081d60f1" name="结束"></endEvent>
    <userTask id="Task_003f8380a9044301901e6c5af206b21d" name="lixy1" flowable:assignee="lixy1"></userTask>
    <sequenceFlow id="Seq_26bee0ad8d3b4e09a9f15dde3d7004e3" sourceRef="Start_02833f05f54f432eb73808b49886ded6" targetRef="Task_003f8380a9044301901e6c5af206b21d"></sequenceFlow>
    <userTask id="MTask_3aebc555497343f4ab5f51af56f75455" name="多实例任务" flowable:candidateUsers="wmm1,wmm2">
      <multiInstanceLoopCharacteristics isSequential="false">
        <loopCardinality>2</loopCardinality>
        <completionCondition>\${nrOfCompletedInstances&gt;=1}</completionCondition>
      </multiInstanceLoopCharacteristics>
    </userTask>
    <sequenceFlow id="Seq_f63df3a8fff74812bc0b8b4b944ddefa" sourceRef="Task_003f8380a9044301901e6c5af206b21d" targetRef="MTask_3aebc555497343f4ab5f51af56f75455"></sequenceFlow>
    <userTask id="Task_72707bfd53634c758b6d8331597ef108" name="lixy2" flowable:assignee="lixy2"></userTask>
    <sequenceFlow id="Seq_d78e971c115b419994378ea0c7327400" sourceRef="MTask_3aebc555497343f4ab5f51af56f75455" targetRef="Task_72707bfd53634c758b6d8331597ef108"></sequenceFlow>
    <parallelGateway id="Parallel_4b2926fe4da940078dbea83b3d5d3475"></parallelGateway>
    <sequenceFlow id="Seq_88175cc0223045b6a95450c6ce44d945" sourceRef="Task_72707bfd53634c758b6d8331597ef108" targetRef="Parallel_4b2926fe4da940078dbea83b3d5d3475"></sequenceFlow>
    <userTask id="Task_f511ada466e74f559a60996251100ce3" name="wjx3" flowable:assignee="wjx3"></userTask>
    <sequenceFlow id="Seq_7b7bb239c76246ada39ee571c7d8c739" sourceRef="Parallel_4b2926fe4da940078dbea83b3d5d3475" targetRef="Task_f511ada466e74f559a60996251100ce3"></sequenceFlow>
    <userTask id="Task_f575765ae61341e6b13375dd4a644cff" name="wjx4" flowable:assignee="wjx4"></userTask>
    <sequenceFlow id="Seq_1a509536a7c342cba07882a0218f3988" sourceRef="Task_f511ada466e74f559a60996251100ce3" targetRef="Task_f575765ae61341e6b13375dd4a644cff"></sequenceFlow>
    <userTask id="Task_a501c1d9fbb541a88d0fd88ebcdc559d" name="wjx5" flowable:assignee="wjx5"></userTask>
    <sequenceFlow id="Seq_225cd26b81d14f6b991a19936e8c4211" sourceRef="Parallel_4b2926fe4da940078dbea83b3d5d3475" targetRef="Task_a501c1d9fbb541a88d0fd88ebcdc559d"></sequenceFlow>
    <parallelGateway id="Parallel_435d8aa0890547bbab7f434541e362fb"></parallelGateway>
    <sequenceFlow id="Seq_02be103832d84e6a96f963ffca8c0867" sourceRef="Task_f575765ae61341e6b13375dd4a644cff" targetRef="Parallel_435d8aa0890547bbab7f434541e362fb"></sequenceFlow>
    <sequenceFlow id="Seq_06a575b1a6d24a2690f4c1f31a4e5a23" sourceRef="Task_a501c1d9fbb541a88d0fd88ebcdc559d" targetRef="Parallel_435d8aa0890547bbab7f434541e362fb"></sequenceFlow>
    <userTask id="Task_2087846166f842ebb8276610995ba83a" name="lixy3" flowable:assignee="lixy3"></userTask>
    <sequenceFlow id="Seq_dcf68fe2fca140ec88d5b516d24ed268" sourceRef="Parallel_435d8aa0890547bbab7f434541e362fb" targetRef="Task_2087846166f842ebb8276610995ba83a"></sequenceFlow>
    <sequenceFlow id="Seq_86353d23aa07459aa81d6cc155e5f2f4" sourceRef="Task_2087846166f842ebb8276610995ba83a" targetRef="End_943951230e0c47ad86979ffa081d60f1"></sequenceFlow>
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_Process_5309a6e7d18a4672b98d7120d7d09d22">
    <bpmndi:BPMNPlane bpmnElement="Process_5309a6e7d18a4672b98d7120d7d09d22" id="BPMNPlane_Process_5309a6e7d18a4672b98d7120d7d09d22">
      <bpmndi:BPMNShape bpmnElement="Parallel_4b2926fe4da940078dbea83b3d5d3475" id="BPMNShape_Parallel_4b2926fe4da940078dbea83b3d5d3475">
        <omgdc:Bounds height="40.0" width="40.0" x="530.0" y="90.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="Task_2087846166f842ebb8276610995ba83a" id="BPMNShape_Task_2087846166f842ebb8276610995ba83a">
        <omgdc:Bounds height="60.0" width="100.0" x="1010.0" y="67.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="MTask_3aebc555497343f4ab5f51af56f75455" id="BPMNShape_MTask_3aebc555497343f4ab5f51af56f75455">
        <omgdc:Bounds height="60.0" width="100.0" x="230.0" y="80.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="Task_a501c1d9fbb541a88d0fd88ebcdc559d" id="BPMNShape_Task_a501c1d9fbb541a88d0fd88ebcdc559d">
        <omgdc:Bounds height="60.0" width="100.0" x="620.0" y="0.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="Start_02833f05f54f432eb73808b49886ded6" id="BPMNShape_Start_02833f05f54f432eb73808b49886ded6">
        <omgdc:Bounds height="30.0" width="30.0" x="0.0" y="95.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="Task_003f8380a9044301901e6c5af206b21d" id="BPMNShape_Task_003f8380a9044301901e6c5af206b21d">
        <omgdc:Bounds height="60.0" width="100.0" x="80.0" y="80.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="Task_f575765ae61341e6b13375dd4a644cff" id="BPMNShape_Task_f575765ae61341e6b13375dd4a644cff">
        <omgdc:Bounds height="60.0" width="100.0" x="770.0" y="130.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="End_943951230e0c47ad86979ffa081d60f1" id="BPMNShape_End_943951230e0c47ad86979ffa081d60f1">
        <omgdc:Bounds height="30.0" width="30.0" x="1160.0" y="82.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="Task_72707bfd53634c758b6d8331597ef108" id="BPMNShape_Task_72707bfd53634c758b6d8331597ef108">
        <omgdc:Bounds height="60.0" width="100.0" x="380.0" y="80.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="Parallel_435d8aa0890547bbab7f434541e362fb" id="BPMNShape_Parallel_435d8aa0890547bbab7f434541e362fb">
        <omgdc:Bounds height="40.0" width="40.0" x="920.0" y="76.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="Task_f511ada466e74f559a60996251100ce3" id="BPMNShape_Task_f511ada466e74f559a60996251100ce3">
        <omgdc:Bounds height="60.0" width="100.0" x="620.0" y="160.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge bpmnElement="Seq_f63df3a8fff74812bc0b8b4b944ddefa" id="BPMNEdge_Seq_f63df3a8fff74812bc0b8b4b944ddefa">
        <omgdi:waypoint x="180.0" y="110.0"></omgdi:waypoint>
        <omgdi:waypoint x="230.0" y="110.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="Seq_dcf68fe2fca140ec88d5b516d24ed268" id="BPMNEdge_Seq_dcf68fe2fca140ec88d5b516d24ed268">
        <omgdi:waypoint x="960.0" y="96.0"></omgdi:waypoint>
        <omgdi:waypoint x="972.0" y="96.0"></omgdi:waypoint>
        <omgdi:waypoint x="972.0" y="97.0"></omgdi:waypoint>
        <omgdi:waypoint x="1010.0" y="97.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="Seq_26bee0ad8d3b4e09a9f15dde3d7004e3" id="BPMNEdge_Seq_26bee0ad8d3b4e09a9f15dde3d7004e3">
        <omgdi:waypoint x="30.0" y="110.0"></omgdi:waypoint>
        <omgdi:waypoint x="80.0" y="110.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="Seq_225cd26b81d14f6b991a19936e8c4211" id="BPMNEdge_Seq_225cd26b81d14f6b991a19936e8c4211">
        <omgdi:waypoint x="570.0" y="102.5"></omgdi:waypoint>
        <omgdi:waypoint x="582.0" y="102.5"></omgdi:waypoint>
        <omgdi:waypoint x="582.0" y="30.000000000000007"></omgdi:waypoint>
        <omgdi:waypoint x="620.0" y="30.000000000000007"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="Seq_1a509536a7c342cba07882a0218f3988" id="BPMNEdge_Seq_1a509536a7c342cba07882a0218f3988">
        <omgdi:waypoint x="720.0" y="190.0"></omgdi:waypoint>
        <omgdi:waypoint x="732.0" y="190.0"></omgdi:waypoint>
        <omgdi:waypoint x="732.0" y="160.0"></omgdi:waypoint>
        <omgdi:waypoint x="770.0" y="160.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="Seq_02be103832d84e6a96f963ffca8c0867" id="BPMNEdge_Seq_02be103832d84e6a96f963ffca8c0867">
        <omgdi:waypoint x="870.0" y="160.0"></omgdi:waypoint>
        <omgdi:waypoint x="882.0" y="160.0"></omgdi:waypoint>
        <omgdi:waypoint x="882.0" y="96.0"></omgdi:waypoint>
        <omgdi:waypoint x="920.0" y="96.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="Seq_7b7bb239c76246ada39ee571c7d8c739" id="BPMNEdge_Seq_7b7bb239c76246ada39ee571c7d8c739">
        <omgdi:waypoint x="570.0" y="117.5"></omgdi:waypoint>
        <omgdi:waypoint x="582.0" y="117.5"></omgdi:waypoint>
        <omgdi:waypoint x="582.0" y="190.0"></omgdi:waypoint>
        <omgdi:waypoint x="620.0" y="190.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="Seq_d78e971c115b419994378ea0c7327400" id="BPMNEdge_Seq_d78e971c115b419994378ea0c7327400">
        <omgdi:waypoint x="330.0" y="110.0"></omgdi:waypoint>
        <omgdi:waypoint x="380.0" y="110.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="Seq_88175cc0223045b6a95450c6ce44d945" id="BPMNEdge_Seq_88175cc0223045b6a95450c6ce44d945">
        <omgdi:waypoint x="480.0" y="110.0"></omgdi:waypoint>
        <omgdi:waypoint x="530.0" y="110.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="Seq_06a575b1a6d24a2690f4c1f31a4e5a23" id="BPMNEdge_Seq_06a575b1a6d24a2690f4c1f31a4e5a23">
        <omgdi:waypoint x="720.0" y="30.0"></omgdi:waypoint>
        <omgdi:waypoint x="732.0" y="30.0"></omgdi:waypoint>
        <omgdi:waypoint x="732.0" y="96.0"></omgdi:waypoint>
        <omgdi:waypoint x="920.0" y="96.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="Seq_86353d23aa07459aa81d6cc155e5f2f4" id="BPMNEdge_Seq_86353d23aa07459aa81d6cc155e5f2f4">
        <omgdi:waypoint x="1110.0" y="97.0"></omgdi:waypoint>
        <omgdi:waypoint x="1160.0" y="97.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`;