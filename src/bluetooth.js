// CamJam EduKit 3 - Robotics - Bluetooth controller
// Andy Davies github.com/globalroo

/********************************************************************************/
/* Bluetooth controller code - tested with XBox One controller					*/
/********************************************************************************/

const HID = require("node-hid")
const robotEvents = require("./robot-events")

const {
	gentleLeft,
	gentleLeftBack,
	gentleRight,
	gentleRightBack,
	moveBackward,
	moveForward,
	spinLeft,
	spinRight,
	stopMotors
} = require("./motors")

let emergencyStop = false

robotEvents.on("setEmergencyStop", (value) => {
	emergencyStop = value
})

const device = new HID.HID("/dev/hidraw0")
device.setNonBlocking(1)

console.log("Found devices::\n", HID.devices())

device.on("data", async function (buffer) {
	const { data } = buffer.toJSON()
	const [
		__,
		__lleft,
		__lr = 130,
		__lup,
		ud = 130,
		__rleft,
		rlr = 130,
		__rup,
		__rud = 130,
		leftTrigger,
		__tmpb,
		rightTrigger,
		__tmpd,
		__tmpe,
		__shoulderButtons
	] = data

	const left = rlr < 110
	const up = ud < 110
	const down = ud > 150
	const right = rlr > 150

	if (!emergencyStop) {
		if (up && left) {
			gentleLeft()
			return
		}
		if (up && right) {
			gentleRight()
			return
		}
		if (up) {
			moveForward()
			return
		}
	}
	if (down || left || right) {
		robotEvents.emit("setEmergencyStop", false)
	}

	if (down && left) {
		gentleLeftBack()
		return
	}

	if (down && right) {
		gentleRightBack()
		return
	}

	if (down) {
		moveBackward()
		return
	}

	if (left) {
		spinLeft()
		return
	}

	if (right) {
		spinRight()
		return
	}

	if (leftTrigger && rightTrigger) {
		stopMotors()
		return
	}
	if (leftTrigger) {
		spinLeft()
		return
	}

	if (rightTrigger) {
		spinRight()
		return
	}

	stopMotors()
})

device.on("error", function (error) {
	console.error({ error })
})

process.on("SIGINT", function () {
	device.close()
	process.exit()
})
