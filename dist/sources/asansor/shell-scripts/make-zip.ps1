param([string]$folderPath,[string]$zipPath);

# # Create a zip file with the contents of C:\Stuff\
Compress-Archive -Path $folderPath -Update -DestinationPath $zipPath  -CompressionLevel Optimal | Invoke-Expression;
Start-Sleep -Milliseconds 5000
# Get-ChildItem -Path $folderPath -Recurse | Remove-Item -force -recurse
# Remove-Item $folderPath -Force
# # Add more files to the zip file
# # (Existing files in the zip file with the same name are replaced)
# Compress-Archive -Path C:\OtherStuff\*.txt -Update -DestinationPath archive.zip