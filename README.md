# DRONE Remote Control and Camera System

This repository is the soul of my Drone project. I believe with this repo being public, a lot of makers can be benefited by it.

---
### Table of Contents  
- [The system of the Drone](#the-system-of-the-drone)  
- [Why?](#why)
- [Future improvement](#emphasis)  

## The system of the Drone
The mechanism of the drone is categorized to the control of the drone's machinery and the communication system between the drone and the human. Additionally, there is a camera that is integrated in the drone to have the sky view of its surrounding.

I use APM 2.8.0 ArduPilot for the controller of the drone's machinery (brushless motors). That being said, the main contribution of this repository lies in the communication system of the remote control and the camera system. The communication system uses nRF24l01+ with Arduino as the middle-man. The data transmitted and received by the nRF24l01+ is passed to the Arduino, before it is serially transferred to the phone via a cable. The camera system uses Raspberry Pi's camera for the vision and WiFi to communicate with the handphone. The use of Arduino and Raspberry Pi allows extension opportunity to advance the drone's functionality.

Conclusively, the final interface comes in the form of an Android/iOS App. In this final interface, there are controls for movement of the drone, camera's gimbal, and view of the camera itself.


## Why?

Building Drone is one dream of mine that I had. Open sourcing this project will be a greater achievement than the project itself. Have fun with it, contribute, and issue it if you find any problem :)

## Hardware Preparation
This repository includes the Fritzing schematic of the electronics of the receiver and transmitter of the drone's system, additionally also the STL design of the camera's gimbal and phone holder. The phone holder is aimed for ergonomy to hold the phone while flying the drone.

`fritzing` directory provides the schematic of the electronics. Note that the output CPPM is on Digital 2 and this is connected to Arducopter. The GPS, compass, gyro, and accelerometer are natively provided by Arducopter.

The STL files are provided in these links: 
- dsaf

## Receiver Side

### Phone GUI

## Transmitter Side

## Raspberry Pi's Camera

## Future improvements
<b>/eCalc.pdf</b> shows the mechanical calculation of the drone (the one of which I own) <br />
<b>/preflight_check.mp4</b> shows working wireless connection from phone to the drone.</b>

<br />

<h3>Installation of mobile application:</h3>
I tested my application in Android because I have Android. However, this system can pratically be compiled in various mobile operating system (Android, iOS, Windows Phone). <br />

The app is in the directory phoneGUIv2. The Mobile Application is based in <b>Ionic v4</b>. It now supports basic control of the drone, remote API for camera recording, Flight Modes (from the APM). The window dimension of Huawei in which the App is specifically built is 720 x 360.

The general code to install the app in your phone. <i>(This instruction may vary depending on your platform)</i>
```
cd phoneGUIv2
ionic cordova build android
%The apk can now be built in respective Operating System
```

<h6>Transmitter and receiver code</h6>
<b>/new_receiver</b> is the Arduino code for receiver side <br />
<b>/new_transmitter</b> is the Arduino code for transmitter side

<h6>Camera code for Gimbal</h6>
<b>/t3.py</b> needs to be compiled to Raspberry Pi on the drone. For best usage, set it up per startup by configuring init.rc
<br />
<br />

<i>Figure 1 <br />
![Screenshot](./assets/fig1.png)
<br />
Figure 2 <br /></i>
![Screenshot](./assets/fig2.png)

<br />
<br />

<hr />
<b>Appendix</b>
<br />
phoneGUIv2 Workflow:
The ElementRef of canvas is created at the page Home, then all the canvas functions are in the canvasProvider so that anybody can use the canvas.

The canvas itself has to layers embedded. The back and the control, the back is the one that will not be refreshed. On the other hand, the control layer is the one that is going to be refreshed frequently and detect the coordinate of the mouse.

The x,y coordinate located at the center of the object, and size respectively.

page:
Home

provider:
canvas
