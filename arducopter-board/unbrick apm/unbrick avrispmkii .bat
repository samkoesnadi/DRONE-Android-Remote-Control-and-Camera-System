avrdude -p m2560 -c avrispmkii -Ulock:w:0x3F:m -Uefuse:w:0xFD:m -Uhfuse:w:0xD8:m -Ulfuse:w:0xFF:m -e -v
pause
avrdude -p m2560 -c avrispmkii -Uflash:w:m2560.hex:i -Ulock:w:0x0f:m -v
pause