
#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

screen -L cardMaker.log -S cardMaker -dm bash -c "node server.js"

screen -ls
