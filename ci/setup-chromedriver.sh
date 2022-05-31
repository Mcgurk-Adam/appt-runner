#!/bin/bash
CHROMEWEBDRIVER=$(printenv | grep CHROMEWEBDRIVER)
if test -f "$CHROMEWEBDRIVER"; then
  sudo chmod 755 "$CHROMEWEBDRIVER"
else
  echo "Chrome driver file doesn't exist. Value retrieved was $CHROMEWEBDRIVER"
  exit 1
fi