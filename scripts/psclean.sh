#!/usr/bin/env bash
set -e -v
echo osascript -e 'quit app "Terminal"'; osascript -e 'quit app "Terminal"'
echo killall gulp; killall gulp
echo killall sh; killall sh
echo killall ionic; killall ionic
ps
