// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract BettingGame {
    uint256 balance;
    uint256 betAmount;
    uint256 randomNumber;
    uint256 winnings;
    uint256 rand;
    uint256 public payoutAmount;
    uint256 depositAmount;
    bool win;

    struct Player {
        address walletAddress;
        uint256 balance;
        bool hasDeposited;
    }

    mapping(address => Player) public players;

    event Deposit(
        address indexed userAddress,
        uint256 weiAmount,
        uint256 contractBalance
    );
    
    event Withdraw(
        address indexed userAddress,
        uint256 weiAmount, 
        uint256 contractBalance
    );

    address public owner;

    constructor() payable {
        balance = 0;
        owner = msg.sender;
    }

    function deposit() public payable {
        players[msg.sender].balance = players[msg.sender].balance + depositAmount;
        emit Deposit(
            msg.sender,
            msg.value,
            address(this).balance
        );
    }

    function withdraw(uint256 balanceAmount) public payable {
        payable(msg.sender).transfer(balanceAmount);
        players[msg.sender].balance = 0;
        emit Withdraw(
            msg.sender,
            balanceAmount,
            address(this).balance
        );
    }
    
}
