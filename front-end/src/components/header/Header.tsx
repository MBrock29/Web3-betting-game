import React from "react";

function Header({ deposit, withdraw, withdrawalAllowed, balance }) {
  return (
    <div>
      <div>
        <div>
          <p>Balance: {balance}</p>
        </div>
      </div>{" "}
      <button onClick={deposit}>Deposit</button>
      <button disabled={!withdrawalAllowed} onClick={withdraw}>
        Withdraw
      </button>
      <p>Deposit costs 0.01 ETH for 100 chips</p>
    </div>
  );
}

export default Header;
