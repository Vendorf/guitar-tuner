#!/bin/bash
# abort if fail
set -e

npx vite build --base=/guitar-tuner
git add dist -f
git commit -m "Redeploy site"
git subtree push --prefix dist origin gh-pages