import React from "react";
import { expect, test } from "vitest";
import { renderToString } from "./helpers";
import { Resource, useAttributes } from "../src";
import { useNamedResources } from "../src/components/useAttributes";
import { AutoResource } from "../src/components/Resource";

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

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace aws {
  type IamRoleProps = {
    id: string | (() => [any, string]);
    assume_role_policy: string;
  };
  export function IamRole({ id, assume_role_policy }: IamRoleProps) {
    return (
      <AutoResource type="aws_iam_role" id={id} args={{ assume_role_policy }} />
    );
  }

  type IamInstanceProfile = {
    id: string | (() => [any, string]);
    role: string;
  };
  export function IamInstanceProfile({ id, role }: IamInstanceProfile) {
    return (
      <AutoResource type="aws_iam_instance_profile" id={id} args={{ role }} />
    );
  }

  type IamRolePolicy = {
    id: string | (() => [any, string]);
    role: string;
    policy: string;
  };
  export function IamRolePolicy({ id, role, policy }: IamRolePolicy) {
    return (
      <AutoResource
        type="aws_iam_role_policy"
        id={id}
        args={{ role, policy }}
      />
    );
  }

  type Instance = {
    id: string | (() => [any, string]);
    ami: string;
    instance_type: string;
    iam_instance_profile: string;
    depends_on: string[];
  };
  export function Instance({
    id,
    ami,
    instance_type,
    iam_instance_profile,
    depends_on,
  }: Instance) {
    return (
      <AutoResource
        type="aws_instance"
        id={id}
        args={{ ami, instance_type, iam_instance_profile, depends_on }}
      />
    );
  }
}

test("<Resource> with namer", () => {
  function App() {
    const [named, { myRole, myInstanceProfile, myRolePolicy }] =
      useNamedResources();

    const policy = {
      Version: "2012-10-17",
      Statement: [{ Effect: "Allow", Action: "s3:*" }],
    };

    return (
      <>
        <aws.IamRole id={named("myRole")} assume_role_policy="..." />
        <aws.IamInstanceProfile
          id={named("myInstanceProfile")}
          role={myRole.name}
        />
        <aws.IamRolePolicy
          id={named("myRolePolicy")}
          role={myRole.name}
          policy={JSON.stringify(policy)}
        />
        <aws.Instance
          id="myInstance"
          ami="ami-a1b2c3d4"
          instance_type="t2.micro"
          iam_instance_profile={myInstanceProfile.name}
          depends_on={[myRolePolicy.name]}
        />
      </>
    );
  }

  const output = renderToString(<App />);
  expect(output).toEqual(`resource "aws_iam_role" "myRole" {
  assume_role_policy = "..."
}

resource "aws_iam_instance_profile" "myInstanceProfile" {
  role = "\${aws_iam_role.myRole.name}"
}

resource "aws_iam_role_policy" "myRolePolicy" {
  role = "\${aws_iam_role.myRole.name}"
  policy = "{\\"Version\\":\\"2012-10-17\\",\\"Statement\\":[{\\"Effect\\":\\"Allow\\",\\"Action\\":\\"s3:*\\"}]}"
}

resource "aws_instance" "myInstance" {
  ami = "ami-a1b2c3d4"
  instance_type = "t2.micro"
  iam_instance_profile = "\${aws_iam_instance_profile.myInstanceProfile.name}"
  depends_on = [null]
}`);
});
