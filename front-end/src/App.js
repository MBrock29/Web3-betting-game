import { useState, useEffect, useRef } from "react";
import "./App.css";
import Web3Modal from "web3modal";
import { BETTING_GAME_CONTRACT_ADDRESS, abi } from "./constants/index";
import Header from "./components/header/Header";
import { ethers } from "ethers";
import "./index.css";
import { odds, homeWin, awayWin, draw } from "./components/header/Odds";

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
  const [yourSelection, setYourSelection] = useState("");

  console.log(yourSelection, "your selection", result, "result", randomNumber);

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

      const transaction = await bettingGameContract.betHomeTeam(
        ((betAmount * weiConv) / 10000).toString(),
        Math.round(odds * 100),
        perc
      );
      setTeamSelected("home");
      setLoading(true);
      await transaction.wait();
      await getRandomNumber();
      await setResultIn(true);
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
      await getRandomNumber();
      await setResultIn(true);
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
      await getRandomNumber();
      await setResultIn(true);
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
    setYourSelection(x.homeTeam);
  };
  const drawClicked = (x) => {
    setResultIn(false);
    betDraw(x.drawOddsDec, x.drawPerc);
    setHomeTeamSelected(x.homeTeam);
    setAwayTeamSelected(x.awayTeam);
    setYourSelection("Draw");
  };

  const awayClicked = (x) => {
    setResultIn(false);
    betAwayTeam(x.awayOddsDec, x.awayPerc);
    setHomeTeamSelected(x.homeTeam);
    setAwayTeamSelected(x.awayTeam);
    setYourSelection(x.awayTeam);
  };

  const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

  useEffect(() => {
    setLoading(false);
    setBetAmount("");
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
    <div className="bg-[#1A202C] text-white h-screen w-full flex flex-col">
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
        <div className="flex w-4/12 flex-col mr-5 items-center bg-[#4A5568] p-5 rounded-lg h-[70%] text-center">
          <h4 className="mb-6">Stake an amount and select a result!</h4>
          <h4 className="mb-6">Minimum bet amount: 100</h4>
          <h4 className="mb-6">Maximum bet amount: 1000</h4>
          <input
            type="number"
            placeholder="Enter bet amount"
            className="flex text-center rounded-full text-black"
            max={balance}
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
          />
          {loading && (
            <div className="mt-8 text-2xl text-center">Loading...</div>
          )}
          <div>
            {/* {betDisabled && (
              <h3 className="mt-8 text-2xl text-center">
                Please enter a valid bet amount
              </h3>
            )} */}
          </div>
          {resultIn && (
            <div className="mt-6 text-2xl text-center">
              <h2 className="mb-4">Your selection is {yourSelection}</h2>
              <h2 className="mb-4">
                Result is... <br />
                <div className="mt-4">
                  {homeTeamSelected} {displayResultOutcome} {awayTeamSelected}
                </div>
              </h2>
              <h2>
                {" "}
                {result
                  ? "Congratulations!"
                  : "Unlucky, better luck next time!"}
              </h2>
            </div>
          )}
        </div>
        <div className="flex w-8/12 flex-col ml-5 bg-[#4A5568] p-5 rounded-lg h-full overflow-auto">
          {odds.map((x) => (
            <div className="flex w-full">
              <button
                className="border-2 border-white rounded-full text-sm font-bold py-2 px-5 my-2 mx-2 w-4/12 hover:bg-white hover:text-black hover:cursor-pointer disabled:opacity-40"
                onClick={() => homeClicked(x)}
                disabled={betDisabled}
              >
                <div>
                  {x.homeTeam} &nbsp;
                  {x.homeOddsFrac}
                </div>
              </button>
              <button
                className="border-2 border-white rounded-full text-sm font-bold py-2 px-5 my-2 mx-2 w-4/12 hover:bg-white hover:text-black hover:cursor-pointer disabled:opacity-40"
                onClick={() => drawClicked(x)}
                disabled={betDisabled}
              >
                <div>
                  {x.draw}&nbsp;
                  {x.drawOddsFrac}
                </div>
              </button>
              <button
                className="border-2 border-white rounded-full text-sm font-bold py-2 px-5 my-2 mx-2 w-4/12 hover:bg-white hover:text-black hover:cursor-pointer disabled:opacity-40"
                onClick={() => awayClicked(x)}
                disabled={betDisabled}
              >
                <div>
                  {x.awayTeam}&nbsp;
                  {x.awayOddsFrac}
                </div>
              </button>
            </div>
          ))}
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
