import { ElementRef } from '@angular/core';

export class CanvasComponent {
  private canvas  : any;
  private ctx : any;
  private backColor = '#fff';
  public width; public height; public atomsize; // atomic size of pixel
  constructor(canvasEl:ElementRef) {this.init(canvasEl)}

  init(canvasEl:ElementRef) {
    this.canvas = canvasEl.nativeElement;
    let tempWidth = window.screen.width, tempHeight = window.screen.height;

    if (tempWidth>tempHeight) {
      this.canvas.width = tempWidth;
      this.canvas.height = tempHeight;
    }else{
      this.canvas.height = tempWidth;
      this.canvas.width = tempHeight;
    }
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.atomsize = this.height/6.7;
    this.initialiseCanvas();
  }

  initialiseCanvas() {
    if(this.canvas.getContext){
      this.ctx = this.canvas.getContext('2d');
    }else{
      throw "Canvas cannot get context (canvas.getContext)";
    }
  }

  fillCanvas() {
    // this.ctx.fillStyle = this.backColor;
    // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
  }

  clearCanvas() {
     this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawCircle(x, y, size, color='black') {
     // x, y, radius, startAngle, endAngle
     this.ctx.beginPath();
     this.ctx.arc(x, y, size/2, 0, 2 * Math.PI);
     this.ctx.lineWidth = 3;
     this.ctx.strokeStyle = color;
     this.ctx.fillStyle = color;
     this.ctx.fill();
     this.ctx.stroke();
     this.ctx.closePath();
  }

  // example use
  // this.overlay.drawText(2.5*this.canvas.atomsize,4.2*this.canvas.atomsize,"Whaddup");
  // this.overlay.drawSquare(2.5*this.overlay.atomsize,4.2*this.overlay.atomsize,3*this.overlay.atomsize);

  drawText(x,y,text) {
    this.ctx.beginPath();
    this.ctx.font = "15px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(text,x,y-5);
    this.ctx.fillStyle='#000';
    this.ctx.fill()
    this.ctx.closePath();
  }

  drawSquare(x, y, size) {
     // x, y, radius, startAngle, endAngle
     this.ctx.beginPath();
     this.ctx.rect(x-size/2, y-size/2, size, size);
     this.ctx.lineWidth = 3;
     // this.ctx.fillStyle = '#fff';
     // this.ctx.fill();
     this.ctx.strokeStyle = '#000';
     this.ctx.stroke();
     this.ctx.closePath();
  }

  drawRect(x, y, width, height) {
     // x, y, radius, startAngle, endAngle
     this.ctx.beginPath();
     this.ctx.rect(x-width/2, y-height/2, width, height);
     this.ctx.lineWidth = 3;
     this.ctx.fillStyle = '#000';
     this.ctx.fill();
     this.ctx.strokeStyle = '#000';
     this.ctx.stroke();
     this.ctx.closePath();
  }

  generateCanvasfromArray(obj) { // x-middle, y-middle, and the size it has
    switch (obj[0]) {
    case 0:
        obj[1] = obj[1]/100*window.outerWidth;
        obj[2] = obj[2]/100*window.outerHeight;
        obj[3] = obj[3]/100*window.outerHeight;
      this.drawSquare(obj[1],obj[2],obj[3]);
      break;
    case 1:
      // this.drawText
      this.drawRect(obj[1],obj[2],obj[3],obj[4]);
      break;
    }

  }

}
