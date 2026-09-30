import { defineConfig } from "eslint/config";
import next from "eslint-config-next";

export default defineConfig([
  {
    ignores: [".next/**", ".next-dev/**", "node_modules/**"],
  },
  ...next,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "@next/next/no-img-element": "off",
    },
  },
]);

