import React from "react";
import { expect, test } from "vitest";
import { renderToString } from "./helpers";
import { Resource } from "../src";

test("<Resource> with simple attributes", () => {
  const output = renderToString(
    <Resource type="aws_instance" id="web" args={{ ami: "abc123" }} />,
  );
  expect(output).toEqual(`resource "aws_instance" "web" {
  ami = "abc123"
}`);
});
