import React from "react";

function Header({
  deposit,
  withdraw,
  withdrawalAllowed,
  balance,
  setDepositAmount,
  setWithdrawalAmount,
}) {
  return (
    <div>
      <div>
        <div>
          <p>Balance: {balance}</p>
        </div>
      </div>{" "}
      <div>
        <button onClick={deposit}>Deposit</button>
        <input
          type="number"
          placeholder="Enter deposit amount"
          max={1}
          onChange={(e) => setDepositAmount(e.target.value)}
        />
      </div>
      <div>
        <button disabled={!withdrawalAllowed} onClick={withdraw}>
          Withdraw
        </button>
        <input
          type="number"
          placeholder="Enter withdrawal amount"
          max={balance}
          onChange={(e) => setWithdrawalAmount(e.target.value)}
        />
      </div>
    </div>
  );
}

export default Header;
