#!/bin/bash
DRIVER="${CHROMEWEBDRIVER}"
if [ -f "$DRIVER" ]; then
  sudo chmod 755 "$DRIVER"
else
  echo "Chrome driver file doesn't exist. Value retrieved was $DRIVER"
  exit 1
fi