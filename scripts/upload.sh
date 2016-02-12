#!/usr/bin/env bash
# First be sure the build is current!
/usr/bin/expect <<EOD
spawn ionic upload
expect "Email:"
send "chaynes56@gmail.com"
expect "Password:"
send "sgsdatta"
expect "Logged in!"
expect "Saved api_key"
EOD
