import { useState, useEffect, useRef } from "react";
import "./App.css";
import Web3Modal from "web3modal";
import { randomiser_CONTRACT_ADDRESS, abi } from "./constants/index";
import Header from "./components/header/Header";
import { ethers } from "ethers";

function App() {
  const [balance, setBalance] = useState<Number>(0);
  const [loading, setLoading] = useState(false);
  const [betAmount, setBetAmount] = useState<string>("");
  const [randomNumber, setRandomNumber] = useState<Number>(20);
  const [walletConnected, setWalletConnected] = useState(false);
  const [resultIn, setResultIn] = useState(false);
  const web3ModalRef = useRef<Web3Modal>();
  const [account, setAccount] = useState(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [result, setResult] = useState(null);

  const getProviderOrSigner = async (needSigner = false) => {
    if (web3ModalRef.current) {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new ethers.providers.Web3Provider(provider);
      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 11155111) {
        console.log("please change network");
        setWrongNetwork(true);
      }

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
      const randomiserContract = new ethers.Contract(
        randomiser_CONTRACT_ADDRESS,
        abi,
        provider
      );
      setBalance(
        ethers.utils.formatUnits(await randomiserContract.getBalance(id), 0)
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
      const randomiserContract = new ethers.Contract(
        randomiser_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const rand = await randomiserContract.getRandomNumber();
      setBetAmount("");
      setRandomNumber(ethers.utils.formatUnits(rand, 0));
      const outcome = await randomiserContract.getResult();
      setResult(outcome);
      console.log(outcome);
    } catch (err) {
      console.error(err);
    }
  };

  const betHomeTeam = async () => {
    try {
      const provider = await getProviderOrSigner(true);
      const randomiserContract = new ethers.Contract(
        randomiser_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const transaction = await randomiserContract.betHomeTeam(betAmount);
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

  const betLow = async () => {
    try {
      const provider = await getProviderOrSigner(true);
      const randomiserContract = new ethers.Contract(
        randomiser_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const transaction = await randomiserContract.betLow(betAmount);
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
      const randomiserContract = new ethers.Contract(
        randomiser_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const transaction = await randomiserContract.deposit({
        value: ethers.utils.parseUnits("0.01", "ether"),
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
      const randomiserContract = new ethers.Contract(
        randomiser_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const withdrawAmount = (balance * 100000000000000).toString();
      const transaction = await randomiserContract.withdraw(withdrawAmount);
      setLoading(true);
      await transaction.wait();
      await getBalance(account);
    } catch (err) {
      console.error(err);
    }
  };

  console.log(betAmount);

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
    <div className={s.app}>
      <Header
        deposit={deposit}
        withdraw={withdraw}
        withdrawalAllowed={withdrawalAllowed}
        address={account}
        balance={balance}
      />
      <div className={s.background}>
        <div className={s.header}>
          <h3>
            Stake an amount and choose whether you think the random number will
            be high or low.
            <br />
            Double your stake if you win!
          </h3>
        </div>
        <div className={s.buttonsContainer}>
          <input
            className={s.input}
            type="number"
            placeholder="Enter bet amount"
            max={balance}
            onChange={(e) => setBetAmount(e.target.value)}
          />
          <button className={s.button} onClick={betLow} disabled={betDisabled}>
            Bet 1-50
          </button>
          <button className={s.button} onClick={betHigh} disabled={betDisabled}>
            Bet 51-100
          </button>
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
      {resultIn && (
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
      )}
      {wrongNetwork && (
        <div>
          <h1>Network error. Please connect to Rinkeby test network.</h1>
        </div>
      )}
    </div>
  );
}

export default App;
