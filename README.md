# ruins

> [!IMPORTANT]
> This is in beta. Not everything is ironed out and some modules might misbehave

A CLI tool to track tech debt and aid in migration.

## Quick start

```
npm i -D ruins
```

Run the CLI

```
npx ruins
```

## Linting (eslint)

If you're using eslint rules to aid in you migration you might have faced the probelm: how to introduce an error level rule that will forbid breaking a certain rule in new code, while not breaking your build step in existing code, which will be migrated progressively?

Ruins allows to collect all current error level via the `[eslint] Collect errors` CLI command, and then create in a js file a list of ignores via the `[eslint] Create ignores` command. Those can be imported in your flat `eslint.config` file, and used at the end

```js
// eslint.config.js
import { ruinsIgnores } from './.ruins/ignores.js';

export default [
    // your existing rules and plugins
    {...}
    ...ruinsIgnores, // spread the ignores ruins generated, at the end
}
```

This will set the error level to `warn` instead of `error` for the files where the new rule has been broken, while keeping it at `error` for any other file.

## UI

A UI dashboard can be lauched from the CLI. It's in a rudimentary state, but gives a nicer idea of what rules have been broken then looking at the json or js files.

## TODOs (beta)

Collects TODO comments in the codebase and allows to have them contain structured metadata. An example would be:

```js
// TODO(created=2025-03-26, author= ian): make vergil happy
```

To enforce the use of this format and the created date, you can use the integrated eslint rule:

```js
// eslint.config.xx
import ruinsIgnores from 'ruins/rule-todo';

export default [
  {...}
  {
    files: ['src/**/*.ts'],
    plugins: { 'eslint-plugin-structured-todo': ruinsIgnores },
    rules: {
      'eslint-plugin-structured-todo/no-unstructured-todo': 'warn',
    },
  },
}
```

## Config (beta)

While ruins works out-of-the-box with no configuration, a growing list of aspects can be configured with a `ruins.config.js`(or `.ts`) file in your root directory.

```ts
// ruins.config.ts
import type { RuinsConfig } from 'ruins';

const config: RuinsConfig = {
  dir: ".ruins", // directory where files are stored. Not recommended to .gitignore it
  eslint: {
    preferOff: false, // disabled errors will be turned "off" instead of the default "error"
    filenameOnly: boolean; // identify files by filename only, not path. Inaccurate, useful only if making big directory changes
  },
  group: {
    // in the ui, shows these directories, grouping issues in them together
    dirs: ["src/components/", "src/utils", "api/"],
  },
};
export default config
```

---

Made with 🍕 in Amsterdam.
