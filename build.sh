#!/usr/bin/env bash
#Todo in case we need to deploy the whiteboard app
[ -f ~/.bash_aliases ] && source ~/.bash_aliases
[ -f ~/.nvm/nvm.sh ] && source ~/.nvm/nvm.sh
nvm --version || curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash
nvm install 6.12.1
npm prune
npm install
if [ "$1" != "production" ]; then
    grunt doc:generate
fi;
pm2 startOrRestart ecosystem.json5 --env $1
