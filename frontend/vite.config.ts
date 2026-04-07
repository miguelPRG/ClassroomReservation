import { transformAsync } from "@babel/core";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type PluginOption } from "vite";

function reactCompilerPlugin(): PluginOption {
  return {
    name: "react-compiler-babel-pass",
    enforce: "post",
    async transform(code, id) {
      if (!/\.(t|j)sx$/.test(id) || id.includes("node_modules")) {
        return null;
      }

      const result = await transformAsync(code, {
        filename: id,
        babelrc: false,
        configFile: false,
        sourceMaps: true,
        plugins: [["babel-plugin-react-compiler", { target: "19" }]],
      });

      return result?.code
        ? {
            code: result.code,
            map: result.map,
          }
        : null;
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), reactCompilerPlugin()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
