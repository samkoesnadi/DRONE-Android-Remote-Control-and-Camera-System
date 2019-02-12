@echo off
color 02
echo -------------==bangs6996==----------------------
echo Simple script write the bootloader and firmware version 3.2.1
echo . be patient with the usb error's
echo -------------------------------------------------


Echo PLUG IN THE ISP INTO YOUR APM
pause
echo Erasing....
avrdude -p m2560 -c usbasp -Ulock:w:0x3F:m -Uefuse:w:0xFD:m -Uhfuse:w:0xD8:m -Ulfuse:w:0xFF:m -e -v
pause
echo Flash
avrdude -c usbasp -p atmega2560 -U flash:w:apm_flash.hex
echo    eeprom
pause
avrdude -c usbasp -p atmega2560 -U eeprom:w:apm_eeprom.hex
echo   hfuse
pause
avrdude -c usbasp -p atmega2560 -U hfuse:w:apm_hfuse.hex
echo   lfuse
pause
avrdude -c usbasp -p atmega2560 -U lfuse:w:apm_lfuse.hex
echo    efuse
pause
avrdude -c usbasp -p atmega2560 -U efuse:w:apm_efuse.hex
echo DONE!!!  Unplug the isp and plug in the usb into 
echo the computer and connect with mission planner.
PAUSE












