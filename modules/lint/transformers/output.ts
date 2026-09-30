import type { EslintOutput, RuinsEslintOutput } from "./types.js";
import { isAbsolute, relative, sep } from "node:path";

/** Eslint-compatible formatter for `eslint -f` flag */
export default (output: EslintOutput) => {
  const projectDir = process.cwd();
  const res: RuinsEslintOutput = {
    meta: { timestamp: Date.now() },
    issues: output
      .filter((r) => r.messages.length > 0)
      .map((result) => ({
        filePath: (isAbsolute(result.filePath)
          ? relative(projectDir, result.filePath)
          : result.filePath
        )
          .split(sep)
          .join("/"),
        messages: result.messages.map((message) => ({
          ruleId: message.ruleId,
          severity: message.severity,
          message: message.message,
          line: message.line,
        })),
        errorCount: result.errorCount,
        fatalErrorCount: result.fatalErrorCount,
        warningCount: result.warningCount,
        fixableErrorCount: result.fixableErrorCount,
        fixableWarningCount: result.fixableWarningCount,
      })),
  };
  return JSON.stringify(res, null, 2);
};
