// CamJam EduKit 3 - Robotics - Basic collision detection
// Andy Davies github.com/globalroo

/********************************************************************************/
/* Distance sensor	- basic collision detection									*/
/********************************************************************************/

const Gpio = require("pigpio").Gpio
const HID = require("node-hid")
const robotEvents = require("./robot-events")

const device = new HID.HID("/dev/hidraw0")
device.setNonBlocking(1)

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECONDS_PER_CM = 1e6 / 34321

const trigger = new Gpio(17, { mode: Gpio.OUTPUT })
const echo = new Gpio(18, { mode: Gpio.INPUT, alert: true })

trigger.digitalWrite(0) // Make sure trigger is low

let startTick

echo.on("alert", (level, tick) => {
	if (level == 1) {
		startTick = tick
	} else {
		const endTick = tick
		const diff = (endTick >> 0) - (startTick >> 0)
		const cm = diff / 2 / MICROSECONDS_PER_CM
		if (cm < 25) {
			robotEvents.emit("setEmergencyStop", true)
		}
	}
})

const ping = setInterval(() => {
	trigger.trigger(10, 1) // Set trigger high for 10 microseconds
}, 150)

process.on("SIGINT", function () {
	clearInterval(ping)
})
