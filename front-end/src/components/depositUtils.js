// depositUtils.js

import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import {
  BETTING_GAME_CONTRACT_ADDRESS,
  abi,
} from "../constants/index";

const DepositForm = async (amount, account, getBalance) => {
  try {
    const provider = await getProviderOrSigner(true);
    const bettingGameContract = new ethers.Contract(
      BETTING_GAME_CONTRACT_ADDRESS,
      abi,
      provider
    );
    const transaction = await bettingGameContract.deposit({
      value: ethers.parseUnits(amount.toString(), "ether"),
    });
    await transaction.wait();
    await getBalance(account);
    toast.success(`Deposit of ${amount}ETH successful, good luck!`, {
      duration: 6000,
      style: {
        marginTop: "50px",
      },
    });
  } catch (err) {
    toast.error("Deposit failed, please try again.", {
      duration: 6000,
      style: {
        marginTop: "50px",
      },
    });
  }
};

export default DepositForm;
