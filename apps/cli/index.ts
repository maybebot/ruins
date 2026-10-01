import { parse } from "@bomb.sh/args";
import {
  ALTSCREEN,
  close,
  CSI,
  createInput,
  createTerm,
  grow,
  HIDECURSOR,
  MAINSCREEN,
  open,
  rgba,
  SHOWCURSOR,
  text,
  type InputEvent,
  type Op,
} from "@bomb.sh/tty";
import { log, spinner } from "@clack/prompts";
import { readConfig, RuinsConfigInternal } from "@ruins/config";
import { exec } from "child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export const cli = async () => {
  const argv = process.argv.slice(2);
  const earlyArgs = parse(argv, {
    alias: { h: "help", v: "version" },
    boolean: ["help", "version"],
  });

  if (earlyArgs.version) {
    process.stdout.write(`ruins ${await readPackageVersion()}\n`);
    return;
  }

  if (earlyArgs.help) {
    printHelp();
    return;
  }

  let config: RuinsConfigInternal;
  try {
    config = await readConfig();
  } catch (error) {
    log.error(formatError(error));
    process.exitCode = 1;
    return;
  }

  const moduleCommands = config.modules.flatMap((module) => module?.cli?.commands ?? []);
  const commands = [...moduleCommands, uiCommand];
  const runnableCommands = commands.filter((command) => command.runnable);
  const args = parse(argv, {
    alias: { h: "help" },
    boolean: ["help"].concat(commands.map(getCommandFlag)),
    string: ["run"],
  });

  const flaggedCommands = commands.filter((command) => args[getCommandFlag(command)] === true);
  if (flaggedCommands.length > 1 || (flaggedCommands.length > 0 && typeof args.run === "string")) {
    log.error("Choose one command flag or --run, not multiple commands.");
    process.exitCode = 1;
    return;
  }

  if (flaggedCommands.length === 1) {
    await executeCommand(flaggedCommands[0], config);
    return;
  }

  if (typeof args.run === "string") {
    const selectedCommand = runnableCommands.find((command) => command.value === args.run);
    if (!selectedCommand) {
      log.error(`Unknown command: ${args.run}`);
      log.info(
        `Available commands: ${runnableCommands.map((command) => command.value).join(", ")}`,
      );
      process.exitCode = 1;
      return;
    }

    await executeCommand(selectedCommand, config);
    return;
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    log.error("The interactive picker needs a TTY. Use a command flag or --run for scripted runs.");
    process.exitCode = 1;
    return;
  }

  const options = [
    ...commands.map((command) => ({
      value: command.value,
      label: command.label ?? formatCommandLabel(command.value),
      hint: command.hint,
    })),
    { value: "exit", label: "Exit Ruins", hint: "Close command center" },
  ];

  while (true) {
    const action = await pickCommand(options);
    if (action === undefined) return;
    if (action === "exit") break;

    const selectedCommand = commands.find((command) => command.value === action);
    if (!selectedCommand) continue;

    await executeCommand(selectedCommand, config, true);
  }

  log.info("Session closed.");
};

const printHelp = () => {
  process.stdout.write(
    [
      "Ruins - project command center",
      "",
      "Usage:",
      "  ruins                          Open the interactive command picker",
      "  ruins --<command-flag>         Run a command directly",
      "  ruins --help                   Show this help",
      "",
      "Command flags:",
      "  Command flags are provided by the modules enabled in ruins.config.",
      "  --run <command>                Run by command ID (legacy)",
      "",
    ].join("\n"),
  );
};

const readPackageVersion = async () => {
  let directory = dirname(resolve(process.argv[1] ?? process.cwd()));

  for (let depth = 0; depth < 6; depth += 1) {
    try {
      const manifest = JSON.parse(await readFile(resolve(directory, "package.json"), "utf8")) as {
        name?: string;
        version?: string;
      };
      if (manifest.name === "ruins" && manifest.version) return manifest.version;
    } catch {}

    const parent = dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }

  return "unknown";
};

const executeCommand = async (
  command: {
    label?: string;
    value: string;
    getAction: (config: RuinsConfigInternal) => () => void | Promise<void>;
  },
  config: RuinsConfigInternal,
  showSpinner = false,
) => {
  const label = command.label ?? command.value;
  const task = showSpinner ? spinner() : undefined;

  try {
    task?.start(label);
    await command.getAction(config)();
    task?.stop(`${label} complete`);
  } catch (error) {
    task?.stop(`${label} failed`);
    log.error(formatError(error));
    process.exitCode = 1;
  }
};

const formatError = (error: unknown) => (error instanceof Error ? error.message : String(error));

const getCommandFlag = (command: { flag?: string; value: string }) =>
  command.flag ??
  command.value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const formatCommandLabel = (value: string) =>
  value.replace(/-/g, " ").replace(/\b\w/g, (letter: string) => letter.toUpperCase());

const pickCommand = async (options: Array<{ value: string; label: string; hint?: string }>) => {
  const terminal = await createTerm({
    width: process.stdout.columns || 80,
    height: process.stdout.rows || 24,
  });
  const input = await createInput();
  const originalRawMode = process.stdin.isRaw;
  let selectedIndex = 0;

  return new Promise<string | undefined>((resolve) => {
    let escapeTimer: ReturnType<typeof setTimeout> | undefined;
    let complete = false;

    const finish = (value?: string) => {
      if (complete) return;
      complete = true;
      if (escapeTimer) clearTimeout(escapeTimer);
      process.stdin.off("data", onData);
      process.stdout.off("resize", onResize);
      process.stdin.setRawMode(originalRawMode);
      process.stdin.pause();
      process.stdout.write(Buffer.from(MAINSCREEN()));
      process.stdout.write(Buffer.from(SHOWCURSOR()));
      resolve(value);
    };

    const render = () => {
      const width = process.stdout.columns || 80;
      const ops: Op[] = [
        open("ruins-picker", {
          layout: {
            width: grow(),
            direction: "ttb",
            gap: 1,
            padding: { left: 2, right: 2, top: 1, bottom: 1 },
          },
          border: { color: rgba(167, 139, 250), left: 1, right: 1, top: 1, bottom: 1 },
          cornerRadius: { tl: 1, tr: 1, bl: 1, br: 1 },
        }),
        open("ruins-title", { layout: { direction: "ltr", gap: 2 } }),
        text("RUINS", { color: rgba(196, 181, 253) }),
        text("CODEBASE TOOLKIT", { color: rgba(190, 190, 200) }),
        close(),
      ];

      options.forEach((option, index) => {
        const active = index === selectedIndex;
        const hintWidth = Math.max(0, width - option.label.length - 17);
        const hint = option.hint && hintWidth > 5 ? truncate(option.hint, hintWidth) : "";
        ops.push(
          open(`ruins-option-${index}`, {
            layout: { width: grow(), direction: "ltr", gap: 2, padding: { left: 1, right: 1 } },
          }),
          text(active ? ">" : " ", { color: rgba(196, 181, 253) }),
          text(option.label, { color: active ? rgba(196, 181, 253) : rgba(190, 190, 200) }),
          ...(hint ? [text(hint, { color: rgba(142, 142, 154) })] : []),
          close(),
        );
      });

      ops.push(
        text("UP/DOWN MOVE   ENTER SELECT   Q/ESC QUIT", { color: rgba(142, 142, 154) }),
        close(),
      );
      const { output } = terminal.render(ops);
      process.stdout.write(Buffer.from(output));
    };

    const handleEvents = (events: InputEvent[]) => {
      for (const event of events) {
        if (event.type !== "keydown") continue;
        if (event.code === "ArrowDown") selectedIndex = (selectedIndex + 1) % options.length;
        else if (event.code === "ArrowUp") {
          selectedIndex = (selectedIndex - 1 + options.length) % options.length;
        } else if (event.code === "Enter") {
          finish(options[selectedIndex].value);
          return;
        } else if (
          event.code === "Escape" ||
          (event.code === "c" && event.ctrl) ||
          event.code === "q"
        ) {
          finish();
          return;
        } else {
          continue;
        }
        render();
      }
    };

    const onData = (chunk: Buffer) => {
      const result = input.scan(new Uint8Array(chunk));
      handleEvents(result.events);
      if (result.pending) {
        if (escapeTimer) clearTimeout(escapeTimer);
        escapeTimer = setTimeout(() => handleEvents(input.scan().events), result.pending.delay);
      }
    };

    const onResize = () => {
      terminal.update({ width: process.stdout.columns || 80, height: process.stdout.rows || 24 });
      process.stdout.write(Buffer.from(CSI("2J")));
      process.stdout.write(Buffer.from(CSI("H")));
      render();
    };

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onData);
    process.stdout.on("resize", onResize);
    process.stdout.write(Buffer.from(ALTSCREEN()));
    process.stdout.write(Buffer.from(HIDECURSOR()));
    render();
  });
};

const truncate = (value: string, width: number) =>
  value.length > width ? `${value.slice(0, width - 3)}...` : value;

const openDashboard = async (ruinsPath: string) => {
  const port = "4848";
  log.step("Starting dashboard");
  exec(`PORT=${port} node ${ruinsPath}/dist/.output/server/index.mjs`);
  log.success(`Dashboard available at http://localhost:${port}`);
};
const uiCommand = {
  flag: "dashboard",
  label: "Open Dashboard",
  value: "dashboard",
  hint: "Open a dashboard in the browser with linting errors state",
  runnable: false,
  getAction: (config: RuinsConfigInternal) => () => openDashboard(config._paths.ruins),
};
