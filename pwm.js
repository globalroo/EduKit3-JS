const Gpio = require('pigpio').Gpio

//github.com/fivdi/pigpio/blob/master/doc/gpio.md#getpwmrange

// https: pwmWrite(dutyCycle)
// hardwarePwmWrite(frequency, dutyCycle)
// getPwmDutyCycle()
// pwmRange(range)
// getPwmRange()
// getPwmRealRange()
// pwmFrequency(frequency)
// getPwmFrequency()
// const Gpio = require('pigpio').Gpio

// for (let gpioNo = Gpio.MIN_GPIO; gpioNo <= Gpio.MAX_GPIO; gpioNo += 1) {
// 	const gpio = new Gpio(gpioNo)

// 	console.log('GPIO ' + gpioNo + ':' + ' mode=' + gpio.getMode() + ' level=' + gpio.digitalRead())
// 	// console.log({ pwmFreq: gpio.getPwmFrequency() })
// 	// gpio.pwmWrite(127)
// 	console.log({ dutyCycle: gpio.getPwmRange() })
// }

const DIRECTION = {
	LEFT: 0,
	RIGHT: 1,
	FORWARD: 2,
	BACKWARD: 3,
}

const leftForward = new Gpio(7, { mode: Gpio.OUTPUT })
const leftBackward = new Gpio(8, { mode: Gpio.OUTPUT })
const rightForward = new Gpio(9, { mode: Gpio.OUTPUT })
const rightBackward = new Gpio(10, { mode: Gpio.OUTPUT })

const forwardMotors = [leftForward, rightForward]
const backwardMotors = [leftBackward, rightBackward]
const turnLeftMotors = [leftBackward, rightForward]
const turnRightMotors = [leftForward, rightBackward]

const allMotors = [...forwardMotors, ...backwardMotors]

const setMotorState = (motors, value) => motors.forEach((m) => m.pwmWrite(value))

const turnOff = (motors) => setMotorState(motors, 0)
const turnOn = (motors, amount = 255) => setMotorState(motors, amount)

const moveBackward = (speed) => {
	turnOff(forwardMotors)
	turnOn(backwardMotors, speed)
}

const moveForward = (speed) => {
	turnOff(backwardMotors)
	turnOn(forwardMotors, speed)
}
const lazyLeft = (fbDelta, lrDelta) => {
	leftBackward.pwmWrite(0)
	rightBackward.pwmWrite(0)
	leftForward.pwmWrite(fbDelta)
	rightForward.pwmWrite(lrDelta)
}

const lazyRight = (fbDelta, lrDelta) => {
	leftBackward.pwmWrite(0)
	rightBackward.pwmWrite(0)
	rightForward.pwmWrite(fbDelta)
	leftForward.pwmWrite(lrDelta)
}

const stopMotors = () => turnOff(allMotors)

const spinRight = (speed) => {
	turnOff(turnLeftMotors)
	turnOn(turnRightMotors, speed)
}

const spinLeft = (speed) => {
	turnOff(turnRightMotors)
	turnOn(turnLeftMotors, speed)
}

const gentleRight = (speed) => {
	stopMotors()
	turnOn([leftForward], speed)
}

const gentleLeft = (speed) => {
	stopMotors()
	turnOn([rightForward], speed)
}

const gentleRightBack = (speed) => {
	stopMotors()
	turnOn([leftBackward], speed)
}

const gentleLeftBack = (speed) => {
	stopMotors()
	turnOn([rightBackward], speed)
}

const spinRightBackward = (speed) => {
	turnOff(turnLeftBackwardMotors)
	turnOn(turnRightBackwardMotors, speed)
}

const spinLeftBackward = (speed) => {
	turnOff(turnRightBackwardMotors)
	turnOn(turnLeftBackwardMotors, speed)
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
	const [_, lleft, lr = 127, lup, ud = 127, rleft, rlr = 127, rup, rud = 127, a, b, c, d, e, f] = data
	console.log({ data })
	// console.log({ lr, ud, rlr, rud })
	const left = rlr < 110
	const up = ud < 110
	const down = ud > 150
	const right = rlr > 150
	console.log({ rlr, ud })
	const stop = !left && !right && !up && !down
	// figure is half max
	// so percentage of 255

	const lrDelta = rlr < 127 ? 255 - rlr * 2 : (rlr - 127) * 2 - 1
	const fbDelta = ud < 127 ? 255 - ud * 2 : (ud - 127) * 2 - 1
	console.log({ lrDelta: lrDelta, fbDelta: fbDelta })
	if (up && left) {
		// gentleLeft(lrDelta)
		lazyLeft(fbDelta, lrDelta)
		return
	}

	if (down && left) {
		gentleLeftBack(lrDelta)

		return
	}

	if (up && right) {
		// gentleRight(lrDelta)
		// on a turn limit max forward to 50% of true
		lazyRight(fbDelta, lrDelta)
		return
	}

	if (down && right) {
		gentleRightBack(lrDelta)
		return
	}

	if (up) {
		moveForward(fbDelta)
		return
	}

	if (down) {
		moveBackward(fbDelta)
		return
	}

	if (left) {
		spinLeft(lrDelta)
		return
	}

	if (right) {
		spinRight(lrDelta)
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
