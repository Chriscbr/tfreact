import React from "react";
import { expect, test } from "vitest";
import { renderToString } from "./helpers";
import { Resource, useAttributes } from "../src";

test("<Resource> with simple attributes", () => {
  const output = renderToString(
    <Resource
      type="aws_instance"
      id="web"
      args={{ ami: "abc123", instance_type: "t2.micro" }}
    />,
  );
  expect(output).toEqual(`resource "aws_instance" "web" {
  ami = "abc123"
  instance_type = "t2.micro"
}`);
});

test("<Resource> with can reference each other", () => {
  function App() {
    const [iamRole, setIamRole] = useAttributes();
    const [instanceProfile, setInstanceProfile] = useAttributes();
    const [iamRolePolicy, setIamRolePolicy] = useAttributes();
    const [_instance, setInstance] = useAttributes();

    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: "s3:*",
        },
      ],
    };

    return (
      <>
        <Resource
          type="aws_iam_role"
          id="example"
          args={{ assume_role_policy: "..." }}
          ref={setIamRole}
        />
        <Resource
          type="aws_iam_instance_profile"
          id="example"
          args={{ role: iamRole.name }}
          ref={setInstanceProfile}
        />
        <Resource
          type="aws_iam_role_policy"
          id="example"
          args={{ role: iamRole.name, policy: JSON.stringify(policy) }}
          ref={setIamRolePolicy}
        />
        <Resource
          type="aws_instance"
          id="example"
          args={{
            ami: "ami-a1b2c3d4",
            instance_type: "t2.micro",
            iam_instance_profile: instanceProfile.name,
            depends_on: [iamRolePolicy.name],
          }}
          ref={setInstance}
        />
      </>
    );
  }

  const output = renderToString(<App />);
  expect(output).toEqual(`resource "aws_iam_role" "example" {
  assume_role_policy = "..."
}

resource "aws_iam_instance_profile" "example" {
  role = "\${aws_iam_role.example.name}"
}

resource "aws_iam_role_policy" "example" {
  role = "\${aws_iam_role.example.name}"
  policy = "{\\"Version\\":\\"2012-10-17\\",\\"Statement\\":[{\\"Effect\\":\\"Allow\\",\\"Action\\":\\"s3:*\\"}]}"
}

resource "aws_instance" "example" {
  ami = "ami-a1b2c3d4"
  instance_type = "t2.micro"
  iam_instance_profile = "\${aws_iam_instance_profile.example.name}"
  depends_on = [null]
}`);
});
