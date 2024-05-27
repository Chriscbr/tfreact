import { ReactNode } from "react";
import reconciler from "./reconciler";
import * as dom from "./dom";
import * as fs from "node:fs";

function render(node: ReactNode): string;
function render(node: ReactNode, filename: string): undefined;
function render(node: ReactNode, filename?: string) {
  const rootNode = dom.createNode("hcl-root");

  const container = reconciler.createContainer(
    rootNode,
    // Legacy mode
    0,
    null,
    false,
    null,
    "id",
    () => {},
    null,
  );
  reconciler.updateContainer(node, container);

  const result = dom.renderNode(rootNode);

  if (filename) {
    writeToFile(filename, result);
  } else {
    return result;
  }
}

const writeToFile = (filename: string, content: string): void => {
  fs.writeFileSync(filename, content);
};

export default render;
