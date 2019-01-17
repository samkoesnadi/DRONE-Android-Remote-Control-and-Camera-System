import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the CamControlProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CamControlProvider {
  public _rec_stat = false;
  constructor(public http: HttpClient) {
    ;
  }

  toggleRec() {
    return new Promise ((resolve) => {
      if (this._rec_stat) {
        this.http.get('http://169.254.192.28:8000/stop_rec').subscribe(()=>{this._rec_stat=false})
      }else{
        this.http.get('http://169.254.192.28:8000/start_rec').subscribe(()=>{this._rec_stat=true})
      }
      resolve(this._rec_stat);
    })
  }
}
