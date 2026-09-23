import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // 项目现状:大量 server action 使用 (t: any) 形式访问 ORM 结果,暂降为警告
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Prisma 8 generated artifacts and migration snapshots
    "src/prisma/contract.json",
    "src/prisma/contract.d.ts",
    "migrations/**",
  ]),
]);

export default eslintConfig;
