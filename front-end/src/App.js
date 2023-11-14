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

  const odds = [
    {
      homeTeam: "Man City",
      homeOddsFrac: "3/5",
      homeOddsDec: 1.6,
      homePerc: 59,
      draw: "Draw",
      drawOddsFrac: "12/5",
      drawOddsDec: 4.4,
      drawPerc: 21,
      awayTeam: "Liverpool",
      awayOddsFrac: "13/5",
      awayOddsDec: 4.6,
      awayPerc: 20,
    },
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
      const transaction = await bettingGameContract.betHomeTeam(
        (betAmount * weiConv).toString(),
        odds,
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
        (betAmount * weiConv).toString(),
        odds,
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
        (betAmount * weiConv).toString(),
        odds,
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
        value: ethers.parseUnits(depositAmount, "ether"),
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
      const withdrawAmount = (withdrawalAmount * weiConv).toString();
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
    parseInt(betAmount) > parseInt(balance) || betAmount < 0.01;

  const betInvalid = betAmount === "";

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
        balance={balance / weiConv}
        setDepositAmount={setDepositAmount}
        setWithdrawalAmount={setWithdrawalAmount}
      />
      <div>
        <div>
          <h3>Stake an amount and choose who you think will win the match!</h3>
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
              <button
                onClick={() => betHomeTeam(x.homeOddsDec, x.homePerc)}
                disabled={betDisabled}
              >
                <div>
                  {x.homeTeam}
                  {x.homeOddsFrac}
                </div>
              </button>
              <button
                onClick={() => betDraw(x.drawOddsDecDec, x.drawPerc)}
                disabled={betDisabled}
              >
                <div>
                  {x.draw}
                  {x.drawOddsFrac}
                </div>
              </button>
              <button
                onClick={() => betAwayTeam(x.awayOddsDec, x.awayPerc)}
                disabled={betDisabled}
              >
                <div>
                  {x.awayTeam}
                  {x.awayOddsFrac}
                </div>
              </button>
            </>
          ))}
        </div>
        <div>
          {betDisabled && !betInvalid ? <h3>Bet amount invalid</h3> : <h3></h3>}
        </div>
        {resultIn && (
          <div>
            <h1>
              Result is... <br />
              <span style={{ fontSize: 72 }}>{randomNumber}</span>
            </h1>
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
