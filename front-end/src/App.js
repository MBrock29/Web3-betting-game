import { useState, useEffect, useRef } from "react";
import "./App.css";
import Web3Modal from "web3modal";
import { BETTING_GAME_CONTRACT_ADDRESS, abi } from "./constants/index";
import Header from "./components/header/Header";
import { ethers } from "ethers";
import "./index.css";
import { odds, homeWin, awayWin, draw } from "./components/header/Odds";
import toast, { Toaster } from "react-hot-toast";
import DepositForm from "./components/depositUtils";

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
  const [waiting, setWaiting] = useState(false);

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

  const handleDeposit = async (amount) => {
    await DepositForm(amount, account, getBalance);
  };

  const savedFractions = localStorage.getItem("fractions");
  const initialFractions =
    savedFractions !== null ? savedFractions === "true" : true;
  const [fractions, setFractions] = useState(initialFractions);

  useEffect(() => {
    setTimeout(() => {
      getContractBalance();
    }, 3000);
  }, [balance, loading]);

  useEffect(() => {
    localStorage.setItem("fractions", fractions);
  }, [fractions]);

  useEffect(() => {
    const savedFractions = localStorage.getItem("fractions");
    if (savedFractions !== null) {
      setFractions(savedFractions === "true");
    }
  }, []);

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
      setWaiting(false);
      setBetAmount(0);
    } catch (err) {
      setWaiting(false);
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
      toast.success("Transaction successful", {
        duration: 3000,
        style: {
          marginTop: "50px",
        },
      });
    } catch (err) {
      setLoading(false);
      toast.error(
        "Transaction failed, no money was taken.  Please try again.",
        {
          duration: 6000,
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
      toast.success("Transaction successful", {
        duration: 3000,
        style: {
          marginTop: "50px",
        },
      });
    } catch (err) {
      setLoading(false);
      toast.error(
        "Transaction failed, no money was taken.  Please try again.",
        {
          duration: 6000,
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
      toast.success("Transaction successful", {
        duration: 3000,
        style: {
          marginTop: "50px",
        },
      });
    } catch (err) {
      setLoading(false);
      toast.error(
        "Transaction failed, no money was taken.  Please try again.",
        {
          duration: 6000,
          style: {
            marginTop: "50px",
          },
        }
      );
    }
  };

  // const deposit = async () => {
  //   try {
  //     const provider = await getProviderOrSigner(true);
  //     const bettingGameContract = new ethers.Contract(
  //       BETTING_GAME_CONTRACT_ADDRESS,
  //       abi,
  //       provider
  //     );
  //     const transaction = await bettingGameContract.deposit({
  //       value: ethers.parseUnits(depositAmount.toString(), "ether"),
  //     });
  //     toast.loading("Deposit submitted, please wait.", {
  //       duration: 3000,
  //       style: {
  //         marginTop: "50px",
  //       },
  //     });
  //     setResultIn(false);
  //     setWaiting(true);
  //     await transaction.wait();
  //     await getBalance(account);
  //     toast.success(`Deposit of ${depositAmount}ETH successful, good luck!`, {
  //       duration: 6000,
  //       style: {
  //         marginTop: "50px",
  //       },
  //     });
  //   } catch (err) {
  //     toast.error("Deposit failed, please try again.", {
  //       duration: 10000,
  //       style: {
  //         marginTop: "50px",
  //       },
  //     });
  //   }
  // };

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
            duration: 6000,
            style: {
              marginTop: "50px",
            },
          }
        );
      } else {
        const transaction = await bettingGameContract.withdraw(withdrawAmount);
        toast.loading("Withdrawal submitted, please wait.", {
          duration: 3000,
          style: {
            marginTop: "50px",
          },
        });
        setResultIn(false);
        setWaiting(true);
        await transaction.wait();
        await getBalance(account);
        toast.success(
          `Withdrawal of ${
            withdrawalAmount / 10000
          }ETH successful, thanks for playing!`,
          {
            duration: 6000,
            style: {
              marginTop: "50px",
            },
          }
        );
      }
    } catch (err) {
      toast.error("Something went wrong, please try again.", {
        duration: 5000,
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
      betAmount > (balance / weiConv) * 10000 ||
      loading ||
      waiting
    ) {
      setBetDisabled(true);
    } else {
      setBetDisabled(false);
    }
  }, [betAmount, balance, loading, waiting]);

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
    setWaiting(false);
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
    <div className="bg-[#1A202C] text-white min-h-screen h-full w-full flex flex-col">
      <Header
        deposit={handleDeposit}
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

    </div>
  );
}

export default App;
