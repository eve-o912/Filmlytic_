// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FilmlyticVotes {
    struct Vote {
        string voterSerialNumber;
        uint256 filmId;
        uint256 timestamp;
        address voterAddress;
    }

    struct VotingSession {
        uint256 sessionId;
        bool isActive;
        uint256 startTime;
        uint256 endTime;
        uint256 totalVotes;
    }

    mapping(uint256 => Vote[]) public sessionVotes;
    mapping(uint256 => VotingSession) public votingSessions;
    mapping(string => bool) public voterHasVoted;
    mapping(uint256 => mapping(uint256 => uint256)) public filmVoteCounts;

    address public owner;

    event VoteRecorded(
        uint256 indexed sessionId,
        string voterSerial,
        uint256 filmId,
        uint256 timestamp,
        address voterAddress
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createSession(uint256 sessionId, uint256 durationMinutes) public onlyOwner {
        uint256 endTime = block.timestamp + (durationMinutes * 60);
        votingSessions[sessionId] = VotingSession(sessionId, true, block.timestamp, endTime, 0);
    }

    function recordVote(uint256 sessionId, string memory voterSerial, uint256 filmId) public {
        require(votingSessions[sessionId].isActive, "Session inactive");
        require(block.timestamp <= votingSessions[sessionId].endTime, "Session ended");
        require(!voterHasVoted[voterSerial], "Already voted");
        require(filmId >= 1 && filmId <= 10, "Invalid film ID");

        Vote memory newVote = Vote(voterSerial, filmId, block.timestamp, msg.sender);
        sessionVotes[sessionId].push(newVote);
        filmVoteCounts[sessionId][filmId]++;
        voterHasVoted[voterSerial] = true;
        votingSessions[sessionId].totalVotes++;

        emit VoteRecorded(sessionId, voterSerial, filmId, block.timestamp, msg.sender);
    }

    function endSession(uint256 sessionId) public onlyOwner {
        votingSessions[sessionId].isActive = false;
    }

    function getSessionVotes(uint256 sessionId) public view returns (Vote[] memory) {
        return sessionVotes[sessionId];
    }

    function getFilmVoteCount(uint256 sessionId, uint256 filmId) public view returns (uint256) {
        return filmVoteCounts[sessionId][filmId];
    }
}
