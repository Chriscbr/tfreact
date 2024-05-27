import render from "../src/render";

export function renderToString(node: JSX.Element): string {
  return render(node);
}
