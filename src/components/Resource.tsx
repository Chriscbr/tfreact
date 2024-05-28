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

export type AutoResourceProps = {
  readonly type: string;
  readonly id: string | (() => [any, string]);
  readonly args?: Record<string, any>;
};

export function AutoResource({
  type,
  id,
  args,
}: AutoResourceProps): JSX.Element {
  if (typeof id === "string") {
    return <Resource type={type} id={id} args={args} />;
  } else {
    // assume id is a function
    const [handleRef, actualId] = id();
    return <Resource type={type} id={actualId} args={args} ref={handleRef} />;
  }
}
