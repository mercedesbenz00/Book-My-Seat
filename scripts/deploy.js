const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether');
}

async function main() {
  // Setup accounts & variables
  const [deployer] = await ethers.getSigners();
  const NAME = "BookMySeat";
  const SYMBOL = "BMS";

  // console.log(`Deployed BookMySeat Contract at: ${ethers.getSigners()}\n`);
  // Deploy contract
  const gasPrice = await ethers.parseUnits('20', 'gwei');
  const BookMySeat = await ethers.getContractFactory("BookMySeat");
  const bookMySeatPromise = BookMySeat.deploy(NAME, SYMBOL, { gasPrice });
  const bookMySeat = await bookMySeatPromise;
  const bookMySeatAddress = await bookMySeat.getAddress();
  
  console.log(`Deployed BookMySeat Contract at: ${bookMySeatAddress}\n`);

  // List 5 events
  const occasions = [
    {
      name: "Assi Ghat Aarti",
      cost: tokens(2),
      tickets: 0,
      date: "July 2",
      time: "7:00PM IST",
      location: "Varanasi, UP"
    },
    {
      name: "ETH Prayagraj",
      cost: tokens(1),
      tickets: 125,
      date: "July 25",
      time: "1:00PM IST",
      location: "Prayagraj, UP"
    },
    {
      name: "ETH Student Hackathon",
      cost: tokens(0.25),
      tickets: 200,
      date: "July 31",
      time: "10:00AM IST",
      location: "IT Park, Noida"
    },
    {
      name: "Local Artist Event",
      cost: tokens(3),
      tickets: 0,
      date: "August 10",
      time: "2:30PM IST",
      location: "Ahmedabad Cultural Hall, Gujarat"
    },
    {
      name: "ETH Global Toronto",
      cost: tokens(1.5),
      tickets: 125,
      date: "August 23",
      time: "11:00AM EST",
      location: "Toronto, Canada"
    }
  ];

  for (var i = 0; i < 5; i++) {
    const transaction = await bookMySeat.connect(deployer).list(
      occasions[i].name,
      occasions[i].cost,
      occasions[i].tickets,
      occasions[i].date,
      occasions[i].time,
      occasions[i].location,
    );

    await transaction.wait();

    console.log(`Listed Event ${i + 1}: ${occasions[i].name}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
});
