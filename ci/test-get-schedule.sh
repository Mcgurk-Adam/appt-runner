#!/bin/bash
npm i
cd commands/get-times || exit 1
../../node_modules/.bin/tsc
cd ../.. || exit 1
if [ -z "$1" ]
then
  DATE_TO_PASS=$(date "+%m/%d/%Y")
else
  DATE_TO_PASS="$1"
fi
node commands/get-times/index.js "$DATE_TO_PASS" --dry-run