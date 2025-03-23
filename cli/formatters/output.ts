import type { EslintOutput, RuinsEslintOutput } from "../../types/eslint.js";

export default (output: EslintOutput) => {
  const projectDir = process.cwd();
  const res: RuinsEslintOutput = {
    issues: output
      .filter((r) => r.messages.length > 0)
      .map((r) => ({
        filePath: r.filePath.replace(projectDir, "").substring(1),
        messages: r.messages.map((m) => ({
          ruleId: m.ruleId,
          severity: m.severity,
          message: m.message,
          line: m.line,
        })),
        errorCount: r.errorCount,
        fatalErrorCount: r.fatalErrorCount,
        warningCount: r.warningCount,
        fixableErrorCount: r.fixableErrorCount,
        fixableWarningCount: r.fixableWarningCount,
      })),
  };
  return JSON.stringify(res, null, 2);
};
