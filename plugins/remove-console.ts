import { Plugin } from "vite";
const fileRegex = /\.(ts|tsx)$/;

export default function removeConsolePlugin(): Plugin {
  return {
    name: "remove-console",
    apply: "build",

    transform(src, id) {
      if (fileRegex.test(id)) {
        console.log(`Removing console.* from ${id}`);

        return {
          code: src.replace(
            /console.(log|debug|info|...|count)\([^)]+\);?/,
            ""
          ),
          map: null, // provide source map if available
        };
      }
    },
  };
}
