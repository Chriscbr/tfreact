import createReconciler from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";
import {
  DOMElement,
  DOMNodeAttribute,
  ElementNames,
  TextNode,
  appendChildNode,
  createNode,
  createTextNode,
  removeChildNode,
  setAttribute,
} from "./dom";

type AnyObject = Record<string, unknown>;

const diff = (before: AnyObject, after: AnyObject): AnyObject | undefined => {
  if (before === after) {
    return;
  }

  if (!before) {
    return after;
  }

  const changed: AnyObject = {};
  let isChanged = false;

  for (const key of Object.keys(before)) {
    const isDeleted = after ? !Object.hasOwnProperty.call(after, key) : true;

    if (isDeleted) {
      changed[key] = undefined;
      isChanged = true;
    }
  }

  if (after) {
    for (const key of Object.keys(after)) {
      if (after[key] !== before[key]) {
        changed[key] = after[key];
        isChanged = true;
      }
    }
  }

  return isChanged ? changed : undefined;
};

type Props = Record<string, unknown>;
type HostContext = {};
type UpdatePayload = {
  props: Props | undefined;
};
type TimeoutHandle = ReturnType<typeof setTimeout>;

export default createReconciler<
  ElementNames,
  Props,
  DOMElement,
  DOMElement,
  TextNode,
  DOMElement,
  unknown,
  unknown,
  HostContext,
  UpdatePayload,
  unknown,
  TimeoutHandle,
  unknown
>({
  getRootHostContext() {
    return {};
  },
  prepareForCommit: () => null,
  resetAfterCommit: () => null,
  preparePortalMount: () => null,
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  clearContainer: () => false,
  createInstance(type, props, _rootContainer, _hostContext, _internalHandle) {
    const node = createNode(type);

    for (const [key, value] of Object.entries(props)) {
      if (key === "children") {
        continue;
      }

      setAttribute(node, key, value as DOMNodeAttribute);
    }

    return node;
  },
  createTextInstance(text, _rootContainer, _hostContext, _internalHandle) {
    return createTextNode(text);
  },
  appendInitialChild: appendChildNode,
  appendChild: appendChildNode,
  appendChildToContainer: appendChildNode,
  removeChildFromContainer: removeChildNode,
  finalizeInitialChildren: () => false,
  prepareUpdate(
    _instance,
    _type,
    oldProps,
    newProps,
    _rootContainer,
    _hostContext,
  ) {
    const props = diff(oldProps, newProps);

    if (!props) {
      return null;
    }

    return { props };
  },
  commitUpdate(
    instance,
    { props },
    _type,
    _prevProps,
    _nextProps,
    _internalHandle,
  ) {
    if (props) {
      for (const [key, value] of Object.entries(props)) {
        setAttribute(instance, key, value as DOMNodeAttribute);
      }
    }
  },
  shouldSetTextContent: () => false,
  getChildHostContext(parentHostContext, _type, _rootContainer) {
    return parentHostContext;
  },
  getPublicInstance(instance) {
    return instance;
  },
  scheduleTimeout(fn, delay) {
    return setTimeout(fn, delay);
  },
  cancelTimeout(id) {
    clearTimeout(id);
  },
  noTimeout: null,
  supportsMicrotasks: false,
  isPrimaryRenderer: true,
  getCurrentEventPriority: () => DefaultEventPriority,
  getInstanceFromNode: () => null,
  prepareScopeUpdate() {},
  getInstanceFromScope: () => null,
  beforeActiveInstanceBlur() {},
  afterActiveInstanceBlur() {},
  detachDeletedInstance() {},
});
