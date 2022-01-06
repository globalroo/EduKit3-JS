const commandLineArgs = require("command-line-args")

const {
	driveBackward,
	driveForward,
	stopMotors,
	turnLeft,
	turnRight,
	wait,
} = require("./src/motors")

const commandLineOptions = [
	{ name: "testDrive", type: Boolean },
	{ name: "disableCollision", type: Boolean },
	{ name: "disableBluetooth", type: Boolean }
]

const userArgs = commandLineArgs(commandLineOptions)

if (userArgs.testDrive) {
	/********************************************************************************/
	/* Manual example                                          					    */
	/********************************************************************************/

	// eslint-disable-next-line no-extra-semi
	;(async () => {
		await driveForward()
		await turnLeft()
		await wait(1000) //ms
		await driveForward()
		await turnLeft()
		await wait(1000) //ms
		await driveForward()
		await turnLeft()
		await wait(1000) //ms
		await driveForward()
		await turnLeft()
		await wait(1000) //ms
		await turnRight()
		await driveBackward()
		stopMotors()
	})()
} else {
	/********************************************************************************/
	/* Basic controls - presumes a bound controller sets up collision avoidance     */
	/********************************************************************************/
	if (!userArgs.disableCollision) {
		require("./src/collision")
	}
	if (!userArgs.disableBluetooth) {
		require("./src/bluetooth")
	}
}
