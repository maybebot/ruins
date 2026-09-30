#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
TEST_DIR=${RUINS_TRY_DIR:-"$ROOT_DIR/../monogon"}

if [[ ! -d "$TEST_DIR" ]]; then
	printf 'Try project not found: %s\n' "$TEST_DIR" >&2
	exit 1
fi

VERSION=$(node -e 'console.log(JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")).version)' "$ROOT_DIR/package.json")
PACKAGE_FILE="$ROOT_DIR/ruins-$VERSION-$(date +%s).tgz"

echo "Building Ruins package"
pnpm --dir "$ROOT_DIR" build
pnpm --dir "$ROOT_DIR" pack --out "$PACKAGE_FILE"

echo "Installing package in $TEST_DIR"
pnpm --dir "$TEST_DIR" add "$PACKAGE_FILE"
pnpm --dir "$TEST_DIR" exec ruins