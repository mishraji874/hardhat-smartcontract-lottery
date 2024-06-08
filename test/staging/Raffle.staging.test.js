import fetch from "node-fetch";
const { assert, except } = require('chai');
const { getNamedAccounts, ethers, network } = require('hardhat');
const { developmentChains } = require('../../helper-hardhat-config');


developemtnChains.includes(netwwork.name)
    ? describe.skip
    : describe("Raffle Staging tests", function () {
        let raffle, raffleEntranceFee, deployer
        
        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer
            raffle = await ethers.getContract("Raffle", deployer)
            raffleEntranceFee = await raffle.entranceFee()
        })

        describe("fulfillRandomWWords", function () {
            it("works with live Chainlink keepers and Chainlink VRF, we get a random number", async function () {

                //enter the raffle
                console.log("Setting up text...")
                const startingTimeStamp = await raffle.getLastTimeStamp()
                const accounts = await ethers.getSigners()

                console.log("Setting up listener...")
                await new Promise(async (resolve, reject) => {
                    //setup listener before we enter the raffle
                    //just in case the blockchain moves REALLY fast
                    raffle.once("WinnerPicked", async () => {
                        console.log("WWinnerPicked event fired!")
                        try {
                            //add some assets here
                            const recentWinner = await raffle.getRecentWinner()
                            const raffleState = await raffle.getRaffleState()
                            const winnerEndingBalance = await accounts[0].getBalance()
                            const endingTimeStamp = await raffle.getLastTimeStamp()

                            await except(raffle.getPlayer(0)).to.be.reverted
                            assert.equal(recentWinner.toString(), accounts[0].address)
                            assert.equal(raffleState, 0)
                            assert.equal(
                                winnerEndingBalance.toString(),
                                winnerStartingBalance.add(raffleEntranceFee).toString()
                            )
                            assert(endingTimeStamp > startingTimeStamp)
                            resolve()
                        } catch (error) {
                            console.log(error)
                            reject(error)
                        }
                    })
                    
                    console.log("Entering Raffle...")
                    const tx = await raffle.enterRaffle({ value: raffleEntranceFee })
                    await tx.wait(1)
                    console.log("OK, time to wait...")
                    const winnerStartingBalance = await accounts[0].getBalance()



                    // and this code WONT complete until our listener has finished listening!
                })
            })
        })
    })