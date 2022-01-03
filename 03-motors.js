// CamJam EduKit 3 - Robotics
// Worksheet 3 - Motor Test Code

const Gpio = require('pigpio').Gpio

const DIRECTION = {
	LEFT: 0,
	RIGHT: 1,
	FORWARD: 2,
	BACKWARD: 3,
}

const turnDegree = 1.84 // Engage engines for this many ms for equivalent 1 degree turn will vary on weight / power

const leftForward = new Gpio(7, { mode: Gpio.OUTPUT })
const leftBackward = new Gpio(8, { mode: Gpio.OUTPUT })
const rightForward = new Gpio(9, { mode: Gpio.OUTPUT })
const rightBackward = new Gpio(10, { mode: Gpio.OUTPUT })

const forwardMotors = [leftForward, rightForward]
const backwardMotors = [leftBackward, rightBackward]
const turnLeftMotors = [leftForward, rightBackward]
const turnRightMotors = [leftBackward, rightForward]
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
	direction   === DIRECTION.FORWARD ? moveForward() : moveBackward()
	return new Promise((resolve) =>
		setTimeout(() => {
			stopMotors()
			resolve()
		}, time)
	)
}

const turnRight = 	async (degrees) => turn(DIRECTION.RIGHT, degrees)
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

test().then(() => {
	console.log('done')
})
