import { useRef, useState } from "react";

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

export function useNamedResources() {
  const resourceRefs = useRef<Record<string, any>>({}); // { name: ref }

  // useNamedResources returns a tuple of two values:
  // first, a function that can be use to name resources, returning both
  // a ref that can be used in the "ref" of the resource, and a name that can be used in the "id" of the resource
  const named = (name: string) => {
    const handleRef = (ref: JSX.Element | null) => {
      resourceRefs.current[name] = ref;
    };
    return (() => [handleRef, name]) as () => [any, string];
  };

  // second, a thunk object that can be used to reference any named resource that will be created
  const superThunk: Record<string, any> = new Proxy(
    {},
    {
      get: (_, resourceName: string) => {
        // return another proxy that can return any attribute of any resource
        const thunk: Record<string, any> = new Proxy(
          {},
          {
            get: (_, key: string) => {
              return () => {
                const resourceRef = resourceRefs.current[resourceName];
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
        return thunk;
      },
    },
  );
  return [named, superThunk] as const;
}
