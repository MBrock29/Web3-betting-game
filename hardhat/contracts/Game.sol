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
        players[msg.sender].balance = players[msg.sender].balance + depositAmount;
        emit Deposit(
            msg.sender,
            msg.value,
            address(this).balance
        );
    }

      // event Withdraw(
    //     address indexed userAddress,
    //     uint256 weiAmount, 
    //     uint256 contractBalance
    // );

    // function withdraw(uint256 balanceAmount) public payable {
    //     payable(msg.sender).transfer(balanceAmount);
    //     players[msg.sender].balance = 0;
    //     emit Withdraw(
    //         msg.sender,
    //         balanceAmount,
    //         address(this).balance
    //     );
    // }

    // function getIndividualPlayer(address addr) public view returns (Player memory) {
    //     return players[addr];
    // }

    // function betHomeTeam(uint256 amount) public { 
    //     betAmount = amount;
    //     rand = uint256(keccak256(abi.encodePacked(block.timestamp)));
    //     randomNumber = (rand % 100) + 1;
    //     if (randomNumber < 34) {
    //         winnings = betAmount;
    //         players[msg.sender].balance = players[msg.sender].balance + winnings;
    //         win = true;
    //     } else {
    //         players[msg.sender].balance = players[msg.sender].balance - betAmount;
    //         win = false;
    //     }
    // }

    // function betDraw(uint256 amount) public { 
    //     betAmount = amount;
    //     rand = uint256(keccak256(abi.encodePacked(block.timestamp)));
    //     randomNumber = (rand % 100) + 1;
    //     if (randomNumber < 67 && randomNumber > 33) {
    //         winnings = betAmount;
    //         players[msg.sender].balance = players[msg.sender].balance + winnings;
    //         win = true;
    //     } else {
    //         players[msg.sender].balance = players[msg.sender].balance - betAmount;
    //         win = false;
    //     }
    // }

    // function betAwayTeam(uint256 amount) public { 
    //     betAmount = amount;
    //     rand = uint256(keccak256(abi.encodePacked(block.timestamp)));
    //     randomNumber = (rand % 100) + 1;
    //     if (randomNumber > 67) {
    //         winnings = betAmount;
    //         players[msg.sender].balance = players[msg.sender].balance + winnings;
    //         win = true;
    //     } else {
    //         players[msg.sender].balance = players[msg.sender].balance - betAmount;
    //         win = false;
    //     }
    // }

    // function getBalance(address userAddress) public view returns (uint256) {
    //     return players[userAddress].balance;
    // }

    // function getRandomNumber() public view returns (uint256) {
    //     return randomNumber;
    // }

    // function getResult() public view returns (bool) {
    //     return win;
    // }
}
