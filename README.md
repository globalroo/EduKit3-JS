# CamJam EduKit3-JS CamJam Edukit 3 JS

A Javascript take on the CamJam EduKit 3.

- You can get the kit here: https://thepihut.com/products/camjam-edukit-3-robotics
- If you have a 3D printer you can print a chassis from various models on https://www.thingiverse.com. I used this one: https://www.thingiverse.com/thing:2353479

## Install the dependencies

It should run ok with Node version 14+.

https://nodejs.org/

if you're using a rPi Zero 1 you can get unofficial builds for node here:

https://unofficial-builds.nodejs.org/download/release/

Then install

```
npm i
```

## Run with collision detection and bluetooth controller (tested with XBox)
```
sudo node index
```

## You can write manual commands too

There's an example in index.js you can execute it by running

```sh
sudo node index --testDrive
```

## API

```javascript
const {
    driveBackward,
    driveForward,
    gentleLeft,
    gentleLeftBack,
    gentleRight,
    gentleRightBack,
    moveBackward,
    moveForward,
    spinLeft,
    spinRight,
    stopMotors,
    turnLeft,
    turnRight
} = require("./src/motors")

moveForward()
stopMotors()
```

If you want to drive forward for a specific amount of time or turn a specific number of degrees

```javascript
driveForward(500) // ms
turnLeft(90) //degrees
```

![Alt text](piXel.png?raw=true "CamJam EduKit 3")
