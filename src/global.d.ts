declare global {
  namespace JSX {
    interface IntrinsicElements {
      "hcl-block": any;
    }
  }
}

declare namespace TfReact {
  type Block = {
    type: string; // e.g. "resource"
    labels?: string[]; // e.g. ["aws_instance", "web"]
    args?: Record<string, any>; // e.g. { ami: "abc123" }
  };
}

export {}; // Treat this file as a module
