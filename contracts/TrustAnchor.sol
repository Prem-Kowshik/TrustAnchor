// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TrustAnchor {

    address public creator;
    uint public goal;
    uint public deadline;
    uint public totalRaised;
    uint public currentMilestone;

    struct Milestone {
        string description;
        uint amount;
        bool votingActive;
        bool completed;
        uint yesVotes;
        uint noVotes;
    }

    Milestone[] public milestones;

    mapping(address => uint) public contributions;
    mapping(address => mapping(uint => bool)) public voted;

    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator allowed");
        _;
    }

    modifier onlyBacker() {
        require(contributions[msg.sender] > 0, "Only backers allowed");
        _;
    }

    constructor(uint _goal, uint _duration) {
        creator = msg.sender;
        goal = _goal;
        deadline = block.timestamp + _duration;
    }

    // Creator defines milestones before campaign starts
    function addMilestone(string memory desc, uint amount) public onlyCreator {
        milestones.push(Milestone({
            description: desc,
            amount: amount,
            votingActive: false,
            completed: false,
            yesVotes: 0,
            noVotes: 0
        }));
    }

    // Backers contribute ETH
    function contribute() public payable {
        require(block.timestamp < deadline, "Funding period over");

        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
    }

    // Start voting for current milestone
    function startVoting() public onlyCreator {
        require(currentMilestone < milestones.length, "No milestone left");

        milestones[currentMilestone].votingActive = true;
    }

    // Weighted vote based on contribution
    function vote(bool approve) public onlyBacker {

        Milestone storage m = milestones[currentMilestone];

        require(m.votingActive, "Voting inactive");
        require(!voted[msg.sender][currentMilestone], "Already voted");

        uint weight = contributions[msg.sender];

        if (approve) {
            m.yesVotes += weight;
        } else {
            m.noVotes += weight;
        }

        voted[msg.sender][currentMilestone] = true;
    }

    // Release funds if milestone approved
    function releaseFunds() public onlyCreator {

        Milestone storage m = milestones[currentMilestone];

        require(m.votingActive, "Voting not started");
        require(!m.completed, "Already completed");
        require(m.yesVotes > m.noVotes, "Milestone rejected");

        m.completed = true;
        m.votingActive = false;

        currentMilestone++;

        payable(creator).transfer(m.amount);
    }

    // Backers withdraw if funding fails or deadline passes
    function refund() public onlyBacker {

        require(block.timestamp > deadline, "Funding still active");

        uint amount = contributions[msg.sender];
        contributions[msg.sender] = 0;

        payable(msg.sender).transfer(amount);
    }

    // Utility functions
    function getMilestoneCount() public view returns(uint) {
        return milestones.length;
    }

    function getContractBalance() public view returns(uint) {
        return address(this).balance;
    }
}
