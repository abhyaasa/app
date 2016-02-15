#!/usr/bin/env bash
/usr/bin/expect <<EOD
spawn ionic upload
expect "Email:"
send "chaynes56@gmail.com"
expect "Password:"
send "sgsdatta"
expect "Logged in!"
expect "Saved api_key"
EOD
