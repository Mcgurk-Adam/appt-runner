#!/bin/bash
npm i
cd commands/schedule-time || exit 1
../../node_modules/.bin/tsc
cd ../.. || exit 1
if [ -z "$1" ]
then
  DATE_TO_PASS=$(date "+%m/%d/%Y")
  TIME_TO_PASS="6:00"
else
  DATE_TO_PASS="$1"
  if [ -z "$2" ]
  then
    TIME_TO_PASS="6:00"
  else
    TIME_TO_PASS="$2"
  fi
fi
node commands/schedule-time/index.js "$DATE_TO_PASS" "$TIME_TO_PASS" --dry-run