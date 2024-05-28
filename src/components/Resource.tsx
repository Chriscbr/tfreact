import React, { forwardRef } from "react";

export type ResourceProps = {
  readonly type: string;
  readonly id: string;
  readonly args?: Record<string, any>;
};

export const Resource = forwardRef<React.ReactElement, ResourceProps>(
  function Resource({ type, id, args }: ResourceProps, ref): JSX.Element {
    return (
      <hcl-block type="resource" labels={[type, id]} args={args} ref={ref} />
    );
  },
);
