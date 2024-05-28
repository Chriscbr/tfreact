import { useState } from "react";

export function useAttributes() {
  const [resourceRef, setResourceRef] = useState<any>(null);
  const thunk: Record<string, any> = new Proxy(
    {},
    {
      get: (_, key: string) => {
        return () => {
          if (resourceRef === null) {
            throw new Error("Resource not set");
          }
          if (resourceRef.attributes.type !== "resource") {
            throw new Error("Expected node to be a resource");
          }
          if (resourceRef.attributes.labels == null) {
            throw new Error("Expected resource to have labels");
          }
          return (
            "${" +
            resourceRef.attributes.labels[0] +
            "." +
            resourceRef.attributes.labels[1] +
            "." +
            key +
            "}"
          );
        };
      },
    },
  );
  return [thunk, (ref: JSX.Element | null) => setResourceRef(ref)] as const;
}
