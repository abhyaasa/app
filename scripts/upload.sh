#!/usr/bin/env bash
echo "Cancell this if the build is not current"
echo "or the app has not been deleted your ionic view website."
/usr/bin/expect <<EOD
spawn ionic upload
expect "Email:"
send "chaynes56@gmail.com"
expect "Password:"
send "sgsdatta"
expect "Logged in!"
expect "Saved api_key"
EOD
