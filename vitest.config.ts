import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // `server-only` throws outside RSC; stub it so server modules are testable.
      "server-only": fileURLToPath(
        new URL("./src/test/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
});
