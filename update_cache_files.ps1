# Updates /public/assets/js/app-files.json with the files to cache 
# using the Service Worker (/public/assets/js/services/sw.js)

$files = Get-ChildItem -Path "./public" -Recurse -File -exclude *.scss | ForEach-Object { 
  (Resolve-Path $_.FullName -Relative) -replace '.\\public\\','/' -replace '\\','/' 
}
$files | ConvertTo-Json | Out-File "./public/assets/js/services/app-files.json" -Encoding Ascii