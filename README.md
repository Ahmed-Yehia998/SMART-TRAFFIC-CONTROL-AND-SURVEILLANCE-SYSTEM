# Smart Traffic Control and Surveillance System

An intelligent traffic management solution designed to improve urban transportation efficiency and safety through a low-cost mini smart city prototype.

## Project Overview

The **Smart Traffic Control and Surveillance System** addresses common traffic problems such as congestion, long waiting times at intersections, delayed emergency response, speeding violations, and lack of real-time traffic monitoring.

The system creates a **mini smart city simulation** containing **4–6 interconnected intersections** equipped with:

- ESP32-S3 cameras
- Traffic lights
- Pedestrian buttons
- Monitoring devices

Cameras collect real-time traffic information. An AI-based detection system analyzes the data to:

- Identify vehicles
- Count traffic density
- Detect emergency vehicles
- Recognize possible accidents

Collected information is processed through a **Flask-based backend** and stored in a **Supabase** database. A web dashboard enables operators to:

- Monitor all intersections
- View traffic conditions
- Receive alerts with location and time information
- Track incidents (accidents or speed violations)

The system automatically adjusts traffic signal timing according to traffic conditions and provides priority for emergency vehicles.

By combining **IoT**, **Artificial Intelligence**, **networking**, and **web technologies**, this project delivers a practical prototype for smarter, safer, and more efficient urban traffic management.

## Features

- Real-time vehicle detection and counting using YOLO
- Emergency vehicle priority control
- Accident and congestion detection
- Adaptive traffic signal timing
- Pedestrian button support
- Live web monitoring dashboard
- Alerts and incident reporting with timestamps and locations
- Speed violation tracking
- Multi-intersection coordination (4–6 intersections)

## System Architecture

```
Traffic Model (Simulation Input)
        ↓
ESP32-S3 Cameras (Edge Capture)
        ↓
YOLO AI Model (Vision Inference)
        ↓
Flask Backend API (Orchestration Layer)
        ↓
   ┌────┴────┐
   ↓         ↓
Supabase     Traffic Control
Database     (Signal Actions)
   ↓         ↓
   └────┬────┘
        ↓
Web Monitoring Dashboard
```

**Continuous data loop**: Sense → Decide → Act

## System Workflow

1. **Prototype Design**  
   City layout, roads, intersections, camera positions, traffic light positions, and component placement.

2. **Hardware, IoT & Network**  
   ESP32-S3 cameras, LEDs/traffic lights, OLED displays, pedestrian buttons, Wi-Fi communication.

3. **AI & Computer Vision**  
   YOLO + OpenCV for vehicle detection, counting, emergency detection, accident detection, and vehicle tracking.

4. **Backend, Database & Security**  
   Python/Flask for traffic analysis, signal decisions, speed calculation, alerts, and data storage in Supabase (PostgreSQL).

5. **Frontend & Traffic Control**  
   Live dashboard (traffic map, vehicle counts, alerts, reports) and real-time signal control (timing, emergency priority, pedestrian phase).

## Technology Stack

### Hardware
- ESP32-S3
- ESP32-S3 Camera
- OLED Displays
- LEDs
- Push Buttons
- Breadboards
- Jumper Wires
- Power Supply
- Mini Road Model
- Vehicle ID Stickers

### Software

| Category              | Technologies                          |
|-----------------------|---------------------------------------|
| **Frontend**          | HTML, CSS, JavaScript                 |
| **Backend**           | Python, Flask                         |
| **Database**          | Supabase (PostgreSQL)                 |
| **AI / Computer Vision** | Python, YOLO, OpenCV               |
| **IoT / Hardware**    | Arduino C/C++, ESP32, Wiring / GPIO   |
| **Design**            | Fusion 360, Blender                   |

## Communication Between Components

- **Hardware → AI**  
  Camera images / video frames

- **AI → Backend**  
  Structured detection results (JSON example):
  ```json
  {
    "INTERSECTION": 2,
    "VEHICLES": 15,
    "EMERGENCY": true,
    "ACCIDENT": false,
    "TIME": "12:30"
  }
  ```

- **Backend → Frontend**  
  Traffic status, alerts, reports, statistics

- **Backend → Hardware**  
  Green light duration, emergency priority commands

## Team Structure & Responsibilities

### Team 1 — Prototype Design & Smart City Layout
- Design the physical smart city model and 4–6 intersection layout
- Define road directions, dimensions, and component placement (cameras, traffic lights, OLED displays, buttons, controllers, power, wiring)
- Create 2D/3D prototype drawings
- Coordinate with Hardware team for physical feasibility

### Team 2 — Frontend & Project Management
- Develop the web monitoring dashboard and user interface
- Display intersections, traffic light status, vehicle counts, density, emergency alerts, accident reports, captured images, speed violations, and event timestamps
- Manage overall project workflow and coordinate between teams

### Team 3 — Backend, Database & Security
- Develop Flask backend and REST APIs (ESP32, AI, Database, Website)
- Implement traffic control logic (vehicle count → signal timing, emergency → priority)
- Design Supabase database schema (intersections, traffic data, vehicles, alerts, accidents, speed violations)
- Implement security (Row Level Security, API protection)

### Team 4 — AI & Computer Vision
- Implement YOLO object detection (cars, buses, trucks, emergency vehicles, pedestrians)
- Vehicle tracking between intersections
- Incident detection (accidents, abnormal behavior, congestion)
- Dataset preparation, accuracy testing, and performance reports

### Team 5 — Hardware, IoT & Networking
- Program ESP32-S3 devices (Wi-Fi, camera data transmission, receive control commands)
- Build electronic system (LEDs, OLED, buttons, cameras, traffic light circuits, power)
- Configure and test device communication
- Network performance monitoring and troubleshooting
