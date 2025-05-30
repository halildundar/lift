param([string]$folderPath,[string]$IsRecursive);
Set-Location -path $folderPath;
# Set-ExecutionPolicy -ExecutionPolicy AllSigned -Scope Process
$WordApp = New-Object -ComObject Word.Application;
# Write-Host $WordApp;
$WordApp.Visible = $false;
$def = $null;
function Open-Folder {
    param (
        $filename
    );
    $DocxPath = $folderPath | Join-Path -ChildPath $filename;
    # Write-Host 'DSAD-->' $DocxPath;
    $Document = $WordApp.Documents.Open($DocxPath);
    $PdfPath = ($Document.FullName -replace "\.docx?", ".pdf");
    $JsonPath = ($Document.FullName -replace "\.docx?", ".json");
    $datas = [IO.File]::ReadLines($JsonPath) | ConvertFrom-Json;
    # $datas = Get-Content -Raw -Path  $JsonPath | ConvertFrom-Json ;
    
    foreach ($data in $datas.kelimeler) {
        $dataType = $data.type;
        [object]$item = 1;
        [object]$whichItem = 1;
        [object]$replaceAll = 2;
        [object]$forward = $true;
        [object]$matchAllWord = $true;
        [object]$matchCase = $false;
        [string]$matchText = $data.search;
        [string]$replaceText = $data.text;
        $Document.GoTo([ref] $item, [ref] $whichItem, [ref] $def) | Out-Null;
        foreach ($range in $Document.StoryRanges) {
              
            [boolean]$isResult = ($range.StoryType -eq 1) -or ($range.StoryType -eq 9) -or ($range.StoryType -eq 7) -or ($range.StoryType -eq 5);
            if ($isResult -and ($dataType -eq "text")) {
                # Write-Host "TEXT "  $matchText "-" $replaceText;
                $range.Find.Execute([ref] $matchText, [ref] $matchCase, [ref] $matchAllWord, [ref] $def, [ref] $def, [ref] $def, [ref] $forward, [ref] $def, [ref] $def, [ref] $replaceText, [ref] $replaceAll, [ref] $def, [ref] $def, [ref] $def, [ref] $def) | Out-Null;
            }
            if (($dataType -eq "image")) {
                if (($range.StoryType -eq 1)) {
                    $oldDocShapes = @();
                    foreach ($shape in $Document.Shapes) {
                        if ($shape.AlternativeText -like $matchText) {
                            $LinkToFile = $true;
                            $SaveWithDocument = $true;
                            $newShape = $Document.Shapes.AddPicture($replaceText, [ref] $LinkToFile, [ref] $SaveWithDocument, [ref] 0, [ref] 0, [ref] $shape.Width, [ref] $shape.Height, [ref] $shape.Anchor);
                            $newShape.WrapFormat.Type = $shape.WrapFormat.Type;
                            $newShape.RelativeHorizontalPosition = $shape.RelativeHorizontalPosition;
                            $newShape.Left = $shape.Left;
                            $newShape.RelativeVerticalPosition = $shape.RelativeVerticalPosition;
                            $newShape.Top = $shape.Top;
                            $oldDocShapes += $shape;
                               
                        }
                    }
                    foreach ($oldShape in $oldDocShapes) {
                        $oldShape.Delete() | Out-Null;
                    }
                }
                if (($range.StoryType -eq 9) -or ($range.StoryType -eq 7)) {
                    $section = $Document.Sections.item(1);
                    $header = $section.headers.item(1);
                    $oldHeaderFooterShapes = @();
                    foreach ($shape in $header.Shapes) {
                        if ($shape.AlternativeText -like $matchText) {
                            $LinkToFile = $true;
                            $SaveWithDocument = $true;
                            $newShape = $header.Shapes.AddPicture($replaceText, [ref] $LinkToFile, [ref] $SaveWithDocument, [ref] $shape.Top, [ref] $shape.Left, [ref] $shape.Width, [ref] $shape.Height, [ref] $shape.Anchor);
                            $newShape.WrapFormat.Type = $shape.WrapFormat.Type;
                            $newShape.RelativeHorizontalPosition = $shape.RelativeHorizontalPosition;
                            $newShape.Left = $shape.Left;
                            $newShape.RelativeVerticalPosition = $shape.RelativeVerticalPosition;
                            $newShape.Top = $shape.Top;
                            $oldHeaderFooterShapes += $shape;
                               
                        }
                    }
                    $footer = $section.footers.item(1);
                    foreach ($shape in $footer.Shapes) {
                        if ($shape.AlternativeText -like $matchText) {
                            $LinkToFile = $true;
                            $SaveWithDocument = $true;
                            $newShape = $footer.Shapes.AddPicture($replaceText, [ref] $LinkToFile, [ref] $SaveWithDocument, [ref] $shape.Top, [ref] $shape.Left, [ref] $shape.Width, [ref] $shape.Height, [ref] $shape.Anchor);
                            $newShape.WrapFormat.Type = $shape.WrapFormat.Type;
                            $newShape.RelativeHorizontalPosition = $shape.RelativeHorizontalPosition;
                            $newShape.Left = $shape.Left;
                            $newShape.RelativeVerticalPosition = $shape.RelativeVerticalPosition;
                            $newShape.Top = $shape.Top;
                            $oldHeaderFooterShapes += $shape;
                           
                        }
                    }
                    foreach ($oldHeadFootShape in $oldHeaderFooterShapes) {
                        $oldHeadFootShape.Delete() | Out-Null;
                    }
                }
            }
            if (($range.StoryType -eq 1) -and $dataType -eq "table") {
                $myTable = $Document.Tables[$matchText];
                # Write-Host "replaceText "  $replaceText.Length;
                for ($i = 0; $i -lt $replaceText.Length; $i++) {
                    $myTable.Rows.Add() | Out-Null;
                    # $objMembers = $replaceText[$i].psobject.Members | where-object membertype -like 'noteproperty' ;
                    $objMembers = $replaceText[$i] | Get-Member -MemberType NoteProperty ;
                    # Write-Host "objMembers "  $objMembers.Count;
                    for ($j = 0; $j -lt $objMembers.Count; $j++) {
                        $myTable.Rows[$i + 2].Cells[$j + 1].Range.Text = $objMembers[$j].Value;
                    }
       
                }
            }
            if (($range.StoryType -eq 1) -and ($dataType -eq "boolean")) {
                foreach ($formchck in $range.ContentControls) {
                    if($null -ne $formchck.Title){
                        if ($formchck.Title.Contains($data.search)) {
                            # Write-Host 'CHECKBOX ' $formchck.Title - $data.text;
                            $formchck.Checked = $data.text;
                        }
                    }
                }
            }
        }
    }
    $Document.SaveAs2([ref] $PdfPath, [ref] 17);
    $Document.Close();
    # Remove-Item $DocxPath
    Remove-Item $JsonPath
}

if($IsRecursive -eq 'true'){
    $Files = @(Get-ChildItem -Path $folderPath -Filter *.doc? -Recurse -Name);
}else{
    $Files = @(Get-ChildItem -Path $folderPath -Filter *.doc? -Name);
}

foreach ($File in $files) {
    Open-Folder($File);
}

$WordApp.Quit()  
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($WordApp)
Remove-Variable WordApp