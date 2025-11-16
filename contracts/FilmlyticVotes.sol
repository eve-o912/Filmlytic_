// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title FilmlyticVotes
 * @dev Enhanced voting system for film rankings with session management
 * @notice This contract allows secure, time-bound voting sessions for films
 */
contract FilmlyticVotes {
    
    // ============ Structs ============
    
    struct Vote {
        address voterAddress;
        uint256 filmId;
        uint32 timestamp;
    }

    struct VotingSession {
        uint256 sessionId;
        bool isActive;
        uint32 startTime;
        uint32 endTime;
        uint256 totalVotes;
        uint8 minFilmId;
        uint8 maxFilmId;
        string sessionName;
    }

    struct VoterRegistration {
        address voterAddress;
        string serialNumber;
        bool isRegistered;
        uint32 registrationTime;
    }

    // ============ State Variables ============
    
    address public owner;
    bool public paused;
    uint256 public sessionCounter;
    
    // Session ID => array of votes
    mapping(uint256 => Vote[]) public sessionVotes;
    
    // Session ID => VotingSession details
    mapping(uint256 => VotingSession) public votingSessions;
    
    // Session ID => Voter Address => has voted
    mapping(uint256 => mapping(address => bool)) public hasVotedInSession;
    
    // Session ID => Film ID => vote count
    mapping(uint256 => mapping(uint256 => uint256)) public filmVoteCounts;
    
    // Serial Number => VoterRegistration
    mapping(string => VoterRegistration) public voterRegistry;
    
    // Address => Serial Number (reverse lookup)
    mapping(address => string) public addressToSerial;

    // ============ Events ============
    
    event VoteRecorded(
        uint256 indexed sessionId,
        address indexed voterAddress,
        uint256 filmId,
        uint32 timestamp
    );

    event SessionCreated(
        uint256 indexed sessionId,
        string sessionName,
        uint32 startTime,
        uint32 endTime,
        uint8 minFilmId,
        uint8 maxFilmId
    );

    event SessionEnded(
        uint256 indexed sessionId,
        uint256 totalVotes,
        uint32 endTime
    );

    event VoterRegistered(
        address indexed voterAddress,
        string serialNumber,
        uint32 timestamp
    );

    event PauseToggled(bool isPaused);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier validSession(uint256 sessionId) {
        require(votingSessions[sessionId].sessionId != 0, "Session does not exist");
        _;
    }

    modifier registeredVoter() {
        require(
            voterRegistry[addressToSerial[msg.sender]].isRegistered,
            "Voter not registered"
        );
        _;
    }

    // ============ Constructor ============
    
    constructor() {
        owner = msg.sender;
        paused = false;
        sessionCounter = 0;
    }

    // ============ Voter Registration ============
    
    /**
     * @notice Register a voter with a unique serial number
     * @param voterAddress The address of the voter
     * @param serialNumber Unique identifier for the voter
     */
    function registerVoter(address voterAddress, string memory serialNumber) 
        public 
        onlyOwner 
    {
        require(voterAddress != address(0), "Invalid address");
        require(bytes(serialNumber).length > 0, "Serial number required");
        require(!voterRegistry[serialNumber].isRegistered, "Serial already registered");
        require(bytes(addressToSerial[voterAddress]).length == 0, "Address already registered");

        voterRegistry[serialNumber] = VoterRegistration({
            voterAddress: voterAddress,
            serialNumber: serialNumber,
            isRegistered: true,
            registrationTime: uint32(block.timestamp)
        });

        addressToSerial[voterAddress] = serialNumber;

        emit VoterRegistered(voterAddress, serialNumber, uint32(block.timestamp));
    }

    /**
     * @notice Batch register multiple voters
     * @param voterAddresses Array of voter addresses
     * @param serialNumbers Array of corresponding serial numbers
     */
    function batchRegisterVoters(
        address[] memory voterAddresses,
        string[] memory serialNumbers
    ) 
        public 
        onlyOwner 
    {
        require(voterAddresses.length == serialNumbers.length, "Array length mismatch");
        
        for (uint256 i = 0; i < voterAddresses.length; i++) {
            if (voterAddresses[i] != address(0) && 
                bytes(serialNumbers[i]).length > 0 &&
                !voterRegistry[serialNumbers[i]].isRegistered) {
                registerVoter(voterAddresses[i], serialNumbers[i]);
            }
        }
    }

    // ============ Session Management ============
    
    /**
     * @notice Create a new voting session
     * @param sessionName Descriptive name for the session
     * @param durationMinutes How long the session will last
     * @param minFilmId Minimum film ID (typically 1)
     * @param maxFilmId Maximum film ID (e.g., 10 for 10 films)
     */
    function createSession(
        string memory sessionName,
        uint256 durationMinutes,
        uint8 minFilmId,
        uint8 maxFilmId
    ) 
        public 
        onlyOwner 
        returns (uint256)
    {
        require(durationMinutes > 0, "Duration must be positive");
        require(maxFilmId > minFilmId, "Invalid film ID range");
        require(bytes(sessionName).length > 0, "Session name required");

        sessionCounter++;
        uint256 newSessionId = sessionCounter;
        uint32 startTime = uint32(block.timestamp);
        uint32 endTime = startTime + uint32(durationMinutes * 60);

        votingSessions[newSessionId] = VotingSession({
            sessionId: newSessionId,
            isActive: true,
            startTime: startTime,
            endTime: endTime,
            totalVotes: 0,
            minFilmId: minFilmId,
            maxFilmId: maxFilmId,
            sessionName: sessionName
        });

        emit SessionCreated(newSessionId, sessionName, startTime, endTime, minFilmId, maxFilmId);
        
        return newSessionId;
    }

    /**
     * @notice End a voting session manually
     * @param sessionId The ID of the session to end
     */
    function endSession(uint256 sessionId) 
        public 
        onlyOwner 
        validSession(sessionId) 
    {
        VotingSession storage session = votingSessions[sessionId];
        require(session.isActive, "Session already ended");

        session.isActive = false;
        
        emit SessionEnded(sessionId, session.totalVotes, uint32(block.timestamp));
    }

    /**
     * @notice Extend a voting session duration
     * @param sessionId The ID of the session to extend
     * @param additionalMinutes Minutes to add to the session
     */
    function extendSession(uint256 sessionId, uint256 additionalMinutes) 
        public 
        onlyOwner 
        validSession(sessionId) 
    {
        VotingSession storage session = votingSessions[sessionId];
        require(session.isActive, "Session is not active");
        require(additionalMinutes > 0, "Must add positive time");

        session.endTime += uint32(additionalMinutes * 60);
    }

    // ============ Voting Functions ============
    
    /**
     * @notice Record a vote for a film in a session
     * @param sessionId The ID of the voting session
     * @param filmId The ID of the film being voted for
     */
    function recordVote(uint256 sessionId, uint256 filmId) 
        public 
        whenNotPaused
        registeredVoter
        validSession(sessionId)
    {
        VotingSession storage session = votingSessions[sessionId];
        
        require(session.isActive, "Session is not active");
        require(block.timestamp >= session.startTime, "Session not started");
        require(block.timestamp <= session.endTime, "Session has ended");
        require(!hasVotedInSession[sessionId][msg.sender], "Already voted in this session");
        require(filmId >= session.minFilmId && filmId <= session.maxFilmId, "Invalid film ID");

        // Record the vote
        Vote memory newVote = Vote({
            voterAddress: msg.sender,
            filmId: filmId,
            timestamp: uint32(block.timestamp)
        });

        sessionVotes[sessionId].push(newVote);
        filmVoteCounts[sessionId][filmId]++;
        hasVotedInSession[sessionId][msg.sender] = true;
        session.totalVotes++;

        emit VoteRecorded(sessionId, msg.sender, filmId, uint32(block.timestamp));
    }

    // ============ View Functions ============
    
    /**
     * @notice Get all votes for a specific session
     * @param sessionId The ID of the session
     * @return Array of all votes in the session
     */
    function getSessionVotes(uint256 sessionId) 
        public 
        view 
        validSession(sessionId)
        returns (Vote[] memory) 
    {
        return sessionVotes[sessionId];
    }

    /**
     * @notice Get vote count for a specific film in a session
     * @param sessionId The ID of the session
     * @param filmId The ID of the film
     * @return Number of votes the film received
     */
    function getFilmVoteCount(uint256 sessionId, uint256 filmId) 
        public 
        view 
        validSession(sessionId)
        returns (uint256) 
    {
        return filmVoteCounts[sessionId][filmId];
    }

    /**
     * @notice Get all results for a session
     * @param sessionId The ID of the session
     * @return filmIds Array of film IDs
     * @return voteCounts Array of corresponding vote counts
     */
    function getSessionResults(uint256 sessionId) 
        public 
        view 
        validSession(sessionId)
        returns (uint256[] memory filmIds, uint256[] memory voteCounts) 
    {
        VotingSession memory session = votingSessions[sessionId];
        uint256 range = session.maxFilmId - session.minFilmId + 1;
        
        filmIds = new uint256[](range);
        voteCounts = new uint256[](range);

        for (uint256 i = 0; i < range; i++) {
            uint256 filmId = session.minFilmId + i;
            filmIds[i] = filmId;
            voteCounts[i] = filmVoteCounts[sessionId][filmId];
        }

        return (filmIds, voteCounts);
    }

    /**
     * @notice Check if a session is currently active and accepting votes
     * @param sessionId The ID of the session
     * @return bool True if session is active and within time bounds
     */
    function isSessionActive(uint256 sessionId) 
        public 
        view 
        validSession(sessionId)
        returns (bool) 
    {
        VotingSession memory session = votingSessions[sessionId];
        return session.isActive && 
               block.timestamp >= session.startTime && 
               block.timestamp <= session.endTime;
    }

    /**
     * @notice Check if an address has voted in a specific session
     * @param sessionId The ID of the session
     * @param voter The address to check
     * @return bool True if the voter has voted
     */
    function hasVoted(uint256 sessionId, address voter) 
        public 
        view 
        validSession(sessionId)
        returns (bool) 
    {
        return hasVotedInSession[sessionId][voter];
    }

    /**
     * @notice Get voter information by serial number
     * @param serialNumber The serial number to look up
     * @return VoterRegistration struct with voter details
     */
    function getVoterBySerial(string memory serialNumber) 
        public 
        view 
        returns (VoterRegistration memory) 
    {
        return voterRegistry[serialNumber];
    }

    /**
     * @notice Get complete session information
     * @param sessionId The ID of the session
     * @return VotingSession struct with all session details
     */
    function getSessionInfo(uint256 sessionId) 
        public 
        view 
        validSession(sessionId)
        returns (VotingSession memory) 
    {
        return votingSessions[sessionId];
    }

    // ============ Admin Functions ============
    
    /**
     * @notice Pause or unpause the contract
     * @param _paused True to pause, false to unpause
     */
    function setPaused(bool _paused) public onlyOwner {
        paused = _paused;
        emit PauseToggled(_paused);
    }

    /**
     * @notice Transfer ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    /**
     * @notice Deregister a voter (emergency use only)
     * @param serialNumber The serial number of the voter to deregister
     */
    function deregisterVoter(string memory serialNumber) public onlyOwner {
        VoterRegistration storage voter = voterRegistry[serialNumber];
        require(voter.isRegistered, "Voter not registered");
        
        address voterAddress = voter.voterAddress;
        delete addressToSerial[voterAddress];
        delete voterRegistry[serialNumber];
    }
}
