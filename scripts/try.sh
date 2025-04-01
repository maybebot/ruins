#!/bin/bash

# Exit the script if any command fails
set -e

# Build the package
echo "Building & pack"
npm run build
npm pack

# Get the name of the packed file (assuming there's only one .tgz file)
PACKAGE_FILE=$(ls *.tgz)

echo "# Installing in pyro"
cd ../pyro/
npm install -D ../ruins/"$PACKAGE_FILE"
cd ../ruins/


# Removal
rm "$PACKAGE_FILE"

# Undo git changes to package.json and lock files
