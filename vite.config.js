import { defineConfig } from "vite";
import { readFileSync } from "fs";

export default defineConfig(({ command, mode }) => {
  if (command === "serve") {
    return {
      server: {
        host: true,
        port: 1673,
      },
    };
  } else {
    return {};
  }
});
