// ------------------------------------------------------------
// Working with a GPS Module, two Radio Modules and an Arduino
// GPS Module: NEO-6M
// Arduino: Arduino Uno
// Radio Module: APC220
// ------------------------------------------------------------

// Include the SoftwareSerial library to allow the Arduino to communicate with the GPS module.
#include <SoftwareSerial.h>

// Define the time interval between APC220 data transmissions.
const int dataInterval = 1000; // milliseconds
unsigned long previousDataTime = 0;

// Define the pins that will be used to communicate with the GPS module.
const int RXPin = 4;
const int TXPin = 3;

// Define the pins that will be used to communicate with the APC220 module.
const int RXPinAPC = 10;
const int TXPinAPC = 11;
const int setPinAPC = 8;
const int enPinAPC = 12;
const int fiveVAPC = 13;

// Create a new SoftwareSerial object called GPSSerial.
SoftwareSerial GPSSerial(RXPin,TXPin);

// Create a new SoftwareSerial object called APCSerial.
SoftwareSerial APCSerial(RXPinAPC,TXPinAPC);

// APC220 setup
void setupAPC(void)
{
    pinMode(setPinAPC, OUTPUT);
    digitalWrite(setPinAPC, HIGH);
    pinMode(fiveVAPC, OUTPUT);
    digitalWrite(fiveVAPC, HIGH);
    delay(50);
    pinMode(enPinAPC, OUTPUT);
    digitalWrite(enPinAPC, HIGH);
    delay(100);
    APCSerial.begin(9600);
}

void setup() {
  // Initialize the serial communication with the computer and the GPS module.
  Serial.begin(9600);
  setupAPC();
  GPSSerial.begin(9600);
}

void loop() {
  // Check if the GPS module is available.
  if (GPSSerial.available() > 0) {
    // Read the data from the GPS module and print it on the Serial Monitor.
    String buf = GPSSerial.readStringUntil('\n');
    Serial.println(buf);

    // Get the current time and, if the time interval has passed, send the data to the APC220 module.
    unsigned long currentTime = millis();
    if (currentTime - previousDataTime >= dataInterval) {
      previousDataTime = currentTime;
      APCSerial.println(buf);
    }
  }
}
