import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { CamControlProvider } from '../../providers/cam-control/cam-control';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  img_src = "http://169.254.242.54:8000/stream.mjpg";
  button_rec_name = "Rec";
  constructor(public navCtrl: NavController, public camControl: CamControlProvider) {

  }
  toggleRec() {
    this.camControl.toggleRec().then((x) => {
      if(x) {
        this.button_rec_name = "REC";
      }else{
        this.button_rec_name = "LIVE";
      }
    })
  }
}
