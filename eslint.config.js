import js from "@eslint/js";

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.js", "*.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        BdApi: "readonly",
        URL: "readonly",
        clearInterval: "readonly",
        console: "readonly",
        document: "readonly",
        globalThis: "readonly",
        process: "readonly",
        setInterval: "readonly"
      }
    }
  }
];
