dude-DRONE is aimed for open sourcing a complete, upgradable drone system. In general, this repo consists of:
- Receiver-transmitter transmission based in Arduino
- Design of Quadcopter (parts of electronics), 3D Printed Phone holder for Remote Controller
- Phone Interface for Remote Controller

General Instruction:
I tested my application in Android because I have Android. However, this system can pratically be compiled in various mobile operating system (Android, iOS, Windows Phone)
- cd phoneGUI
- ionic cordova build android
- The apk can now be built in respective Operating System

For GUI

Workflow:
The ElementRef of canvas is created at the page Home, then all the canvas functions are in the canvasProvider so that anybody can use the canvas.

The canvas itself has to layers embedded. The back and the control, the back is the one that will not be refreshed. On the other hand, the control layer is the one that is going to be refreshed frequently and detect the coordinate of the mouse.

The x,y coordinate located at the center of the object, and size respectively.

page:
Home

provider:
canvas
