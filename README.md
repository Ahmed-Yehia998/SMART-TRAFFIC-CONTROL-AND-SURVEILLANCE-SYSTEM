# Vehicle Detection, Tracking and Counting using YOLOv8

A computer vision project that detects vehicles in a video, assigns tracking IDs, and counts vehicles as they cross a predefined horizontal counting line.

## Overview

The project uses **YOLOv8** for vehicle detection and **ByteTrack** for multi-object tracking. It focuses on three vehicle classes:

- Cars
- Buses
- Trucks

For each processed frame, the program displays the vehicles currently visible. It also keeps cumulative statistics for unique tracking IDs and counts the tracked vehicles that cross the counting line.

> **Important:** A tracking ID is not a guaranteed real-world vehicle identity. If the tracker loses a vehicle and later assigns it a new ID, the same physical vehicle may be counted more than once in the unique-track statistics. Line-crossing counts also depend on the vehicle being tracked on both sides of the line.

## Features

- Vehicle detection with the pretrained `yolov8n.pt` model.
- Tracking with ByteTrack and persistent track IDs.
- Detection of cars, buses, and trucks.
- A horizontal line used for vehicle-crossing counts.
- Separate display of currently visible vehicles, unique tracked IDs, and line crossings.
- Export of an annotated MP4 video and CSV/JSON results.
- Periodic sample-frame images for evaluation.

## Technologies

- Python
- Ultralytics YOLOv8
- OpenCV
- ByteTrack
- Pandas
- ImageIO-FFmpeg
- Jupyter Notebook / IPython

## Project Requirements

Install the required Python packages:

```bash
pip install ultralytics opencv-python pandas imageio-ffmpeg ipython
```

The code uses `yolov8n.pt`. Ultralytics can download this model automatically when it is not already available locally. An internet connection may be required for the first run.

## Input Video

Set the input video path in the Python code:

```python
VIDEO_PATH = r"C:\proj1\180386-864121573_medium.mp4"
```

Change this path to the location of your own video.

## How to Run

1. Install the required packages.
2. Open the project in VS Code with a Python environment or Jupyter Notebook.
3. Make sure the input video path is correct.
4. Run the complete processing cell.
5. Wait for the processing and MP4 conversion to finish.
6. Check the output directory for the generated files.

The model is initialized with:

```python
model = YOLO("yolov8n.pt")
```

Vehicle classes used by the project are COCO class IDs `2` (car), `5` (bus), and `7` (truck). The counting line is positioned at 60% of the video frame height by default. Its position can be changed in the code.

## Output Files

The program creates the following output directory:

```text
vehicle_detection_results/
├── annotated_vehicles.mp4
├── frame_results.csv
├── summary.json
├── evaluation_template.csv
└── evaluation_samples/
    ├── frame_000300.jpg
    ├── frame_000600.jpg
    └── ...
```

| File | Description |
|---|---|
| `annotated_vehicles.mp4` | Video containing detection boxes, tracking IDs, the counting line, and on-screen statistics. |
| `frame_results.csv` | Frame-by-frame visible counts, unique tracked-ID counts, and line-crossing counts. |
| `summary.json` | Final video information and cumulative statistics. |
| `evaluation_template.csv` | Empty template for entering manually verified counts. |
| `evaluation_samples/` | Sample frames saved periodically for manual inspection. |

## Understanding the Counts

The program reports three different measurements:

1. **Currently visible:** Vehicles detected in the current frame. This value can become zero when no vehicles are visible in that frame.
2. **Unique tracked vehicles:** Number of different tracking IDs observed so far, grouped by vehicle class. This value is cumulative, but it may not equal the exact number of physical vehicles because tracking IDs can change.
3. **Line crossings:** Number of tracked IDs that crossed the counting line. Each tracking ID is counted at most once, regardless of crossing direction.

A zero line-crossing count does not mean that no vehicles were detected. It may mean that no tracked vehicle crossed the line while maintaining the same tracking ID.

## Configuration

You can adjust these settings in the code:

```python
conf=0.30
line_y = int(height * 0.60)
```

- `conf`: YOLO confidence threshold. Increasing it can reduce low-confidence detections; decreasing it may detect more objects but can also add false detections.
- `line_y`: Vertical position of the counting line. The default is 60% of the frame height.

The project uses `bytetrack.yaml` as its tracker configuration.

## Limitations

- Detection and tracking quality depend on video quality, camera angle, lighting, occlusion, and vehicle size.
- A vehicle may receive a new tracking ID after an interruption in tracking.
- Vehicles that do not cross the counting line are not included in the line-crossing total.
- The evaluation template does not contain ground-truth labels. Detection accuracy, precision, recall, and other evaluation metrics must not be claimed until manually verified ground-truth annotations are added and compared with predictions.
- The default counting line and confidence threshold may need adjustment for different videos.

## Authors

- **MOHAMED EMARA** 🇪🇬
- **ZEYAD HEDAYA**
- **ABOBAKR MOHAMED**
