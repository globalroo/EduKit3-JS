// CamJam EduKit 3 - Robotics - Motor direction control
// Andy Davies github.com/globalroo

/********************************************************************************/
/* Motor switches																*/
/********************************************************************************/

const Gpio = require("pigpio").Gpio
const wait = require('util').promisify(setTimeout)

const DIRECTION = {
	LEFT: 0,
	RIGHT: 1,
	FORWARD: 2,
	BACKWARD: 3
}

const turnDegree = 1.84 // Engage engines for this many ms for equivalent 1 degree turn will vary on weight / power

const leftForward = new Gpio(7, { mode: Gpio.OUTPUT })
const leftBackward = new Gpio(8, { mode: Gpio.OUTPUT })
const rightForward = new Gpio(9, { mode: Gpio.OUTPUT })
const rightBackward = new Gpio(10, { mode: Gpio.OUTPUT })

const backwardMotors = [leftBackward, rightBackward]
const forwardMotors = [leftForward, rightForward]
const turnLeftMotors = [leftBackward, rightForward]
const turnRightMotors = [leftForward, rightBackward]

const allMotors = [...forwardMotors, ...backwardMotors]

const setMotorState = (motors, value) =>
	motors.forEach((m) => m.digitalWrite(value))

const turnOff = (motors) => setMotorState(motors, 0)
const turnOn = (motors) => setMotorState(motors, 1)

const turn = async (direction = DIRECTION.LEFT, degrees = 90) => {
	direction === DIRECTION.LEFT ? spinLeft() : spinRight()
	return new Promise((resolve) =>
		setTimeout(() => {
			stopMotors()
			resolve()
		}, degrees * turnDegree)
	)
}

const move = async (direction = DIRECTION.FORWARD, time = 1000) => {
	direction === DIRECTION.FORWARD ? moveForward() : moveBackward()
	return new Promise((resolve) =>
		setTimeout(() => {
			stopMotors()
			resolve()
		}, time)
	)
}

const driveBackward = async (time) => move(DIRECTION.BACKWARD, time)
const driveForward = async (time) => move(DIRECTION.FORWARD, time)

const gentleLeft = () => {
	stopMotors()
	turnOn([rightForward])
}

const gentleLeftBack = () => {
	stopMotors()
	turnOn([rightBackward])
}

const gentleRight = () => {
	stopMotors()
	turnOn([leftForward])
}

const gentleRightBack = () => {
	stopMotors()
	turnOn([leftBackward])
}

const moveBackward = () => {
	turnOff(forwardMotors)
	turnOn(backwardMotors)
}

const moveForward = () => {
	turnOff(backwardMotors)
	turnOn(forwardMotors)
}

const spinLeft = () => {
	turnOff(turnRightMotors)
	turnOn(turnLeftMotors)
}

const spinRight = () => {
	turnOff(turnLeftMotors)
	turnOn(turnRightMotors)
}

const stopMotors = () => turnOff(allMotors)

const turnLeft = async (degrees) => turn(DIRECTION.RIGHT, degrees)
const turnRight = async (degrees) => turn(DIRECTION.RIGHT, degrees)

module.exports = {
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
	turnRight,
	wait
}
