#!/bin/sh

rm -rf dist

# apps/ui is disconnected in tsdown, and the nitro .output needs to be included
# // TODO: find better solution
pnpm exec tsdown

(cd apps/ui; pnpm run build)

mv ./apps/ui/.output ./dist