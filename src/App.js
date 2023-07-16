import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components 
import Navigation from './components/Navigation'
import Sort from './components/Sort'
import Card from './components/Card'
import SeatChart from './components/SeatChart'

// ABIs
import BookMySeat from './abis/BookMySeat.json'

// Config
import config from './config.json'

function App() {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)

  const [bookMySeat, setBookMySeat] = useState(null)
  const [occasions, setOccasions] = useState([])

  const [occasion, setOccasion] = useState({})
  const [toggle, setToggle] = useState(false)

  const loadBlockchainData = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()
    const address = config[network.chainId].BookMySeat.address

    const bookMySeat = new ethers.Contract(address, BookMySeat, provider)
    setBookMySeat(bookMySeat)

    const totalOccasions = await bookMySeat.totalOccasions()
    const occasions = []

    for(let i = 1; i <= totalOccasions; i++){
      const occasion = await bookMySeat.getOccasion(i)
      occasions.push(occasion)
    }

    setOccasions(occasions)

    // Refresh Account
    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const acc = ethers.getAddress(accounts[0])
      setAccount(acc)
    })
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>
      <header>
        <Navigation account={account} setAccount={setAccount} />
        <h2 className="header__title"><strong>Show</strong> Tickets</h2>
      </header>

      <Sort />
      
      <div className="cards">
        {occasions && occasions.map((occasion, index) => (
          <Card 
            occasion={occasion}
            id={index + 1}
            bookMySeat={bookMySeat}
            provider={provider}
            account={account}
            toggle={toggle}
            setToggle={setToggle}
            setOccasion={setOccasion}
            key={index}
          />
        ))}
      </div>

      {toggle && (
        <SeatChart 
          occasion={occasion}
          bookMySeat={bookMySeat}
          provider={provider}
          setToggle={setToggle}
        />
      )}

    </div>
  );
}

export default App;
