import React from "react";
import "../../index.css";
import { useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { TiTickOutline } from "react-icons/ti";

function Header({
  deposit,
  withdraw,
  withdrawalAllowed,
  balance,
  setDepositAmount,
  setWithdrawalAmount,
  loggedIn,
  connectWallet,
  handleLogout,
  myChainId,
}) {
  const [depositing, setDepositing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const depositFunction = () => {
    setDepositing(true);
    setWithdrawing(false);
  };

  const withdrawFunction = () => {
    setWithdrawing(true);
    setDepositing(false);
  };

  const submitDeposit = () => {
    setDepositing(false);
    deposit();
  };

  const submitWithdraw = () => {
    setWithdrawing(false);
    withdraw();
  };
  return (
    <div className="flex w-full my-5 text-xl font-bold min-h-[100px] text-center">
      <div className="w-1/5 ml-5 text-center">
        <div>
          <p>Balance: {Math.round(balance, 10)}</p>
        </div>
      </div>{" "}
      <h3 className="w-1/5">0.1 test ETH = 1000 credits</h3>
      {loggedIn && myChainId === 11155111n ? (
        <>
          <div className="flex flex-col w-1/5 items-center">
            {depositing ? (
              <>
                {" "}
                <button onClick={submitDeposit} className="pb-2">
                  Enter amount (in credits)
                </button>
                <div className="flex justify-center">
                  <button
                    className=" flex justify-center w-[40px] my-auto"
                    onClick={() => setDepositing(false)}
                  >
                    <MdOutlineCancel size="25px" />
                  </button>
                  <input
                    type="number"
                    placeholder="0"
                    max={1}
                    onChange={(e) => setDepositAmount(e.target.value / 10000)}
                    className="rounded-full text-center pl-2 border-2 border-[#323546] text-black w-[50%] text-md flex justify-center"
                  />{" "}
                  <button
                    className=" flex justify-center w-[40px] my-auto"
                    onClick={submitDeposit}
                  >
                    <TiTickOutline size="28px" />
                  </button>
                </div>
                <div className="flex justify-evenly w-6/12"></div>
              </>
            ) : (
              <button onClick={depositFunction}>Deposit</button>
            )}
          </div>
          <div className="flex flex-col w-1/5 items-center">
            {withdrawing ? (
              <>
                <button onClick={submitWithdraw} className="pb-2">
                  Enter amount (in credits)
                </button>
                <div className="flex justify-center">
                  <button
                    className=" flex justify-center w-[40px] my-auto"
                    onClick={() => setWithdrawing(false)}
                  >
                    <MdOutlineCancel size="25px" />
                  </button>

                  <input
                    type="number"
                    placeholder="0"
                    max={balance}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="rounded-full text-center pl-2 border-2 border-[#323546] text-black w-[50%] text-md flex justify-center"
                  />
                  <button
                    className=" flex justify-center w-[40px] my-auto"
                    onClick={submitWithdraw}
                  >
                    <TiTickOutline size="28px" />
                  </button>
                </div>
                <div className="flex justify-evenly w-6/12"></div>{" "}
              </>
            ) : (
              <button
                disabled={!withdrawalAllowed}
                className="disabled:opacity-20 disabled:hover:cursor-not-allowed"
                onClick={withdrawFunction}
              >
                Withdraw
              </button>
            )}
          </div>
          <div className="flex flex-col w-1/5 items-center">
            <button onClick={handleLogout}>Log out</button>
          </div>
        </>
      ) : (
        <div className="flex flex-col w-3/5 items-center">
          <button onClick={connectWallet}>Log in</button>
        </div>
      )}
    </div>
  );
}

export default Header;
