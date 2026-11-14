# Ruins demo

This small frontend intentionally contains ESLint errors and a TODO. To see the
page, run `python3 -m http.server 8000` from this directory and open
`http://localhost:8000`.

From the repository root, install the demo's dependencies and run the local
package through the interactive picker:

```sh
pnpm --dir examples/demo install
pnpm try
```

The try script builds and packs Ruins, installs the resulting tarball into the
demo, and opens the picker. It changes the demo's `package.json` and lockfile
and leaves a versioned tarball in the repository root, overwriting it on
subsequent runs for the same version. The lockfile can still change when the
package contents change. Set `RUINS_TRY_DIR` to use a different project. After
installation, run commands directly from the demo:

```sh
cd examples/demo
pnpm exec ruins --lint-update
pnpm exec ruins --todo-update
pnpm exec ruins --dashboard
```

Lint collection writes `.ruins/lint-issues.json` and
`.ruins/lint-ignores.js`. To try downgrading the collected errors to warnings,
import `ruinsIgnores` from `./.ruins/lint-ignores.js` in `eslint.config.js`.
Change the existing `export default [...]` to `const config = [...]`, then add
`export default [...config, ...ruinsIgnores];` and run `pnpm lint`. Collection
resets and regenerates the ignores on each run. The `.ruins/` directory is
ignored so generated state does not become part of the fixture.

TODO collection uses `git grep`, so the demo source files must be tracked or
staged before running it. The intentionally faulty source files remain unchanged
by collection and can be used again.
