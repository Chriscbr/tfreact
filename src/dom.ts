type TfReactNode = {
  parentNode: DOMElement | undefined;
};

export type TextName = "#text";
export type ElementNames = "hcl-root" | "hcl-block";

export type NodeNames = ElementNames | TextName;

// eslint-disable-next-line @typescript-eslint/naming-convention
export type DOMElement = {
  nodeName: ElementNames;
  attributes: Record<string, DOMNodeAttribute>;
  childNodes: DOMNode[];
} & TfReactNode;

export type TextNode = {
  nodeName: TextName;
  nodeValue: string;
} & TfReactNode;

// eslint-disable-next-line @typescript-eslint/naming-convention
export type DOMNode<T = { nodeName: NodeNames }> = T extends {
  nodeName: infer U;
}
  ? U extends "#text"
    ? TextNode
    : DOMElement
  : never;

// eslint-disable-next-line @typescript-eslint/naming-convention
// export type DOMNodeAttribute = boolean | string | number;
export type DOMNodeAttribute = any;

export const createNode = (nodeName: ElementNames): DOMElement => {
  const node: DOMElement = {
    nodeName,
    attributes: {},
    childNodes: [],
    parentNode: undefined,
  };

  return node;
};

export const appendChildNode = (
  node: DOMElement,
  childNode: DOMElement,
): void => {
  if (childNode.parentNode) {
    removeChildNode(childNode.parentNode, childNode);
  }

  childNode.parentNode = node;
  node.childNodes.push(childNode);
};

export const removeChildNode = (
  node: DOMElement,
  removeNode: DOMNode,
): void => {
  removeNode.parentNode = undefined;

  const index = node.childNodes.indexOf(removeNode);
  if (index >= 0) {
    node.childNodes.splice(index, 1);
  }
};

export const setAttribute = (
  node: DOMElement,
  key: string,
  value: DOMNodeAttribute,
): void => {
  node.attributes[key] = value;
};

export const createTextNode = (text: string): TextNode => {
  const node: TextNode = {
    nodeName: "#text",
    nodeValue: text,
    parentNode: undefined,
  };

  setTextNodeValue(node, text);

  return node;
};

export const setTextNodeValue = (node: TextNode, text: string): void => {
  if (typeof text !== "string") {
    text = String(text);
  }

  node.nodeValue = text;
};

export function renderNode(rootNode: DOMElement): string {
  const children = rootNode.childNodes.map((child) => {
    if (child.nodeName === "#text") {
      return child.nodeValue;
    }

    if (child.nodeName === "hcl-block") {
      const attributes = child.attributes;
      const type: string = attributes["type"];
      const labels: string = attributes["labels"]
        .map((label: string) => `"${label}"`)
        .join(" ");
      const args: string = Object.entries(attributes["args"])
        .map(([key, value]) => `  ${key} = ${JSON.stringify(value)}`)
        .join("\n");
      return `${type} ${labels} {\n${args}\n}`;
    }

    throw new Error(`Unsupported node: ${child.nodeName}`);
  });

  return children.join("");
}
