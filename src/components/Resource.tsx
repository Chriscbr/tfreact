import React from "react";

export type Props = {
  readonly type: string;
  readonly id: string;
  readonly args?: Record<string, any>;
};

export default function Resource({ type, id, args }: Props) {
  return <hcl-block type="resource" labels={[type, id]} args={args} />;
}
