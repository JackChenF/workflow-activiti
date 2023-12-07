import { getBusinessObject, is, isAny } from "bpmn-js/lib/util/ModelUtil";
import { Element } from "bpmn-js/lib/model/Types";
import { ModdleElement } from "bpmn-moddle";
import {
  getExtensionElementsList,
  addExtensionElements,
  removeExtensionElements
} from "@/components/BpmnJs/utils/BpmnExtensionElementsUtil";
import editor from "@/components/BpmnJs/store/editor";
import modeler from "@/components/BpmnJs/store/modeler";
import { createScript } from "@/components/BpmnJs/bo-utils/scriptUtil";
import { LISTENER_ALLOWED_TYPES } from "@/components/BpmnJs/config/bpmnEnums";

// execution listener list
export function getExecutionListeners(element: Element): ModdleElement[] {
  const prefix = editor().getProcessEngine;
  const businessObject = getListenersContainer(element);
  return getExtensionElementsList(businessObject, `${prefix}:ExecutionListener`);
}

// create an empty execution listener and update element's businessObject
export function addEmptyExtensionListener(element: Element) {
  const prefix = editor().getProcessEngine;
  const moddle = modeler().getModdle;
  const listener = moddle!.create(`${prefix}:ExecutionListener`, {
    event: getDefaultEvent(element),
    class: ""
  });
  const businessObject = getListenersContainer(element);
  addExtensionElements(element, businessObject, listener);
}

// create an execution listener with props
export function addExecutionListener(element: Element, props: ExecutionListenerForm) {
  const prefix = editor().getProcessEngine;
  const moddle = modeler().getModdle;
  const businessObject = getListenersContainer(element);
  const listener = moddle!.create(`${prefix}:ExecutionListener`, {});
  updateListenerProperty(element, listener, props);
  addExtensionElements(element, businessObject, listener);
}

// update execution listener's property
export function updateExecutionListener(
  element: Element,
  props: ExecutionListenerForm,
  listener: ModdleElement
) {
  removeExtensionElements(element, getListenersContainer(element), listener);
  addExecutionListener(element, props);
}

// remove an execution listener
export function removeExecutionListener(element: Element, listener: ModdleElement) {
  removeExtensionElements(element, getListenersContainer(element), listener);
}

////////////// helpers
export function isExecutable(element: BpmnElement): boolean {
  if (isAny(element, LISTENER_ALLOWED_TYPES)) return true;
  if (is(element, "bpmn:Participant")) {
    return !!element.businessObject.processRef;
  }
  return false;
}

export function getExecutionListenerType(listener: ModdleElement): string {
  const prefix = editor().getProcessEngine;
  if (isAny(listener, [`${prefix}:ExecutionListener`])) {
    if (listener.get(`${prefix}:class`)) return "class";
    if (listener.get(`${prefix}:expression`)) return "expression";
    if (listener.get(`${prefix}:delegateExpression`)) return "delegateExpression";
    if (listener.get("script")) return "script";
  }
  return "";
}

export function getListenersContainer(element: Element): ModdleElement {
  const businessObject = getBusinessObject(element);
  return businessObject?.get("processRef") || businessObject;
}

export function getDefaultEvent(element: Element) {
  return is(element, "bpmn:SequenceFlow") ? "take" : "start";
}

/**
 * 获取监听器类型
 * @param element 当前节点
 * @returns 监听器类型
 */
export function getExecutionListenerTypes(element: Element) {
  if (is(element, "bpmn:SequenceFlow")) {
    return [{ label: "连接线", value: "take" }];
  }
  return [
    { label: "开始", value: "start" },
    { label: "结束", value: "end" }
  ];
}

function updateListenerProperty(
  element: Element,
  listener: ModdleElement,
  props: ExecutionListenerForm
) {
  const modeling = modeler().getModeling;
  const prefix = editor().getProcessEngine;
  const { name, event, class: listenerClass, expression, delegateExpression, script } = props;

  const updateProperty = (key, value) =>
    modeling.updateModdleProperties(element, listener, { [`${prefix}:${key}`]: value });
  name && updateProperty("name", name);
  event && updateProperty("event", event);
  listenerClass && updateProperty("class", listenerClass);
  expression && updateProperty("expression", expression);
  delegateExpression && updateProperty("delegateExpression", delegateExpression);

  if (script) {
    const bpmnScript = createScript(script);
    modeling.updateModdleProperties(element, listener, { script: bpmnScript });
  }
}
