<h1 align="center">GPS</h1>
<h3 align="center">Easily view realtime NMEA data on Google Maps</h2>
<p></p>
<p align="center">
<a href="https://www.arduino.cc/"><img src="https://img.shields.io/badge/Arduino-00979D?style=for-the-badge&logo=Arduino&logoColor=white" alt="Arduino">
<a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
</a></p>
<p align="center">
<a href="https://www.iiscastelli.edu.it/Pager.aspx?Page=mainpage"><img src="https://img.shields.io/badge/Made_For-ITIS_B._Castelli-blue?style=for-the-badge" alt="Made for ITIS B. Castelli"></a>

# Overview
GPS is a **Node.js** application based on **[GPS.js](https://github.com/infusion/GPS.js)** that allows you to view NMEA data coming from a GPS module on **Google Maps**. 

It is designed to be used with an **Arduino** microcontroller, but can be used with any device that can send NMEA data over a serial port.

# Features
- **Realtime** data visualization
- Keeps track of every **GPS fix** (until you reload the page)
- Runs on every platform that supports **Node.js**
- Open source
- Free
- It's easy to use

# Requirements
## Software
- **[Node.js](https://nodejs.org)** (v19.5.x)
- **[Git](https://git-scm.com/)** (optional)
- **[Arduino IDE](https://www.arduino.cc/en/software)**
- **Supported web browser** (Chrome, Firefox, Edge, Safari, etc.)

## Hardware
- **Arduino**
- **GPS module** (I used a **[NEO-6M](https://amzn.eu/d/0F55El5)**)
- **Breadboard**
- **Jumper wires**
- **USB cable**
- **Computer**


# Installation
1. Install the required software
2. Clone this repository by running `git clone https://github.com/CoccodrillooXDS/GPS` or download the repository as a ZIP file and extract it
3. Open Terminal or Command Prompt in the repository folder
4. Run `npm install` to install the dependencies
5. Run `node server` to start the application
6. Open a web browser and visit `http://localhost:3000`

# Contributing
You can contribute to the project by making a pull request or by creating an issue.

To contribute, you can fork the repository and after you made your changes, you can create a pull request.

# License
This project is licensed under the **MIT License**. See the **[LICENSE](LICENSE)** file for more information.