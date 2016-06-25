#!/bin/bash
echo enter monitor directory and install dependency for monitor function...
set -ex
cd ../monitor && npm install
if [ $? -eq 0 ];
then
    echo install complete successfully.
    exit 0
else
    echo some error happen, Dependency install fail...
    exit 1
fi
cd ../Deploy
