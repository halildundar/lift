param([string]$filePath, [string]$destZip);
Compress-Archive -Path $filePath -Update -DestinationPath $destZip -CompressionLevel Optimal | Invoke-Expression;