/*
SenseBox Citizen Sensingplatform
Version: 1.3.2
Date: 2015-02-04
Homepage: http://www.sensebox.de
Author: Jan Wirwahn
Note: Sketch for SB-Photonik-WiFi
*/
#include <Wire.h>
#include <SPI.h>
#include <Adafruit_CC3000.h>
#include <DHT.h>
#include <Barometer.h>
#include <Digital_Light_TSL2561.h>
//#include <avr/wdt.h>

//SenseBox ID

//Sensor IDs

// WLAN parameters
#define WLAN_SSID       "WiFi_Name"           // cannot be longer than 32 characters!
#define WLAN_PASS       "WiFi_Password"
// Security can be WLAN_SEC_UNSEC, WLAN_SEC_WEP, WLAN_SEC_WPA or WLAN_SEC_WPA2
#define WLAN_SECURITY   WLAN_SEC_WPA2  

// These are the interrupt and control pins
#define ADAFRUIT_CC3000_IRQ   3  
#define ADAFRUIT_CC3000_VBAT  5
#define ADAFRUIT_CC3000_CS    10
#define IDLE_TIMEOUT_MS  3000  
// Use hardware SPI for the remaining pins
// On an UNO, SCK = 13, MISO = 12, and MOSI = 11
Adafruit_CC3000 cc3000 = Adafruit_CC3000(ADAFRUIT_CC3000_CS, ADAFRUIT_CC3000_IRQ, ADAFRUIT_CC3000_VBAT,
                                         SPI_CLOCK_DIVIDER); // you can change this clock speed  
//Server values
#define WEBSITE "www.opensensemap.org"
uint32_t ip = 2159055603;

//Sensor pin settings
#define UVPIN A0
#define DHTPIN A1
#define DHTTYPE DHT11

String currentSensorId = TEMPERATURESENSOR_ID;
float temperature, humidity, pressure;
unsigned long lux;
int analogUvLight,contLen;

short phenomenonCount = 5; //1=temp,2=humi,3=pressure,4=lux,5=UV
int sampleType = 1; //begin with temperature
boolean uploadSuccess = true;
String sensorSample,jsonData;

DHT dht(DHTPIN, DHTTYPE);
Barometer barometer;

void setup(void)
{
  Serial.begin(115200);
  Serial.println(F("\nInitializing WiFi..."));
  if (!cc3000.begin())
  {
    Serial.println(F("failed! Check your wiring?"));
    while(1);
  }
  
  Serial.print(F("\nAttempting to connect to ")); Serial.println(WLAN_SSID);
  if (!cc3000.connectToAP(WLAN_SSID, WLAN_PASS, WLAN_SECURITY)) {
    Serial.println(F("Failed!"));
    while(1);
  }
   
  Serial.println(F("Connected!"));
  
  /* Wait for DHCP to complete */
  Serial.println(F("Requesting DHCP"));
  while (!cc3000.checkDHCP())
  {
    delay(100); // ToDo: Insert a DHCP timeout!
  }
  ip = 0;
  // Try looking up the website's IP address
  Serial.print(WEBSITE); Serial.print(F(" -> "));
  while (ip == 0) {
    if (! cc3000.getHostByName(WEBSITE, &ip)) {
      Serial.println(F("Couldn't resolve!"));
    }
    delay(500);
  }
  cc3000.printIPdotsRev(ip);  
  Serial.println("\nSTARTING UP");
  barometer.init();
  dht.begin();
  TSL2561.init();
}

void loop(void)
{
  if (uploadSuccess){
    Serial.print("Reading sensor...");
    sensorSample = "";
    switch (sampleType)
    {
      case 1:
        temperature = dht.readTemperature();
        //temperature = barometer.bmp085GetTemperature(barometer.bmp085ReadUT());
        sensorSample = floatToString(temperature,0);
        currentSensorId = TEMPERATURESENSOR_ID;
        break;
      case 2:
        humidity = dht.readHumidity();
        sensorSample = floatToString(humidity,0);
        currentSensorId = HUMIDITYSENSOR_ID;//bmp085ReadUT MUST be called first
        break;
      case 3:
        pressure = barometer.bmp085GetTemperature(barometer.bmp085ReadUT());
        pressure = barometer.bmp085GetPressure(barometer.bmp085ReadUP());
        sensorSample = floatToString(pressure,0);
        currentSensorId = PRESSURESENSOR_ID;
        break;
      case 4:
        TSL2561.getLux();
        lux = TSL2561.calculateLux(0,0,1);
        sensorSample = (String)lux;
        currentSensorId = LUXSENSOR_ID;
        break;
      case 5:
        analogUvLight = analogRead(UVPIN);
        sensorSample = (String)calcUVIndex(analogUvLight);
        currentSensorId = UVSENSOR_ID;
        break;
    }
    Serial.println("done...................");
  }

  jsonData = "{\"value\":"; 
  jsonData += sensorSample; 
  jsonData += "}";
  Serial.println(jsonData);
  contLen = jsonData.length();
  Adafruit_CC3000_Client client = cc3000.connectTCP(ip, 8000);
  
  if (client.connected()) {
    /*
    clientclient.print(F("GET "));
    client.print(F("/"));
    client.print(F(" HTTP/1.1\r\n"));
    client.print(F("Host: ")); client.fastrprint(WEBSITE); .fastrprint(F("\r\n"));
    www.print(F("\r\n"));
    www.println();
    */
    client.print("POST /boxes/");
    client.print(SENSEBOX_ID);
    client.print("/"); 
    client.print(currentSensorId); 
    client.print(" HTTP/1.1\r\n"); 
    client.println("Host: opensensemap.org");
    client.println("Content-Type: application/json");   
    client.print("Content-Length: "); 
    client.println(contLen); 
    client.println("Connection: close");
    client.println(); 
    client.print(jsonData); 
    client.println(); 
    Serial.println("done!");
    uploadSuccess = true;
  } else {
    Serial.println(F("Connection failed"));    
    uploadSuccess = false;
    return;
  }

  Serial.println(F("-------------------------------------"));
  
  /* Read data until either the connection is closed, or the idle timeout is reached. */ 
  unsigned long lastRead = millis();
  while (client.connected() && (millis() - lastRead < IDLE_TIMEOUT_MS)) {
    while (client.available()) {
      char c = client.read();
      Serial.print(c);
      lastRead = millis();
    }
  }
  client.close();
  Serial.println(F("-------------------------------------"));
  if (uploadSuccess){
    if (sampleType == phenomenonCount) {
      sampleType = 1;
    }else sampleType++;
  }
  /* You need to make sure to clean up after yourself or the CC3000 can freak out */
  /* the next time your try to connect ... */
  Serial.println(F("\n\nDisconnecting"));
//  cc3000.disconnect();

 delay(1000);
}

String floatToString(float number, int precision)
{
  String stringNumber = "";
  //int prec;
  //only temperature (case 1) has a decimal place
  //if (sampleType == 1) prec = 1; else prec = 0;
  char tempChar[10];
  dtostrf(number, 1, precision, tempChar);
  stringNumber += tempChar;
  return stringNumber;
}

int calcUVIndex(int analogValue){
  int uvi;
  if (analogValue<10) uvi = 0;
  else if (analogValue<46) uvi = 1;
  else if (analogValue<65) uvi = 2;
  else if (analogValue<83) uvi = 3;
  else if (analogValue<103) uvi = 4;
  else if (analogValue<124) uvi = 5;
  else if (analogValue<142) uvi = 6;
  else if (analogValue<162) uvi = 7;
  else if (analogValue<180) uvi = 8;
  else if (analogValue<200) uvi = 9;
  else if (analogValue<221) uvi = 10;
  else if (analogValue<240) uvi = 11;
  return uvi;
}