#!/bin/bash

# Exit the script if any command fails
set -e

# Build the package
echo "Building & pack"
pnpm build
pnpm pack

# Get the name of the packed file (assuming there's only one .tgz file)
PACKAGE_FILE=$(ls *.tgz)

# Move and install in test folder
echo "Moving package to test folder..."
mv "$PACKAGE_FILE" ../pyro/
cd ../pyro/
npm install "$PACKAGE_FILE"
rm "$PACKAGE_FILE"
npx ruins tried