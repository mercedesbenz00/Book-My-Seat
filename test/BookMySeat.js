const { expect } = require('chai')
const { ethers } = require('hardhat')

const NAME = 'BookMySeat'
const SYMBOL = 'BMS'

const OCCASION_NAME = "ETH Prayagraj"
const OCCASION_COST = ethers.parseUnits('1.0', 'ether')
const OCCASION_MAX_TICKETS = 100
const OCCASION_DATE = "Apr 27"
const OCCASION_TIME = "10:00AM IST"
const OCCASION_LOCATION = "Prayagraj, UP, India"

describe("BookMySeat", () => {
    let BookMySeat, bookMySeat
    let deployer, buyer

    beforeEach(async () => {
        // Setup account
        [deployer, buyer] = await ethers.getSigners()

        BookMySeat = await ethers.getContractFactory('BookMySeat')
        bookMySeat = await BookMySeat.deploy(NAME, SYMBOL)

        // connect specifies which account we are using to do transaction on blockchain
        const transaction = await bookMySeat.connect(deployer).list(
            OCCASION_NAME,
            OCCASION_COST,
            OCCASION_MAX_TICKETS,
            OCCASION_DATE,
            OCCASION_TIME,
            OCCASION_LOCATION
        )

        await transaction.wait()
    })
    
    describe("Deployment", () => {

        it("sets the name", async () => {
            let name = await bookMySeat.name()
            expect(name).to.equal(NAME) 
        })
        
        it("sets the symbol", async () => {
            let symbol = await bookMySeat.symbol()
            expect(symbol).to.equal(SYMBOL) 
        })

        it("sets the owner", async () => {
            let owner = await bookMySeat.owner()
            expect(owner).to.equal(deployer.address)
        })
    })

    describe("Occasions", () => {

        it("updates occasions count", async () => {
            const totalOccasions = await bookMySeat.totalOccasions()
            expect(totalOccasions).to.equal(1)
        })

        it('returns occasions attributes', async () => {
            const occasion = await bookMySeat.getOccasion(1)
            expect(occasion.id).to.be.equal(1)
            expect(occasion.name).to.be.equal(OCCASION_NAME)
            expect(occasion.cost).to.be.equal(OCCASION_COST)
            expect(occasion.tickets).to.be.equal(OCCASION_MAX_TICKETS)
            expect(occasion.date).to.be.equal(OCCASION_DATE)
            expect(occasion.time).to.be.equal(OCCASION_TIME)
            expect(occasion.location).to.be.equal(OCCASION_LOCATION)
        })
    })

    describe('Minting', () => { 
        const ID = 1
        const SEAT = 50
        const AMOUNT = ethers.parseUnits('1.0', 'ether')
        
        beforeEach(async () => {
            const transaction = await bookMySeat.connect(buyer).mint(ID, SEAT, { value: AMOUNT })
            await transaction.wait()
        })

        it('updates ticket count', async () => {
            const occasion = await bookMySeat.getOccasion(1)
            expect(occasion.tickets).to.be.equal(OCCASION_MAX_TICKETS - 1)
        })

        it('updates buying status', async () => {
            const status = await bookMySeat.hasBought(ID, buyer.address)
            expect(status).to.be.equal(true)
        })

        it('updates seat status', async () => {
            const owner = await bookMySeat.seatTaken(ID, SEAT)
            expect(owner).to.equal(buyer.address)
        })

        it('updates overall seating status', async () => {
            const seats = await bookMySeat.getSeatsTaken(ID)
            expect(seats.length).to.equal(1)
            expect(seats[0]).to.equal(SEAT)
        })
        
        it('Updates the contract balance', async () => {
            const balance = await ethers.provider.getBalance(bookMySeat.getAddress())
            expect(balance).to.be.equal(AMOUNT)
        })
    })

    describe("Withdrawing", () => {
        const ID = 1
        const SEAT = 50
        const AMOUNT = ethers.parseUnits('1.0', 'ether')
        let balanceBefore

        beforeEach(async () => {
            balanceBefore = await ethers.provider.getBalance(deployer.address)

            let transaction = await bookMySeat.connect(buyer).mint(ID, SEAT, { value: AMOUNT })
            await transaction.wait()

            transaction = await bookMySeat.connect(deployer).withdraw()
            await transaction.wait()
        })

        it('updates the owner balance', async () => {
            const balanceAfter = await ethers.provider.getBalance(deployer.address)
            expect(balanceAfter).to.be.greaterThan(balanceBefore)
        })

        it('updates the contract balance', async () => {
            const balance = await ethers.provider.getBalance(bookMySeat.getAddress())
            expect(balance).to.equal(0)
        })
    })
})