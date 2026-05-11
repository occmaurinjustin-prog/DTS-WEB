@echo off
cd /d c:\laragon\www\Inertia-Tailwind

echo Marking migration as completed...
php artisan tinker --execute="DB::table('migrations')->insertOrIgnore(['migration' => '2026_04_13_145906_remove_truck_id_from_drivers_table', 'batch' => 1]);"

echo.
echo Running remaining migrations...
php artisan migrate --force

echo.
echo Done!
pause
