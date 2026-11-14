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
      "no-console": "error",
      "no-unused-vars": "error",
    },
  },
];
