import { useState, useEffect, useRef } from "react";
import "./App.css";
import Web3Modal from "web3modal";
import { BETTING_GAME_CONTRACT_ADDRESS, abi } from "./constants/index";
import Header from "./components/header/Header";
import { ethers } from "ethers";
import "./index.css";
import { odds, homeWin, awayWin, draw } from "./components/header/Odds";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [betAmount, setBetAmount] = useState("");
  const [randomNumber, setRandomNumber] = useState(20);
  const [walletConnected, setWalletConnected] = useState(false);
  const [resultIn, setResultIn] = useState(false);
  const web3ModalRef = useRef();
  const [account, setAccount] = useState(null);
  const [result, setResult] = useState(null);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const weiConv = 1000000000000000000;
  const [teamSelected, setTeamSelected] = useState("");
  const [homeTeamSelected, setHomeTeamSelected] = useState("");
  const [awayTeamSelected, setAwayTeamSelected] = useState("");
  const [displayResultOutcome, setDisplayResultOutcome] = useState("");
  const [yourSelection, setYourSelection] = useState("");
  const [myChainId, setMyChainId] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [betDisabled, setBetDisabled] = useState(true);

  useEffect(() => {
    let toastTimer;
    if (myChainId !== 11155111n && loggedIn) {
      toastTimer = setTimeout(() => {
        toast.error("Please connect to the Sepolia test network", {
          duration: 10000,
        });
      }, 1000);
    }
    return () => clearTimeout(toastTimer);
  }, [myChainId, loggedIn]);

  const handleLogout = async () => {
    if (web3ModalRef.current) {
      await web3ModalRef.current.clearCachedProvider();
    }

    setBalance(0);
    setAccount(null);
    setLoggedIn(false);
    setWalletConnected(false);
  };

  const getProviderOrSigner = async (needSigner = false) => {
    if (web3ModalRef.current) {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new ethers.BrowserProvider(provider);
      const { chainId } = await web3Provider.getNetwork();

      setMyChainId(chainId);

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
      setLoggedIn(true);
      getBalance(address);
      getRandomNumber();
    } catch (err) {}
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
    } catch (err) {}
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
      setResultIn(false);
      setLoading(true);
      await transaction.wait();
      await getBalance(account);
    } catch (err) {}
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
    } catch (err) {}
  };

  useEffect(() => {
    if (
      betAmount < 100 ||
      betAmount > 1000 ||
      betAmount > (balance / weiConv) * 10000
    ) {
      setBetDisabled(true);
    } else {
      setBetDisabled(false);
    }
  }, [betAmount, balance]);

  useEffect(() => {
    web3ModalRef.current = new Web3Modal({
      network: "sepolia",
      providerOptions: {},
      disableInjectedProvider: false,
    });
  }, []);

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

  const changeInput = (e) => {
    setResultIn(false);
    setBetAmount(e.target.value);
  };

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
        loggedIn={loggedIn}
        connectWallet={connectWallet}
        handleLogout={handleLogout}
        myChainId={myChainId}
      />
      <Toaster />
      <div className="flex w-9/12 justify-evenly mx-auto">
        <div className="flex w-4/12 flex-col mr-5 items-center bg-[#4A5568] p-5 rounded-lg h-[70%] text-center">
          <h4 className="mb-6">Stake an amount and select a result!</h4>
          <h4 className="mb-6">Minimum bet amount: 100</h4>
          <h4 className="mb-6">Maximum bet amount: 1000</h4>
          <input
            type="number"
            placeholder="Enter bet amount"
            className="flex text-center rounded-full text-black pl-4"
            max={balance}
            value={betAmount}
            onChange={(e) => changeInput(e)}
          />
          {loading && (
            // <div role="status" className="mt-12">
            //   <svg
            //     aria-hidden="true"
            //     class="inline w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-pink-600"
            //     viewBox="0 0 100 101"
            //     fill="none"
            //     xmlns="http://www.w3.org/2000/svg"
            //   >
            //     <path
            //       d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            //       fill="currentColor"
            //     />
            //     <path
            //       d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            //       fill="currentFill"
            //     />
            //   </svg>
            //   <span class="sr-only">Loading...</span>
            // </div>
            <img
              src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDRubG84am9rMXpqdmNrNHljNGp2NjFjYnJveG1kajRucTRkOGN5diZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1itbXhSnMBkYEztiMQ/giphy.gif"
              width={180}
              height={135}
              alt="Loading..."
              className=" mt-4 rounded-xl"
            />
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
              <h2 className="text-xl">
                {" "}
                {result
                  ? "Congratulations!"
                  : "Unlucky, better luck next time!"}
              </h2>
            </div>
          )}
        </div>
        <div className="flex w-8/12 flex-col ml-5 bg-[#4A5568] p-5 rounded-lg h-full overflow-auto">
          {odds.map((x, index) => (
            <div className="flex w-full" key={index}>
              <button
                className="border-2 border-white rounded-full text-sm font-bold py-2 px-5 my-2 mx-2 w-4/12 hover:bg-white hover:text-black hover:cursor-pointer disabled:opacity-40 disabled:hover:cursor-not-allowed disabled:hover:bg-[#4A5568] disabled:hover:text-white"
                onClick={() => homeClicked(x)}
                disabled={betDisabled}
              >
                <div>
                  {x.homeTeam} &nbsp;
                  {x.homeOddsFrac}
                </div>
              </button>
              <button
                className="border-2 border-white rounded-full text-sm font-bold py-2 px-5 my-2 mx-2 w-4/12 hover:bg-white hover:text-black hover:cursor-pointer disabled:opacity-40 disabled:hover:cursor-not-allowed disabled:hover:bg-[#4A5568] disabled:hover:text-white"
                onClick={() => drawClicked(x)}
                disabled={betDisabled}
              >
                <div>
                  {x.draw}&nbsp;
                  {x.drawOddsFrac}
                </div>
              </button>
              <button
                className="border-2 border-white rounded-full text-sm font-bold py-2 px-5 my-2 mx-2 w-4/12 hover:bg-white hover:text-black hover:cursor-pointer disabled:opacity-40 disabled:hover:cursor-not-allowed disabled:hover:bg-[#4A5568] disabled:hover:text-white"
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
    </div>
  );
}

export default App;
