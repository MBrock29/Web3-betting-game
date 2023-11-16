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
  const [contractBalance, setContractBalance] = useState(0);
  const [fractions, setFractions] = useState(true);

  const getContractBalance = async () => {
    const provider = await getProviderOrSigner();
    const contract = new ethers.Contract(
      BETTING_GAME_CONTRACT_ADDRESS,
      abi,
      provider
    );
    const balance = await provider.getBalance(contract.target);
    setContractBalance(ethers.formatEther(balance));
  };

  useEffect(() => {
    setTimeout(() => {
      getContractBalance();
    }, 3000);
  }, [balance, loading]);

  useEffect(() => {
    let toastTimer;
    if (myChainId !== 11155111n && loggedIn) {
      toastTimer = setTimeout(() => {
        toast.error("Please connect to the Sepolia test network.", {
          duration: 10000,
          style: {
            marginTop: "50px",
          },
        });
      }, 1000);
    }
    return () => clearTimeout(toastTimer);
  }, [myChainId, loggedIn]);

  const handleLogout = async () => {
    if (web3ModalRef.current) {
      await web3ModalRef.current.clearCachedProvider();
    }
    localStorage.removeItem("walletConnected");
    setBalance(0);
    setAccount(null);
    setLoggedIn(false);
  };

  const handleChange = (event) => {
    setFractions(event.target.value === "Fractions");
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

  useEffect(() => {
    if (localStorage.getItem("walletConnected") === "true") {
      connectWallet().catch(console.error);
    }
  }, []);

  const connectWallet = async () => {
    try {
      setBalance(0);
      const provider = await getProviderOrSigner(true);
      const address = await provider.getAddress();
      localStorage.setItem("walletConnected", "true");
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
      toast.error("Unable to fetch balance, please try again.", {
        duration: 10000,
        style: {
          marginTop: "50px",
        },
      });
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
      setBetAmount("");
      const outcome = await bettingGameContract.getResult();
      setResult(outcome);
    } catch (err) {
      toast.error("Unable to simulate result.  Please try again.", {
        duration: 10000,
        style: {
          marginTop: "50px",
        },
      });
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
      toast.loading("Transaction submitted, please wait.", {
        duration: 10000,
        style: {
          marginTop: "50px",
        },
      });
      await transaction.wait();
      await getRandomNumber();
      await setResultIn(true);
      await getBalance(account);
    } catch (err) {
      setLoading(false);
      toast.error(
        "Transaction failed, no money was taken.  Please try again.",
        {
          duration: 10000,
          style: {
            marginTop: "50px",
          },
        }
      );
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
      toast.loading("Transaction submitted, please wait", {
        duration: 10000,
        style: {
          marginTop: "50px",
        },
      });
      await transaction.wait();
      await getRandomNumber();
      await setResultIn(true);
      await getBalance(account);
    } catch (err) {
      setLoading(false);
      toast.error(
        "Transaction failed, no money was taken.  Please try again.",
        {
          duration: 10000,
          style: {
            marginTop: "50px",
          },
        }
      );
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
      toast.loading("Transaction submitted, please wait.", {
        duration: 10000,
        style: {
          marginTop: "50px",
        },
      });
      await transaction.wait();
      await getRandomNumber();
      await setResultIn(true);
      await getBalance(account);
    } catch (err) {
      setLoading(false);
      toast.error(
        "Transaction failed, no money was taken.  Please try again.",
        {
          duration: 10000,
          style: {
            marginTop: "50px",
          },
        }
      );
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
    } catch (err) {
      toast.error("Deposit failed, please try again.", {
        duration: 10000,
        style: {
          marginTop: "50px",
        },
      });
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
      if (withdrawalAmount > contractBalance * 10000) {
        toast.error(
          `Max withdrawal at present is ${Math.floor(
            contractBalance * 10000,
            0
          )}.  Please try again.`,
          {
            duration: 10000,
            style: {
              marginTop: "50px",
            },
          }
        );
      } else {
        const transaction = await bettingGameContract.withdraw(withdrawAmount);
        setLoading(true);
        await transaction.wait();
        await getBalance(account);
      }
    } catch (err) {
      toast.error("Something went wrong, please try again.", {
        duration: 10000,
        style: {
          marginTop: "50px",
        },
      });
    }
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
        depositAmount={depositAmount}
        setWithdrawalAmount={setWithdrawalAmount}
        loggedIn={loggedIn}
        connectWallet={connectWallet}
        handleLogout={handleLogout}
        myChainId={myChainId}
        withdrawalAmount={withdrawalAmount}
        fractions={fractions}
        handleChange={handleChange}
      />

      <Toaster />
      <div className="flex w-11/12 justify-evenly mx-auto">
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
            <img
              src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDRubG84am9rMXpqdmNrNHljNGp2NjFjYnJveG1kajRucTRkOGN5diZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1itbXhSnMBkYEztiMQ/giphy.gif"
              width={190}
              height={142}
              alt="Loading..."
              className=" mt-4 rounded-xl"
            />
          )}
          {resultIn && (
            <div className="mt-6 text-2xl text-center">
              <h2 className="mb-4 font-bold">
                Your selection is {yourSelection}
              </h2>
              <h2 className="mb-4 text-xl">
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
                  {fractions ? x.homeOddsFrac : x.homeOddsDec}
                </div>
              </button>
              <button
                className="border-2 border-white rounded-full text-sm font-bold py-2 px-5 my-2 mx-2 w-4/12 hover:bg-white hover:text-black hover:cursor-pointer disabled:opacity-40 disabled:hover:cursor-not-allowed disabled:hover:bg-[#4A5568] disabled:hover:text-white"
                onClick={() => drawClicked(x)}
                disabled={betDisabled}
              >
                <div>
                  {x.draw} &nbsp;
                  {fractions ? x.drawOddsFrac : x.drawOddsDec}
                </div>
              </button>
              <button
                className="border-2 border-white rounded-full text-sm font-bold py-2 px-5 my-2 mx-2 w-4/12 hover:bg-white hover:text-black hover:cursor-pointer disabled:opacity-40 disabled:hover:cursor-not-allowed disabled:hover:bg-[#4A5568] disabled:hover:text-white"
                onClick={() => awayClicked(x)}
                disabled={betDisabled}
              >
                <div>
                  {x.awayTeam} &nbsp;
                  {fractions ? x.awayOddsFrac : x.awayOddsDec}
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
