import { useState, useEffect, useRef } from "react";
import "./App.css";
import Web3Modal from "web3modal";
import { BETTING_GAME_CONTRACT_ADDRESS, abi } from "./constants/index";
import Header from "./components/header/Header";
import { ethers } from "ethers";

function App() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [betAmount, setBetAmount] = useState("");
  const [randomNumber, setRandomNumber] = useState(20);
  const [walletConnected, setWalletConnected] = useState(false);
  const [resultIn, setResultIn] = useState(false);
  const web3ModalRef = useRef();
  const [account, setAccount] = useState(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [result, setResult] = useState(null);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const weiConv = 1000000000000000000;
  const [teamSelected, setTeamSelected] = useState("");
  const [homeTeamSelected, setHomeTeamSelected] = useState("");
  const [awayTeamSelected, setAwayTeamSelected] = useState("");
  const [displayResultOutcome, setDisplayResultOutcome] = useState("");

  const odds = [
    {
      homeTeam: "Man City",
      homeOddsFrac: "3/5",
      homeOddsDec: 1.6,
      homePerc: 59,
      draw: "Draw",
      drawOddsFrac: "12/5",
      drawOddsDec: 3.4,
      drawPerc: 21,
      awayTeam: "Liverpool",
      awayOddsFrac: "13/5",
      awayOddsDec: 3.6,
      awayPerc: 20,
    },
  ];

  const homeWin = [
    "1-0",
    "2-0",
    "3-0",
    "4-0",
    "5-0",
    "5-1",
    "5-2",
    "5-3",
    "5-4",
    "4-1",
    "4-2",
    "4-3",
    "3-2",
    "3-1",
    "2-1",
  ];
  const draw = ["0-0", "1-1", "2-2", "3-3", "4-4"];
  const awayWin = [
    "0-1",
    "0-2",
    "0-3",
    "0-4",
    "0-5",
    "1-5",
    "2-5",
    "3-5",
    "4-5",
    "1-4",
    "2-4",
    "3-4",
    "2-3",
    "1-3",
    "1-2",
  ];

  const getProviderOrSigner = async (needSigner = false) => {
    if (web3ModalRef.current) {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new ethers.BrowserProvider(provider);
      // const { chainId } = await web3Provider.getNetwork();
      // if (chainId !== 11155111) {
      //   console.log("please change network");
      //   setWrongNetwork(true);
      // }

      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    }
  };

  const connectWallet = async () => {
    try {
      setBalance(0);
      const provider = await getProviderOrSigner(true);
      setWalletConnected(true);
      const address = await provider.getAddress();
      setAccount(address);
      getBalance(address);
      getRandomNumber();
    } catch (err) {
      console.error(err);
    }
  };

  const getBalance = async (id) => {
    try {
      const provider = await getProviderOrSigner();
      const bettingGameContract = new ethers.Contract(
        BETTING_GAME_CONTRACT_ADDRESS,
        abi,
        provider
      );
      setBalance(
        ethers.formatUnits(await bettingGameContract.getBalance(id), 0)
      );
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getRandomNumber = async () => {
    try {
      const provider = await getProviderOrSigner();
      const bettingGameContract = new ethers.Contract(
        BETTING_GAME_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const rand = await bettingGameContract.getRandomNumber();
      setBetAmount("");
      setRandomNumber(ethers.formatUnits(rand, 0));
      const outcome = await bettingGameContract.getResult();
      setResult(outcome);
      console.log(outcome);
    } catch (err) {
      console.error(err);
    }
  };

  const betHomeTeam = async (odds, perc) => {
    try {
      const provider = await getProviderOrSigner(true);
      const bettingGameContract = new ethers.Contract(
        BETTING_GAME_CONTRACT_ADDRESS,
        abi,
        provider
      );
      console.log((betAmount * weiConv) / 10000);
      const transaction = await bettingGameContract.betHomeTeam(
        ((betAmount * weiConv) / 10000).toString(),
        Math.round(odds * 100),
        perc
      );
      setLoading(true);
      await transaction.wait();
      setResultIn(true);
      await getRandomNumber();
      await getBalance(account);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const betDraw = async (odds, perc) => {
    try {
      const provider = await getProviderOrSigner(true);
      const bettingGameContract = new ethers.Contract(
        BETTING_GAME_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const transaction = await bettingGameContract.betDraw(
        ((betAmount * weiConv) / 10000).toString(),
        Math.round(odds * 100),
        perc
      );
      setLoading(true);
      await transaction.wait();
      setResultIn(true);
      await getRandomNumber();
      await getBalance(account);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const betAwayTeam = async (odds, perc) => {
    try {
      const provider = await getProviderOrSigner(true);
      const bettingGameContract = new ethers.Contract(
        BETTING_GAME_CONTRACT_ADDRESS,
        abi,
        provider
      );

      const transaction = await bettingGameContract.betAwayTeam(
        ((betAmount * weiConv) / 10000).toString(),
        Math.round(odds * 100),
        perc
      );
      setLoading(true);
      await transaction.wait();
      setResultIn(true);
      await getRandomNumber();
      await getBalance(account);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const deposit = async () => {
    try {
      const provider = await getProviderOrSigner(true);
      const bettingGameContract = new ethers.Contract(
        BETTING_GAME_CONTRACT_ADDRESS,
        abi,
        provider
      );
      console.log(depositAmount);
      const transaction = await bettingGameContract.deposit({
        value: ethers.parseUnits(depositAmount.toString(), "ether"),
      });
      setLoading(true);
      await transaction.wait();
      await getBalance(account);
    } catch (err) {
      console.error(err);
    }
  };

  const withdraw = async () => {
    try {
      const provider = await getProviderOrSigner(true);
      const bettingGameContract = new ethers.Contract(
        BETTING_GAME_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const withdrawAmount = ((withdrawalAmount * weiConv) / 10000).toString();
      console.log(withdrawAmount);
      const transaction = await bettingGameContract.withdraw(withdrawAmount);
      setLoading(true);
      await transaction.wait();
      await getBalance(account);
    } catch (err) {
      console.error(err);
    }
  };

  const betDisabled = betAmount < 100;

  const betInvalid = betAmount < 100;

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  const withdrawalAllowed = balance > 0;

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
    }
  });
  const homeClicked = (x) => {
    setResultIn(false);
    betHomeTeam(x.homeOddsDec, x.homePerc);
    setTeamSelected("home");
    setHomeTeamSelected(x.homeTeam);
    setAwayTeamSelected(x.awayTeam);
  };
  const drawClicked = (x) => {
    setResultIn(false);
    betDraw(x.drawOddsDec, x.drawPerc);
    setTeamSelected("draw");
    setHomeTeamSelected(x.homeTeam);
    setAwayTeamSelected(x.awayTeam);
  };

  const awayClicked = (x) => {
    setResultIn(false);
    betAwayTeam(x.awayOddsDec, x.awayPerc);
    setTeamSelected("away");
    setHomeTeamSelected(x.homeTeam);
    setAwayTeamSelected(x.awayTeam);
  };

  const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

  useEffect(() => {
    const displayResult = () => {
      if (result) {
        switch (teamSelected) {
          case "home":
            return <span>{getRandomElement(homeWin)}</span>;
          case "draw":
            return <span>{getRandomElement(draw)}</span>;
          case "away":
            return <span>{getRandomElement(awayWin)}</span>;
          default:
            return null;
        }
      } else {
        let otherOptions = [];
        if (teamSelected !== "home")
          otherOptions = otherOptions.concat(homeWin);
        if (teamSelected !== "draw") otherOptions = otherOptions.concat(draw);
        if (teamSelected !== "away")
          otherOptions = otherOptions.concat(awayWin);
        return <span>{getRandomElement(otherOptions)}</span>;
      }
    };

    setDisplayResultOutcome(displayResult());
  }, [resultIn]);

  if (loading)
    return (
      <div>
        <h2>Loading...</h2>
      </div>
    );
  return (
    <div>
      <Header
        deposit={deposit}
        withdraw={withdraw}
        withdrawalAllowed={withdrawalAllowed}
        address={account}
        balance={(balance / weiConv) * 10000}
        setDepositAmount={setDepositAmount}
        setWithdrawalAmount={setWithdrawalAmount}
      />
      <div>
        <div>
          <h4>Stake an amount and choose who you think will win the match!</h4>
          <h4>Minimum bet amount: 100</h4>
          <h4>Maximum bet amount: 1000</h4>
        </div>
        <div>
          <input
            type="number"
            placeholder="Enter bet amount"
            max={balance}
            onChange={(e) => setBetAmount(e.target.value)}
          />
          {odds.map((x) => (
            <>
              <button onClick={() => homeClicked(x)} disabled={betDisabled}>
                <div>
                  {x.homeTeam}
                  {x.homeOddsFrac}
                </div>
              </button>
              <button onClick={() => drawClicked(x)} disabled={betDisabled}>
                <div>
                  {x.draw}
                  {x.drawOddsFrac}
                </div>
              </button>
              <button onClick={() => awayClicked(x)} disabled={betDisabled}>
                <div>
                  {x.awayTeam}
                  {x.awayOddsFrac}
                </div>
              </button>
            </>
          ))}
        </div>
        <div>
          {/* {betDisabled && betInvalid ? <h3>Bet amount invalid</h3> : <h3></h3>} */}
        </div>
        {resultIn && (
          <div>
            <h1>
              Result is... <br />
              {homeTeamSelected} {displayResultOutcome} {awayTeamSelected}
            </h1>
            <h2>
              {" "}
              {result ? "Congratulations!" : "Unlucky, better luck next time!"}
            </h2>
          </div>
        )}
      </div>
      {/* {resultIn && (
        <div>
          {result ? (
            <img
              src="https://media.giphy.com/media/l0Ex6kAKAoFRsFh6M/giphy.gif"
              width={300}
              height={225}
            />
          ) : (
            <img
              src="https://media.giphy.com/media/YJjvTqoRFgZaM/giphy.gif"
              width={300}
              height={225}
            />
          )}
        </div>
      )} */}
      {wrongNetwork && (
        <div>
          <h1>Network error. Please connect to Rinkeby test network.</h1>
        </div>
      )}
    </div>
  );
}

export default App;
