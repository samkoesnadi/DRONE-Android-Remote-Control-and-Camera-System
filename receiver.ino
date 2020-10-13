#include <nRF24L01.h>
#include "RF24.h"
#include <Servo.h>

Servo myservo;
Servo P1; // pwm 1 // D2
Servo P2; // D3
Servo P3; // D4
Servo P4; // D5
Servo P5; // D6

#define channel_number 5
int ppm[channel_number];

float kalman_smoothing = 1 ; // the percentage of new value
#define servoPin 7 // the pin of the gimbal Servo!
static const int RXPin = 4, TXPin = 3;
static const uint32_t GPSBaud = 115200;

// Structure of transmited datas, one byte as type, accuracy of 256
typedef struct transmitStr {
  byte throttle;
  byte rudder;
  byte elevator;
  byte aileron;
  byte servo;
  byte aux;
} TransmitData;

bool throttle_failSafe = false;

unsigned short val_toFailSafe = 0;
unsigned short count_toFailSafe = 0;
unsigned short max_toFailSafe = (unsigned short)3000/40;

void check_failSafe() {
    if (count_toFailSafe == max_toFailSafe) {
    if (val_toFailSafe == 0) {
      throttle_failSafe = true;
    }
    val_toFailSafe = 0;
    count_toFailSafe = 0;
  }else{
    if (val_toFailSafe != 0) {
      throttle_failSafe = false;
    }
  }
}

#define min_pwm 1000
#define max_pwm 2000

void setPPMValuesFromData(TransmitData* trdata)
{
  unsigned short ppm_2_pre = 925;
  if(!throttle_failSafe){
    ppm_2_pre = map(trdata->throttle,    0, 255, min_pwm, max_pwm);
  }
  
  ppm[0] = map(trdata->aileron, 0, 255, min_pwm, max_pwm);
  ppm[1] = map(trdata->elevator,      0, 255, min_pwm, max_pwm);
  ppm[2] = ppm_2_pre;
  ppm[3] = map(trdata->rudder,     0, 255, min_pwm, max_pwm);  
  ppm[4] = map(trdata->aux, 0, 255, min_pwm, max_pwm);
}

void runPPMValues() {
  P1.writeMicroseconds(ppm[0]);
  P2.writeMicroseconds(ppm[1]);
  P3.writeMicroseconds(ppm[2]);
  P4.writeMicroseconds(ppm[3]);
  P5.writeMicroseconds(ppm[4]);
}

void inverseByte(byte& tobe) {
  tobe = 255-tobe;
}

void resetTrData(TransmitData* trdata) {
    trdata->throttle = 0;
    trdata->rudder = 127;
    trdata->elevator = 127;
    trdata->aileron = 127;
    trdata->servo = 127;
    trdata->aux = 0;
 }
 
// Class for transmission with NRF24L01
byte addresses[][6] = {"1MOSI", "1MISO"}; // pipe addresses
class Transm {
  private:
  RF24 *radio;
  uint8_t howmanyreadingpipe = 1;
  
  public:
  Transm(uint8_t _cepin, uint8_t _cspin, uint8_t writingnum=0, uint8_t readingnum=1) {
    this->radio = new RF24(_cepin,_cspin);
    radio->begin();
    radio->setDataRate(RF24_250KBPS);
    radio->setPALevel(RF24_PA_MIN);
    //radio->setChannel(108);
    radio->setAutoAck(false);
    initWriting(writingnum);
    initReading(readingnum);
  }
  void initWriting(uint8_t num) { // num is which addresses
    radio->openWritingPipe(addresses[num]);
  }
  void initReading(uint8_t num) {
    radio->openReadingPipe(howmanyreadingpipe,addresses[num]);
    howmanyreadingpipe += 1;
  }
  void startListening() {
    radio->startListening (); 
  }
  void stopListening() {
    radio->stopListening();
  }
  void recvData(TransmitData* mydata) {
    while ( isAvailable() ) { 
      radio->read(mydata, sizeof(*mydata));
    }
  }
  void writeTr(TransmitData* mydata) {
    stopListening();
    radio->write(mydata, sizeof(*mydata));
  }
  bool isAvailable() {
    val_toFailSafe += (unsigned short) radio->available();
    count_toFailSafe += 1;
    check_failSafe();
    return radio->available();
  }
  void readTr(TransmitData* myData) {
    startListening();
    while (isAvailable()) {
      radio->read( myData, sizeof(*myData) ) ;
    }
  }
};

TransmitData controllerData;
Transm* myRadio; // This is the class for transmission

void setup() {
  resetTrData(&controllerData);

  // put your setup code here, to run once:
  myservo.attach(servoPin);

  P1.attach(2);
  P2.attach(3);
  P3.attach(4);
  P4.attach(5);
  P5.attach(6);
  
  myRadio = new Transm(9,10,1,0); // it determines that it is a receiver
  myRadio->startListening();
}

int servo_max = 180;
int servo_val = servo_max/2;

void loop() {
  myRadio->recvData(&controllerData);

  // inversion mania
  inverseByte(controllerData.rudder);
  inverseByte(controllerData.elevator);
  
  setPPMValuesFromData(&controllerData);
  runPPMValues();
  servo_val = servo_max-((1-kalman_smoothing)*servo_val+(kalman_smoothing)*map(controllerData.servo, 0, 255, 0, servo_max));  // give also some kind of simple kalman smoothing
  myservo.write(servo_val);
  
  delay(40);
}


