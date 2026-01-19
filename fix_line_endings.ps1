$files = @(
    'd:\桌面資料\暫存\SubTrack\app\(tabs)\index.tsx',
    'd:\桌面資料\暫存\SubTrack\src\components\common\OptimizedList.tsx',
    'd:\桌面資料\暫存\SubTrack\src\components\search\SearchScreen.tsx',
    'd:\桌面資料\暫存\SubTrack\src\components\ServiceCatalogModal.tsx',
    'd:\桌面資料\暫存\SubTrack\src\services\db\adapter.ts',
    'd:\桌面資料\暫存\SubTrack\src\services\db\init.ts',
    'd:\桌面資料\暫存\SubTrack\src\services\db\members.ts',
    'd:\桌面資料\暫存\SubTrack\src\services\db\reports.ts',
    'd:\桌面資料\暫存\SubTrack\src\services\db\settings.ts',
    'd:\桌面資料\暫存\SubTrack\src\services\db\stats.ts',
    'd:\桌面資料\暫存\SubTrack\src\services\db\subscriptions.ts',
    'd:\桌面資料\暫存\SubTrack\src\services\db\tags.ts',
    'd:\桌面資料\暫存\SubTrack\src\services\db\workspaces.ts',
    'd:\桌面資料\暫存\SubTrack\src\services\imageService.ts',
    'd:\桌面資料\暫存\SubTrack\src\services\workerService.ts'
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace "\r\n", "`n"
        [IO.File]::WriteAllText($file, $content)
    }
}
