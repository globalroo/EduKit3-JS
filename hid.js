// CamJam EduKit 3 - Robotics
// Worksheet 3 - Motor Test Code
const events = require('eventemitter2')
const Gpio = require('pigpio').Gpio

const DIRECTION = {
	LEFT: 0,
	RIGHT: 1,
	FORWARD: 2,
	BACKWARD: 3,
}

const turnDegree = 1.84 // Engage engines for this many ms for equivalent 1 degree turn will vary on weight / power

// forward = bothforward
// backward = bothbackward
// forwardleft = right forward, leftbackward
// forwardRight = leftforward, rightback
// backleft = right backwardMotors, left forward
// bacright = leftbackward, rightforward

const leftForward = new Gpio(7, { mode: Gpio.OUTPUT })
const leftBackward = new Gpio(8, { mode: Gpio.OUTPUT })
const rightForward = new Gpio(9, { mode: Gpio.OUTPUT })
const rightBackward = new Gpio(10, { mode: Gpio.OUTPUT })

const forwardMotors = [leftForward, rightForward]
const backwardMotors = [leftBackward, rightBackward]
const turnLeftMotors = [leftBackward, rightForward]
const turnRightMotors = [leftForward, rightBackward]

const allMotors = [...forwardMotors, ...backwardMotors]

const setMotorState = (motors, value) => motors.forEach((m) => m.digitalWrite(value))

const turnOff = (motors) => setMotorState(motors, 0)
const turnOn = (motors) => setMotorState(motors, 1)

const moveBackward = () => {
	turnOff(forwardMotors)
	turnOn(backwardMotors)
}

const moveForward = () => {
	turnOff(backwardMotors)
	turnOn(forwardMotors)
}

const stopMotors = () => turnOff(allMotors)

const spinRight = () => {
	turnOff(turnLeftMotors)
	turnOn(turnRightMotors)
}

const spinLeft = () => {
	turnOff(turnRightMotors)
	turnOn(turnLeftMotors)
}

const gentleRight = () => {
	stopMotors()
	turnOn([leftForward])
}

const gentleLeft = () => {
	stopMotors()
	turnOn([rightForward])
}

const gentleRightBack = () => {
	stopMotors()
	turnOn([leftBackward])
}

const gentleLeftBack = () => {
	stopMotors()
	turnOn([rightBackward])
}

const spinRightBackward = () => {
	turnOff(turnLeftBackwardMotors)
	turnOn(turnRightBackwardMotors)
}

const spinLeftBackward = () => {
	turnOff(turnRightBackwardMotors)
	turnOn(turnLeftBackwardMotors)
}

const turn = async (direction = LEFT, degrees = 90) => {
	direction === DIRECTION.LEFT ? spinLeft() : spinRight()
	return new Promise((resolve) =>
		setTimeout(() => {
			stopMotors()
			resolve()
		}, degrees * turnDegree)
	)
}

const move = async (direction = FORWARD, time = 1000) => {
	direction === DIRECTION.FORWARD ? moveForward() : moveBackward()
	return new Promise((resolve) =>
		setTimeout(() => {
			stopMotors()
			resolve()
		}, time)
	)
}

const turnRight = async (degrees) => turn(DIRECTION.RIGHT, degrees)
const turnLeft = async (degrees) => turn(DIRECTION.RIGHT, degrees)
const driveForward = async (time) => move(DIRECTION.FORWARD, time)
const driveBackward = async (time) => move(DIRECTION.BACKWARD, time)

const test = async () => {
	await driveForward().turnLeft().turnRight()
	await turnLeft()
	await driveForward()
	await turnLeft()
	await driveForward()
	await turnLeft()
	await driveForward()
	await turnLeft()
	stopMotors()
}

// test().then(() => {
// 	console.log('done')
// })

var HID = require('node-hid')
const device = new HID.HID('/dev/hidraw0')

device.setNonBlocking(1)

device.on('data', async function (buffer) {
	const { data } = buffer.toJSON()
	const [_, lleft, lr = 130, lup, ud = 130, rleft, rlr = 130, rup, rud = 130, a, b, c, d, e, f] = data
	console.log({ data })
	// console.log({ lr, ud, rlr, rud })
	const left = rlr < 110
	const up = ud < 110
	const down = ud > 150
	const right = rlr > 150
	console.log({ a, b, c, d, e, f })
	const stop = !left && !right && !up && !down

	if (up && left) {
		gentleLeft()
		return
	}

	if (down && left) {
		gentleLeftBack()
		return
	}

	if (up && right) {
		gentleRight()
		return
	}

	if (down && right) {
		gentleRightBack()
		return
	}

	if (up) {
		moveForward()
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

	stopMotors()
})

device.on('error', function (error) {
	console.error({ error })
})
// device.close()

console.log('devices:', HID.devices())
process.on('SIGINT', function () {
	device.close()
})
