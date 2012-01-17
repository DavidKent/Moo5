@Echo off
echo [MSG] Press any key to load the server.
pause>nul
TITLE Server
"server/node.exe" server/main.js
set /p vAr= <cont.ctr
if %vAr%==0 GOTO :DIE
if %vAr%==1 GOTO :RST
if %vAr%==2 GOTO :STR
 :STR
  //start chrome.exe --new-tab-page-1 "http://127.0.0.1:1337/"
 :END
 :RST
   server
 :END
 :DIE
 pause
