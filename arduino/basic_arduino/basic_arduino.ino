// ------------------------------------------------------------
// Working with a GPS Module and an Arduino
// GPS Module: NEO-6M
// Arduino: Arduino Uno
// ------------------------------------------------------------


// Include the SoftwareSerial library to allow the Arduino to communicate with the GPS module.
#include <SoftwareSerial.h>

// Define the pins that will be used to communicate with the GPS module.
int RXPin = 4;
int TXPin = 3;

// Define the baud rate that will be used to communicate with the GPS module.
int GPSBaud = 9600;

// Create a new SoftwareSerial object called GPSSerial.
SoftwareSerial GPSSerial(RXPin,TXPin);

void setup() {
  // Initialize the serial communication with the computer and the GPS module.
  Serial.begin(9600);
  GPSSerial.begin(9600);
}

void loop() {
  // If the GPS module is connected and it's working, read and send the data to the computer.
  while (GPSSerial.available() > 0) {
    byte gpsData = GPSSerial.read();
    Serial.write(gpsData);
  }
}
