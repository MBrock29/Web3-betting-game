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
          onChange={(e) => setDepositAmount(e.target.value / 10000)}
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
      <h3>0.1 test ETH = 1000 credits</h3>
    </div>
  );
}

export default Header;
