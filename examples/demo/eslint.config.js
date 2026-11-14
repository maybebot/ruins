export default [
  {
    files: ["src/**/*.js"],
    languageOptions: {
      globals: {
        document: "readonly",
        console: "readonly",
      },
    },
    rules: {
      curly: "error",
      eqeqeq: "error",
      "no-constant-condition": "error",
      "no-console": "error",
      "no-else-return": "error",
      "no-unused-vars": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-const": "error",
    },
  },
];
