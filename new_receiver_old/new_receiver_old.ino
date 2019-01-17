#include <nRF24L01.h>
#include <RF24.h>
#include <ServoTimer2.h> // We use servo timer2 because timer1 is used for PPM
#include <TinyGPS++.h> // Include the TinyGPS++ library
#include <SoftwareSerial.h>

//void setup() {}
//void loop(){}
ServoTimer2 myservo;

////////////////////// PPM CONFIGURATION//////////////////////////
#define channel_number 5  //set the number of channels
#define sigPin 2  //set PPM signal output pin on the arduino
#define PPM_FrLen 22500  //set the PPM frame length in microseconds (1ms = 1000µs)
#define PPM_PulseLen 300  //set the pulse length
//////////////////////////////////////////////////////////////////

int ppm[channel_number];

float kalman_smoothing = 0.7 ; // the percentage of new value
#define servoPin 5 // the pin of the gimbal Servo!
static const int RXPin = 4, TXPin = 3;
static const uint32_t GPSBaud = 9600;

// The TinyGPS++ object
TinyGPSPlus gps;

// The serial connection to the GPS device
SoftwareSerial ss(RXPin, TXPin);

// Structure of transmited datas, one byte as type, accuracy of 256
typedef struct transmitStr {
  byte throttle;
  byte rudder;
  byte elevator;
  byte aileron;
  byte servo;
  byte aux;
} TransmitData;

void setupPPM() {
  pinMode(sigPin, OUTPUT);
  digitalWrite(sigPin, 0);  //set the PPM signal pin to the default state (off)

  cli();
  TCCR1A = 0; // set entire TCCR1 register to 0
  TCCR1B = 0;

  OCR1A = 100;  // compare match register (not very important, sets the timeout for the first interrupt)
  TCCR1B |= (1 << WGM12);  // turn on CTC mode
  TCCR1B |= (1 << CS11);  // 8 prescaler: 0,5 microseconds at 16mhz
  TIMSK1 |= (1 << OCIE1A); // enable timer compare interrupt
  sei();
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
    radio->setPALevel(RF24_PA_MAX);
    radio->setChannel(108);
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
    bool goodSignal = radio->testRPD();
    while ( radio->available() ) {     
      Serial.println(goodSignal ? "Strong signal > 64dBm" : "Weak signal < 64dBm" );
      Serial.println(radio->testCarrier());   
      radio->read(mydata, sizeof(*mydata));
    }
  }
  void writeTr(TransmitData* mydata) {
    stopListening();
    radio->write(mydata, sizeof(*mydata));
  }
  bool isAvailable() {
    return radio->available();
  }
  void readTr(TransmitData* myData) {
    startListening();
    while (isAvailable()) {
      radio->read( myData, sizeof(*myData) ) ;
    }
  }
};

//void getGPS_Info(TransmitData* trdata) {
//  if (ss.available()) {
//    gps.encode(ss.read());
//  
//    if (gps.location.isValid() && gps.altitude.isValid() && gps.hdop.isValid()) {
//      trdata->GPS_on = true;
//      trdata->satellites_val = gps.satellites.value();
//      trdata->hdop_val = gps.hdop.hdop();
//      trdata->lat_val = gps.location.lat();
//      trdata->lng_val = gps.location.lng();
//      trdata->loc_age_val = gps.location.age();
//      trdata->alt_val = gps.altitude.meters();
//      trdata->cours_deg_val = gps.course.deg();
//      trdata->speed_kmph = gps.speed.kmph();
//    }else{
//      trdata->GPS_on = false;
//    }
//  }
//}

TransmitData controllerData;
Transm* myRadio; // This is the class for transmission

void setPPMValuesFromData(TransmitData* trdata)
{
  ppm[0] = map(trdata->throttle, 0, 255, 1000, 2000);
  ppm[1] = map(trdata->rudder,      0, 255, 1000, 2000);
  ppm[2] = map(trdata->elevator,    0, 255, 1000, 2000);
  ppm[3] = map(trdata->aileron,     0, 255, 1000, 2000);  
  ppm[4] = map(trdata->servo,     0, 255, 1000, 2000);  
  ppm[4] = 1000;
}


void setup() {
  resetTrData(&controllerData);
  setupPPM();
  
  // put your setup code here, to run once:
  myservo.attach(servoPin);

//  Serial.begin(57600);

//  ss.begin(GPSBaud);
  myRadio = new Transm(9,10,1,0); // it determines that it is a receiver
  myRadio->startListening();
}

int servo_max = 2000;
int servo_val = servo_max/2;

void loop() {
  myRadio->recvData(&controllerData);
  
  Serial.println(controllerData.throttle);
  setPPMValuesFromData(&controllerData);
  servo_val = servo_max-((1-kalman_smoothing)*servo_val+(kalman_smoothing)*map(controllerData.servo, 0, 255, 0, servo_max));  // give also some kind of simple kalman smoothing
  myservo.write(servo_val);
  
  // Transmit data
//  getGPS_Info(&controllerData);
//  myRadio->writeTr(&controllerData);
  delay(10);
}

/**************************************************/

#define clockMultiplier 2 // set this to 2 if you are using a 16MHz arduino, leave as 1 for an 8MHz arduino

ISR(TIMER1_COMPA_vect){
  static boolean state = true;

  TCNT1 = 0;

  if ( state ) {
    //end pulse
    digitalWrite(sigPin,0);
    OCR1A = PPM_PulseLen * clockMultiplier;
    state = false;
  }
  else {
    //start pulse
    static byte cur_chan_numb;
    static unsigned int calc_rest;

    digitalWrite(sigPin,1);
    state = true;

    if(cur_chan_numb >= channel_number) {
      cur_chan_numb = 0;
      calc_rest += PPM_PulseLen;
      OCR1A = (PPM_FrLen - calc_rest) * clockMultiplier;
      calc_rest = 0;
    }
    else {
      OCR1A = (ppm[cur_chan_numb] - PPM_PulseLen) * clockMultiplier;
      calc_rest += ppm[cur_chan_numb];
      cur_chan_numb++;
    }     
  }
}


