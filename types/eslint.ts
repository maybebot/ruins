export type EslintOutput = Array<{
  filePath: string;
  messages: EslintMessage[];
  suppressedMessages: any[];
  errorCount: number;
  fatalErrorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  usedDeprecatedRules: any[];
  source: string;
}>;

export interface EslintMessage {
  ruleId: string;
  severity: 0 | 1 | 2;
  message: string;
  line: number;
  column: number;
  nodeType: string | null;
  messageId: string;
  endLine: number;
  endColumn: number;
}
export type RuinsEslintOutput = {
  issues: {
    filePath: string;
    messages: RuinsEslintMessage[];
    errorCount: number;
    fatalErrorCount: number;
    warningCount: number;
    fixableErrorCount: number;
    fixableWarningCount: number;
  }[];
};

interface RuinsEslintMessage {
  ruleId: string;
  severity: 0 | 1 | 2;
  message: string;
  line: number;
}
