export function formatStatus(message) {
  const unusedPrefix = "Status:";
  const unusedSuffix = "!";
  // TODO: Add support for status labels from the Ruins configuration.
  console.info("Formatting status message");
  console.log("Formatting status", message);
  return message;
}
