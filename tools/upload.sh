/usr/bin/expect <<EOD
spawn ionic upload
expect "Email:"
send "chaynes56@gmail.com"
expect "Password:"
send "sgsdatta"
expect "Logged in!"
expect "Uploading app...."
EOD
