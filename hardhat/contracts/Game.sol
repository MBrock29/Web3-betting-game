// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract Game {
    uint256 balance;
    uint256 betAmount;
    uint256 randomNumber;
    uint256 winnings;
    uint256 rand;
    uint256 public payoutAmount;
    uint256 depositAmount;
    bool win;
    uint256 drawOdds;
    uint256 drawPerc;
    uint256 awayOdds;
    uint256 awayPerc;

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

    address public owner;

    constructor() payable {
        balance = 0;
        owner = msg.sender;
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        players[msg.sender].balance += msg.value;
        emit Deposit(
            msg.sender,
            msg.value,
            address(this).balance
        );
    }

      event Withdraw(
        address indexed userAddress,
        uint256 weiAmount, 
        uint256 contractBalance
    );

    function withdraw(uint256 balanceAmount) public payable {
        require(balanceAmount <= players[msg.sender].balance, "Insufficient balance");
        payable(msg.sender).transfer(balanceAmount);
        players[msg.sender].balance -= balanceAmount;
        emit Withdraw(
            msg.sender,
            balanceAmount,
            address(this).balance
        );
    }

    function getIndividualPlayer(address addr) public view returns (Player memory) {
        return players[addr];
    }

    function betHomeTeam(uint256 amount, uint256 odds, uint256 perc) public { 
        rand = uint256(keccak256(abi.encodePacked(block.timestamp)));
        randomNumber = (rand % 100) + 1;
        if (randomNumber <= perc) {
            winnings = amount * (odds - 1);
            players[msg.sender].balance = players[msg.sender].balance + winnings;
            win = true;
        } else {
            players[msg.sender].balance = players[msg.sender].balance - amount;
            win = false;
        }
    }

    function betDraw(uint256 amount, uint256 odds, uint256 perc) public { 
        rand = uint256(keccak256(abi.encodePacked(block.timestamp)));
        randomNumber = (rand % 100) + 1;
        if (randomNumber <= perc) {
            winnings = amount * (odds - 1);
            players[msg.sender].balance = players[msg.sender].balance + winnings;
            win = true;
        } else {
            players[msg.sender].balance = players[msg.sender].balance - amount;
            win = false;
        }
    }

    function betAwayTeam(uint256 amount, uint256 odds, uint256 perc) public { 
        rand = uint256(keccak256(abi.encodePacked(block.timestamp)));
        randomNumber = (rand % 100) + 1;
        if (randomNumber <= perc) {
            winnings = amount * (odds - 1);
            players[msg.sender].balance = players[msg.sender].balance + winnings;
            win = true;
        } else {
            players[msg.sender].balance = players[msg.sender].balance - amount;
            win = false;
        }
    }

    function getBalance(address userAddress) public view returns (uint256) {
        return players[userAddress].balance;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getRandomNumber() public view returns (uint256) {
        return randomNumber;
    }

    function getResult() public view returns (bool) {
        return win;
    }
}
