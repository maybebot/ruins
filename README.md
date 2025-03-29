# ruins

> [!IMPORTANT]
> This is in early alpha. Do not use if you don't know what you're doing

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

## TODOs (alpha)

```js
// TODO(created=2025-03-26, author= ian): make vergil happy
```

## Config (beta)

While ruins works out-of-the-box with no configuration, a growing list of aspects can be configured with a `ruins.config.js` file in your root directory.

```js
// ruins.config.js
export default {
  dir: ".ruins", // directory where files are stored. Not recommended to .gitignore it
  eslint: {
    preferOff: false, // disabled errors will be turned "off" instead of the default "error"
  },
  group: {
    // in the ui, shows these directories, grouping issues in them together
    dirs: ["src/components/", "src/utils", "api/"],
  },
};
```

## Known issues

- Error while running collection commands:
  `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '[...]/.ruins/ignores.js' imported from [...]/eslint.config.mjs`
  Solution: temporarily remove/comment out usage of ruins ignores in your eslint config.

- Very slow TODO collection
  No solution. I should have used grep. Will be fixed

- Bad UI/Dashboard
  Will be fixed

---

Made with 🍕 in Amsterdam.
