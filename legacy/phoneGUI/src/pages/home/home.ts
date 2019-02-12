/*
Program made specifically for Dimension 720x360
*/
import { Component, ElementRef, ViewChild } from '@angular/core';
// import { Platform, NavController } from 'ionic-angular';
import { CanvasComponent } from '../../app/canvas';
import { SenseComponent } from '../../app/sense';

import { Observable } from 'Rxjs/rx';
import { Subscription } from 'Rxjs/Subscription';
import { Vibration } from '@ionic-native/vibration';
import { Serial } from '@ionic-native/serial';
import { Hotspot, HotspotNetwork } from '@ionic-native/hotspot';
import { CamControlProvider } from '../../providers/cam-control/cam-control';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('canvas') canvasEl : ElementRef;
  @ViewChild('overlay') overlayEl : ElementRef;
  @ViewChild('senseLayer') senseEl : ElementRef;
  canvas : CanvasComponent;
  overlay : CanvasComponent;
  sense : SenseComponent;

  // This is the actual state : please be careful before you update this
  private throttle=0;
  private rudder=0;
  private elevator=0;
  private aileron=0;
  private servo = 127;

  // private refreshObservable: Subscription;

  // keep tracking of active pointers
  private activePointersNum : number;
  private PointersRegisters = []; // this is to track active box so that it can also track until outside of boundary

  private readSerialResult = []; // Array the result of reading the serial

  // This is the Object that will be rendered as GUI - remember it is only background
  canvasData = [ // all the objects to be generated !important
    [0,134,242,161], // left controller
    [0,591,242,161] // right controller
  ];

  servoControlBack = [1,100,70,30,100]; // 1, x center, y center, width, height

  serial_config = {
    baudRate: 19200,
    dataBits: 8,
    stopBits: 1,
    parity: 0,
    dtr: true,
    rts: true,
    sleepOnPause: false
  };
  private serial_permission:boolean; // whether or not its already requested
  private readSerialObservable:Subscription;

  img_src: string;
  root_dir: string;
  button_rec_name = "REC"
  constructor(private vibration: Vibration, private serial: Serial, private hotspot: Hotspot, public camControl: CamControlProvider) {
    // this.refreshObservable = Observable.interval(250).subscribe(()=>{
    //   //function of canvas refresh for every 250ms
    // });
    this.serial_permission = false;
    this.hotspot.createHotspot("dude_cam","WPA_PSK","akuganteng").then(()=>{
      this.hotspot.getAllHotspotDevices().then((dev)=>{
        this.root_dir = "http://"+dev[0].ip+":8000/";
        this.img_src = this.root_dir+"stream.mjpg";
        console.log(dev, this.img_src);
      })
    })
  }

  toggleRec() {
    this.camControl.toggleRec(this.root_dir).then((x) => {
      if(x) {
        this.button_rec_name = "REC";
      }else{
        this.button_rec_name = "LIVE";
      }
    })
  }

  ionViewDidLoad() {
    this.canvas = new CanvasComponent(this.canvasEl);
    this.overlay = new CanvasComponent(this.overlayEl);
    this.sense = new SenseComponent(this.senseEl);
    // console.log(this.sense.checkDistance([1.1,1],[0,0,0,2]));

    for(let i=0;i<this.canvasData.length;i++) {
      this.canvas.generateCanvasfromArray(this.canvasData[i]);
    }
    this.canvas.drawRect(this.servoControlBack[1],this.servoControlBack[2],this.servoControlBack[3],this.servoControlBack[4]);

    this.updateCanvas();
  }
  openSerialConnection_permission() { // Opening Serial Connection with permission
    this.serial.requestPermission().then(() => {
      this.serial.open(this.serial_config).then((succ) => {
        this.serial_permission=true;
        // For reading - not necessary
        // this.readSerialObservable = this.serial.registerReadCallback().subscribe({
        //   next: x => {
        //     var placeholder = "";
        //     this.readSerialResult = [];
        //     var uint8_array = new Uint8Array(x);
        //     uint8_array.forEach((elem, index, array) => {
        //       let char = String.fromCharCode(elem);
        //       if(char!='.' && isNaN(Number(char))) {
        //         if (placeholder != "") {
        //           this.readSerialResult.push(Number(placeholder))
        //           placeholder = ""
        //         }
        //       }else{
        //         placeholder += char;
        //       }
        //     });
        //   },
        //   error: x => console.log(x)
        // });
      });
      }).catch((error: any) => {
        this.overlay.drawText(400,300,"Lost connection");
        // this.readSerialObservable.unsubscribe();
        setTimeout(this.openSerialConnection_permission(), 1000)
      });
  }
  // TODO
  ionicViewWillUnload() {
    this.hotspot.stopHotspot();
    this.serial.close();
  }
  handleStart(ev){
    this.activePointersNum = ev.touches.length;
    this.sense.clearCanvas(); // clear sense layer everytime there is an incoming detection
    for(let i=0;i<ev.touches.length;i++) {
      this.sense.drawIndicator([ev.touches[i].clientX,ev.touches[i].clientY]); // draw green indicator
    }
  }

  handleMove(ev){
    this.activePointersNum = ev.touches.length;
    this.sense.clearCanvas();
    var index, tempPointerRegs = [];
    for(let i=0;i<ev.touches.length;i++) {
      var tempX = ev.touches[i].clientX;
      var tempY = ev.touches[i].clientY;

      index = this.handlingUpdateControlStatus(tempX, tempY) ;
      if (index!=null) tempPointerRegs.push(index);
      this.sense.drawIndicator([ev.touches[i].clientX,ev.touches[i].clientY]);
    }
    this.PointersRegisters = tempPointerRegs;
    this.updateCanvas();
  }

 // this is handling of selection, only this need to be change out of anything most of the time
  handlingUpdateControlStatus(tempX, tempY) { // this will update all the control status based on cursor position
    if (this.sense.checkDistance([tempX, tempY], this.servoControlBack)) {
      this.servo = 127 - (tempY-this.servoControlBack[2])*255/this.servoControlBack[4];
      this.servo = Math.max(this.servo,0);
      this.servo = Math.min(this.servo,255);
      return null;
    }
    var index_of_active = this.sense.checkAllDistance([tempX,tempY],this.canvasData);
    // check continuity even from outside (input: [tempX,tempY], activeFoo(is to grab the this.canvasData), middle: checkAllEucledian, output: to which canvasData it belongs, and new tempX and tempY)

    // index_of_active is finding to which index of canvasData the tempX belong
    // Now its time for controller function, ow yeah
    // console.log(this.PointersRegisters);
    if (index_of_active==null) {
      // this.vibration.vibrate(10);
      // var index_of_active = this.sense.checkAllEucledian([tempX,tempY], this.canvasData); // to check expansion of which one is active
      [tempX, tempY, index_of_active] = this.sense.eucledianMaxPoint([tempX,tempY], this.PointersRegisters, this.canvasData) // this is to find the inside points regarding to outside pointer movement
      // console.log(index_of_active);
    }

    if (index_of_active!=null) {
      var tempObj = this.canvasData[index_of_active];

      if (index_of_active==0) {
        this.throttle = -(tempY-(tempObj[2]+tempObj[3]/2));
        this.rudder = tempX-(tempObj[1]);
        this.throttle = this.throttle/tempObj[3]*100 // convert to 0-100 percentage
        this.rudder = this.rudder/tempObj[3]*100 // convert to 0-100 percentage
      }else if (index_of_active==1) {
        this.elevator = -(tempY-(tempObj[2]));
        this.aileron = tempX-(tempObj[1]);
        this.elevator = this.elevator/tempObj[3]*100 // convert to 0-100 percentage
        this.aileron = this.aileron/tempObj[3]*100 // convert to 0-100 percentage
      }
    }
    // console.log(index_of_active);
    return index_of_active;
  }

  updateCanvas() {// using global values
    let ins = Math.floor(this.throttle/100*255)+"a"+Math.floor(255-(this.rudder+50)/100*255)+"b"+Math.floor(255-(this.elevator+50)/100*255)+"c"+Math.floor((this.aileron+50)/100*255)+"d";
    ins += Math.floor(this.servo)+"e";
    //ins += //f will be for Flight Modes
    // console.log(ins);
    // ins += servo_data+"e"+func_head+"g"+func_ctx+"h";
    // TODO
    this.serial.write(ins).then((succMsg) => this.overlay.drawText(500,300,succMsg)).catch((err) => {
      this.openSerialConnection_permission();
    });

    this.overlay.clearCanvas();

    // Control circles
    this.overlay.drawCircle((this.rudder*this.canvasData[0][3]/100+this.canvasData[0][1]),(this.canvasData[0][2]-this.throttle*this.canvasData[0][3]/100+this.canvasData[0][3]/2),50);
    this.overlay.drawCircle((this.aileron*this.canvasData[1][3]/100+this.canvasData[1][1]),(-this.elevator*this.canvasData[1][3]/100+this.canvasData[1][2]),50);
    // Control circle for servo
    this.overlay.drawCircle(this.servoControlBack[1],(127-this.servo)/255*this.servoControlBack[4]+this.servoControlBack[2],20, 'white');

    // this.overlay.drawText(500,100,ins);
  }

  handleEnd(ev) {
    //calculation to make controller go back
    this.rudder = 0;
    this.aileron = 0;
    this.elevator = 0;
    var index, tempPointerRegs = [];
    for(let i=0;i<ev.touches.length;i++) {
      // console.log(ev.touches[i].clientX, ev.touches[i].clientY);
      index = this.handlingUpdateControlStatus(ev.touches[i].clientX, ev.touches[i].clientY) ;
      if (index!=null) tempPointerRegs.push(index);
    }
    this.PointersRegisters = tempPointerRegs;
    if (ev.touches.length==0) {
      this.rudder = 0;
      this.aileron = 0;
      this.elevator = 0;
      this.sense.clearCanvas();
      this.updateCanvas();
    }
  }
}
