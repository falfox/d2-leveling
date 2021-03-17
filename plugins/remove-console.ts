import { Plugin } from "vite";
const fileRegex = /\.(ts|tsx)$/;

export default function removeConsolePlugin(): Plugin {
  return {
    name: "remove-console",
    apply: "build",
    enforce: "pre",

    transform(src, id) {
      if (fileRegex.test(id)) {
        return {
          code: src.replace(
            /console.(log|debug|info|...|count)\([^)]+\);?/g,
            ""
          ),
          map: null, // provide source map if available
        };
      }
    },
  };
}
