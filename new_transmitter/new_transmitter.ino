#include <SPI.h>
#include <nRF24L01.h>
#include "RF24.h"

// Structure of transmited datas, one byte as type, accuracy of 256
typedef struct transmitStr {
  byte throttle;
  byte rudder;
  byte elevator;
  byte aileron;
  byte servo;
  byte aux;
//  bool GPS_on; // Either GPS On or Off
//  unsigned long satellites_val; // Num of satellites
//  float hdop_val;
//  float lat_val;
//  float lng_val;
//  unsigned long loc_age_val;
//  float alt_val;
//  float cours_deg_val;
//  float speed_kmph;
} TransmitData;


void resetTrData(TransmitData* trdata) {
    trdata->throttle = 0;
    trdata->rudder = 127;
    trdata->elevator = 127;
    trdata->aileron = 127;
    trdata->servo = 127;
    trdata->aux = 0;
//    trdata->GPS_on = false;
//    trdata->satellites_val = 0;
//    trdata->hdop_val = 0;
//    trdata->lat_val = 0;
//    trdata->lng_val = 0;
//    trdata->loc_age_val = 0;
//    trdata->alt_val = 0;
//    trdata->cours_deg_val = 0;
//    trdata->speed_kmph = 0;
 }

// Class for transmission with NRF24L01
byte addresses[][6] = {"1MOSI", "1MISO"}; // pipe addresses
class Transm {
  private:
  RF24 *radio;
  uint8_t howmanyreadingpipe = 1;
  
  public:
  Transm(uint8_t _cepin, uint8_t _cspin, uint8_t writingnum=0, uint8_t readingnum=1) { //dont change if it is transmitter
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
    if ( isAvailable() ) {        
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
    if (isAvailable()) {
      radio->read( myData, sizeof(*myData) ) ;
    }
  }
};

//Data data; // Here comes all the data necessary
TransmitData controllerData;
TransmitData receiveData;
Transm* myRadio; // This is the class for transmission

void setup() {
  // put your setup code here, to run once:
  Serial.begin(19200);
  myRadio = new Transm(9,10);
  resetTrData(&controllerData);
}

String inString = "";
const unsigned short totalIndexParse = 5;
//const unsigned short totalIndexParse_toPhone = 15;
byte *controllerDataArray[] = {&controllerData.throttle,&controllerData.rudder,&controllerData.elevator,&controllerData.aileron,&controllerData.servo};
//byte *receiveDataArray[] = {&receiveData.throttle,&receiveData.rudder,&receiveData.elevator,&receiveData.aileron,&receiveData.servo,&receiveData.aux,&receiveData.GPS_on,&receiveData.satellites_val,&receiveData.hdop_val,&receiveData.lat_val,&receiveData.lng_val,&receiveData.loc_age_val,&receiveData.alt_val,&receiveData.cours_deg_val,&receiveData.speed_kmph};

//the order of sending throttle(a)rudder(b)elevator(c)aileron(d)servo(e)

void loop() {
  // put your main code here, to run repeatedly:
  while (Serial.available() > 0) { // input will be 255a128b...
    int inChar = Serial.read();
    if (isDigit(inChar)) {
      // convert the incoming byte to a char and add it to the string:
      inString += (char)inChar;
    }
    // if you get a newline, print the string, then the string's value:
    for(int i=0;i<totalIndexParse;i++){
      if (inChar == 'a'+i) {
        int temp = (inString.toInt());
        if(temp<=255) *controllerDataArray[i] = (inString.toInt());
        // clear the string for new input:
        inString = "";
      }
    }
    Serial.flush();
  }
//  controllerData.throttle = 127;
  myRadio->writeTr(&controllerData);

  // Receive data
//  myRadio->readTr(&receiveData); // output will be a255b127...
//  outString = String(receiveData.throttle)+'a'+String(receiveData.rudder)+'b'+String(receiveData.elevator)
//  +'c'+String(receiveData.aileron)+'d'+String(receiveData.servo)+'e'+String(receiveData.aux)+'f'+String(receiveData.GPS_on)
//  +'g'+String(receiveData.satellites_val)+'h'+String(receiveData.hdop_val)+'i'+String(receiveData.lat_val)
//  +'j'+String(receiveData.lng_val)+'k'+String(receiveData.loc_age_val)+'l'+String(receiveData.alt_val)
//  +'m'+String(receiveData.cours_deg_val)+'n'+String(receiveData.speed_kmph)+'o';
//  Serial.println(outString);
  delay(20);
}
