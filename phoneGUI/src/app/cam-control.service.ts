import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CamControlService {
    public _rec_stat = false;
    constructor(public http: HttpClient) {}

    toggleRec(root_dir) {
      return new Promise ((resolve) => {
        if (this._rec_stat) {
          this.http.get(root_dir+'stop_rec').subscribe(()=>{
              this._rec_stat=false;
              resolve(this._rec_stat);
          })
          // setTimeout(()=>{ // for testing
          //     this._rec_stat=false;
          //     resolve(this._rec_stat);
          // },1000);
        }else{
          this.http.get(root_dir+'start_rec').subscribe(()=>{
              this._rec_stat=true;
              resolve(this._rec_stat);
          })
          // setTimeout(()=>{ // for testing
          //     this._rec_stat=true;
          //     resolve(this._rec_stat);
          // },1000);
        }
      })
    }
}
