Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd.exe /c cd /d """ & CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) & """ && npx electron .", 0, False
