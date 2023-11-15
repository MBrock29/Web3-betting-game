import { useState, useEffect, useRef } from "react";
import "./App.css";
import Web3Modal from "web3modal";
import { BETTING_GAME_CONTRACT_ADDRESS, abi } from "./constants/index";
import Header from "./components/header/Header";
import { ethers } from "ethers";
import "./index.css";

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
      drawOddsFrac: "17/5",
      drawOddsDec: 4.4,
      drawPerc: 21,
      awayTeam: "Liverpool",
      awayOddsFrac: "18/5",
      awayOddsDec: 4.6,
      awayPerc: 20,
    },
    {
      homeTeam: "Luton",
      homeOddsFrac: "5/2",
      homeOddsDec: 3.5,
      homePerc: 27,
      draw: "Draw",
      drawOddsFrac: "23/10",
      drawOddsDec: 3.3,
      drawPerc: 28,
      awayTeam: "Palace",
      awayOddsFrac: "11/10",
      awayOddsDec: 2.1,
      awayPerc: 45,
    },
    {
      homeTeam: "N Forest",
      homeOddsFrac: "2/1",
      homeOddsDec: 3,
      homePerc: 29,
      draw: "Draw",
      drawOddsFrac: "8/5",
      drawOddsDec: 2.6,
      drawPerc: 33,
      awayTeam: "Brighton",
      awayOddsFrac: "6/5",
      awayOddsDec: 2.2,
      awayPerc: 39,
    },
    {
      homeTeam: "Burnley",
      homeOddsFrac: "5/2",
      homeOddsDec: 3.5,
      homePerc: 26,
      draw: "Draw",
      drawOddsFrac: "5/2",
      drawOddsDec: 3.5,
      drawPerc: 26,
      awayTeam: "West Ham",
      awayOddsFrac: "19/20",
      awayOddsDec: 1.95,
      awayPerc: 47,
    },
    {
      homeTeam: "Newcastle",
      homeOddsFrac: "7/5",
      homeOddsDec: 2.4,
      homePerc: 39,
      draw: "Draw",
      drawOddsFrac: "12/5",
      drawOddsDec: 3.4,
      drawPerc: 27,
      awayTeam: "Chelsea",
      awayOddsFrac: "17/10",
      awayOddsDec: 2.7,
      awayPerc: 34,
    },
    {
      homeTeam: "Sheff Utd",
      homeOddsFrac: "23/10",
      homeOddsDec: 3.3,
      homePerc: 28,
      draw: "Draw",
      drawOddsFrac: "12/5",
      drawOddsDec: 3.4,
      drawPerc: 28,
      awayTeam: "Bournemouth",
      awayOddsFrac: "23/20",
      awayOddsDec: 2.15,
      awayPerc: 44,
    },
    {
      homeTeam: "Brentford",
      homeOddsFrac: "33/10",
      homeOddsDec: 4.3,
      homePerc: 22,
      draw: "Draw",
      drawOddsFrac: "27/10",
      drawOddsDec: 3.7,
      drawPerc: 25,
      awayTeam: "Arsenal",
      awayOddsFrac: "3/4",
      awayOddsDec: 1.75,
      awayPerc: 53,
    },
    {
      homeTeam: "Tottenham",
      homeOddsFrac: "5/4",
      homeOddsDec: 2.25,
      homePerc: 42,
      draw: "Draw",
      drawOddsFrac: "29/10",
      drawOddsDec: 3.9,
      drawPerc: 24,
      awayTeam: "Aston Villa",
      awayOddsFrac: "7/4",
      awayOddsDec: 2.75,
      awayPerc: 34,
    },
    {
      homeTeam: "Everton",
      homeOddsFrac: "7/4",
      homeOddsDec: 2.75,
      homePerc: 34,
      draw: "Draw",
      drawOddsFrac: "12/5",
      drawOddsDec: 3.4,
      drawPerc: 27,
      awayTeam: "Man Utd",
      awayOddsFrac: "7/5",
      awayOddsDec: 2.4,
      awayPerc: 39,
    },
    {
      homeTeam: "Fulham",
      homeOddsFrac: "5/4",
      homeOddsDec: 2.25,
      homePerc: 42,
      draw: "Draw",
      drawOddsFrac: "23/10",
      drawOddsDec: 3.3,
      drawPerc: 29,
      awayTeam: "Wolverhampton",
      awayOddsFrac: "11/5",
      awayOddsDec: 3.2,
      awayPerc: 29,
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
      setBetAmount(0);
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
      setTeamSelected("home");
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
      setTeamSelected("draw");
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
      setTeamSelected("away");
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

  const betDisabled =
    betAmount < 100 || betAmount > 1000 || betAmount > balance;

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
    setHomeTeamSelected(x.homeTeam);
    setAwayTeamSelected(x.awayTeam);
  };
  const drawClicked = (x) => {
    setResultIn(false);
    betDraw(x.drawOddsDec, x.drawPerc);
    setHomeTeamSelected(x.homeTeam);
    setAwayTeamSelected(x.awayTeam);
  };

  const awayClicked = (x) => {
    setResultIn(false);
    betAwayTeam(x.awayOddsDec, x.awayPerc);
    setHomeTeamSelected(x.homeTeam);
    setAwayTeamSelected(x.awayTeam);
  };

  const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

  useEffect(() => {
    setLoading(false);
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

  return (
    <div className="bg-[#323546] text-white h-screen w-full flex flex-col">
      <Header
        deposit={deposit}
        withdraw={withdraw}
        withdrawalAllowed={withdrawalAllowed}
        address={account}
        balance={(balance / weiConv) * 10000}
        setDepositAmount={setDepositAmount}
        setWithdrawalAmount={setWithdrawalAmount}
      />
      <div className="flex w-9/12 justify-evenly mx-auto mt-5">
        <div className="flex w-6/12 flex-col mr-5 items-center bg-[#222529] p-5 rounded-lg h-[60%] text-center">
          <h4 className="mb-8">
            Stake an amount and choose who you think will win the match!
          </h4>
          <h4 className="mb-8">Minimum bet amount: 100</h4>
          <h4 className="mb-8">Maximum bet amount: 1000</h4>
          <input
            type="number"
            placeholder="Enter bet amount"
            className="flex text-center rounded-full text-black"
            max={balance}
            onChange={(e) => setBetAmount(e.target.value)}
          />
          {loading && (
            <div className="mt-8 text-2xl text-center">Loading...</div>
          )}
          {resultIn && (
            <div className="mt-8 text-2xl text-center">
              <h1 className="mb-4">
                Result is... <br />
                <div className="mt-4">
                  {homeTeamSelected} {displayResultOutcome} {awayTeamSelected}
                </div>
              </h1>
              <h2>
                {" "}
                {result
                  ? "Congratulations!"
                  : "Unlucky, better luck next time!"}
              </h2>
            </div>
          )}
        </div>
        <div className="flex w-6/12 flex-col ml-5 bg-[#222529] p-5 rounded-lg h-[60%] overflow-auto">
          {odds.map((x) => (
            <div className="flex w-full">
              <button
                className="border-2 border-white rounded-full py-2 px-5 my-2 mx-2 w-4/12 hover:bg-white hover:text-black hover:cursor-pointer disabled:opacity-40"
                onClick={() => homeClicked(x)}
                disabled={betDisabled}
              >
                <div>
                  {x.homeTeam} <br />
                  {x.homeOddsFrac}
                </div>
              </button>
              <button
                className="border-2 border-white rounded-full py-2 px-5 my-2 mx-2 w-4/12 hover:bg-white hover:text-black hover:cursor-pointer disabled:opacity-40"
                onClick={() => drawClicked(x)}
                disabled={betDisabled}
              >
                <div>
                  {x.draw}
                  <br />
                  {x.drawOddsFrac}
                </div>
              </button>
              <button
                className="border-2 border-white rounded-full py-2 px-5 my-2 mx-2 w-4/12 hover:bg-white hover:text-black hover:cursor-pointer disabled:opacity-40"
                onClick={() => awayClicked(x)}
                disabled={betDisabled}
              >
                <div>
                  {x.awayTeam}
                  <br />
                  {x.awayOddsFrac}
                </div>
              </button>
            </div>
          ))}
        </div>
        <div>
          {/* {betDisabled && betInvalid ? <h3>Bet amount invalid</h3> : <h3></h3>} */}
        </div>
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
      {/* {wrongNetwork && (
        <div>
          <h1>Network error. Please connect to Rinkeby test network.</h1>
        </div>
      )} */}
    </div>
  );
}

export default App;
