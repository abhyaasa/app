#!/usr/bin/env sh
# Programmatically launch terminal app with a specified command and custom colors.
# Used by gulp itest.
# From http://stackoverflow.com/questions/4404242
echo '
on run argv
  if length of argv is equal to 0
    set command to ""
  else
    set command to item 1 of argv
  end if

  if length of argv is greater than 1
    set profile to item 2 of argv
    runWithProfile(command, profile)
  else
    runSimple(command)
  end if
end run

on runSimple(command)
  tell application "terminal"
    activate
    set newTab to do script(command)
  end tell
  return newTab
end runSimple

on runWithProfile(command, profile)
  set newTab to runSimple(command)
  tell application "terminal" to set current settings of newTab to (first settings set whose name is profile)
end runWithProfile
' | osascript - "$@" > /dev/null
