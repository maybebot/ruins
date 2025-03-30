import { RuinsOutput } from "../../../../types/ruins";
import { RuinsEslintMessage } from "../../../../types/eslint";

interface MessageWithFile extends RuinsEslintMessage {
  file?: string;
}

type Rules = Record<string, MessageWithFile[]>;
export type RulesRes = RuinsOutput<Rules>;

export default eventHandler(async (): Promise<RulesRes> => {
  const lint = await $fetch("/api/data");
  if (!lint.meta) {
    throw createError({
      status: 204,
      statusMessage: "No file",
    });
  }

  const groupedIssues = lint.issues.reduce((acc, issue) => {
    issue.messages.forEach((message) => {
      const ruleId = message.ruleId || "no-rule";
      if (!acc[ruleId]) {
        acc[ruleId] = [];
      }
      acc[ruleId].push({
        file: issue.filePath,
        ...message,
      });
    });
    return acc;
  }, {} as Rules);

  return { data: groupedIssues };
});
