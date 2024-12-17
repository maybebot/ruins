import { DataPoint } from "~/api/files";

export default eventHandler(async (event) => {
  const { data } = await $fetch("/api/files");
  const { data: grouped } = await $fetch("/api/files?grouped=1");

  const toCard = (name: string, content: DataPoint[]) => {
    return `<pyro-card header="${name}">
    <pyro-scrollbox slot="content" style="max-height: 40vh;" >
      <div style="display: grid; grid-template-columns: 3fr 1fr 1fr;">
        <span>Name</span>
        <span style="text-align: right;">Warnings</span>
        <span style="text-align: right;">Errors</span>
      ${content
        .map(
          (line) =>
            `
              <span title="${line.name}">${line.name.slice(-20)}</span>
              <span style="text-align: right;">${line.warning}</span>
              <span style="text-align: right;">${line.error}</span>
            `
        )
        .join("")}
      </div>
    <pyro-scrollbox>
    </pyro-card>`;
  };

  const body = toCard("Files", data) + toCard("Grouped", grouped);
  return html(`${body}`);
});
