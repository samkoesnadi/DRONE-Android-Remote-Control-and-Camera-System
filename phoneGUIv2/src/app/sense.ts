import { CanvasComponent } from './canvas';

export class SenseComponent extends CanvasComponent{
  constructor(canvasEl) {super(canvasEl)}
  checkDistance(point, obj){ // point=[x,y], obj=[shape, xmid, ymid, size] // for now ignore the shape type and make all for rectangle
    var pivot; // this is the end result
    if (obj[0]==0) {
      if (Math.abs(point[0]-obj[1]) > Math.abs(point[1]-obj[2])) {
        pivot = Math.abs(point[0]-obj[1]);
      }else{
        pivot = Math.abs(point[1]-obj[2]);
      }
      // console.log(pivot);
      if(pivot<=obj[3]/2) return true
      else return false
    }else if(obj[0]==1) {
      var xmid = obj[1], ymid = obj[2], width = obj[3], height = obj[4], x = point[0], y = point[1];
      if(x>=xmid-3/2*width && x<=xmid+3/2*width) { // 5/2 times bigger detection to offset human error
        if(y>=ymid-height/2-width/2 && y<=ymid+height/2+width/2) {
          return true;
        }
      }
      return false;
    }// rectangular for servo control
  }
  checkEucledian(point, obj) {
    return Math.sqrt((obj[1]-point[0])**2+(obj[2]-point[1])**2);
  }
  checkAllEucledian(point, objs) {
    for(let i=0;i<objs.length;i++) {
      if (this.checkEucledian(point,objs[i])) return i;
    }
    return undefined;
  }
  eucledianMaxPoint(point, activePointReg, objs) {
    if (activePointReg.length == 0) return [point[0], point[1], null];
    var pivot; // [lowest point index, score of eucledian] // this is a temporary variable
    for(let i of activePointReg) {
      let eucl = this.checkEucledian(point, objs[i]);
      if (pivot==undefined) pivot = [i, eucl];
      else {
        if (pivot[1]>eucl) {
          pivot[0] = i;
          pivot[1] = eucl;
        }
      }
    }
    var xout, yout; // updated point inside the box
    var x = objs[pivot[0]][1],y = objs[pivot[0]][2]// this is the center of the box
    var size = objs[pivot[0]][3] // size of the box
    var quadran;

    // Check with the quadran
    let temp_y = (x-point[0]); // this is the distance of border triangle
    if (temp_y >= 0){
      if (point[1]>=y-temp_y && point[1]<=y+temp_y) {
        quadran = 3;
      }else if (point[1]<y-temp_y) {
        quadran = 4;
      }else if (point[1]>y+temp_y) {
        quadran = 2;
      }
    }else{
      temp_y = Math.abs(temp_y);
      if (point[1]>=y-temp_y && point[1]<=y+temp_y) {
        quadran = 1;
      }else if (point[1]<y-temp_y) {
        quadran = 4;
      }else if (point[1]>y+temp_y) {
        quadran = 2;
      }
    }
    // Quadran
    switch (quadran) {
      case 1:
      xout = x+size/2;
      // yout = y - xout/point[0]*(y-point[1])
      yout = y - size/2/(point[0]-x)*(y-point[1]);
      break;
      case 3:
      xout = x-size/2;
      // yout = y - (xout+size)/(point[0]+size)*(y-point[1])
      yout = y - size/2/(x-point[0])*(y-point[1]);
      break;
      case 2:
      yout = y+size/2
      // xout = x - yout/point[1]*(x-point[0]);
      xout = x - size/2/(point[1]-y)*(x-point[0]);
      break;
      case 4:
      yout = y-size/2;
      xout = x - size/2/(y-point[1])*(x-point[0]);
      break;
    }
    return [xout,yout,pivot[0]];
  }// activePointReg is as a lookup to find the corresponding canvasData

  checkAllDistance(point, objs){ // returning which index of objs is selected, this will then be further processed
    for(let i=0;i<objs.length;i++) {
      if (this.checkDistance(point,objs[i])) return i;
    }
    return undefined;
  }
  drawIndicator(point) {
    super.drawCircle(point[0],point[1],50,'green');
  }
}
