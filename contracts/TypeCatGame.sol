// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract TypeCatGame is EIP712 {
    address public immutable verifier;
    struct Session { address player; bytes32 passage; uint64 startedAt; bool complete; }
    mapping(address => bool) public registered;
    mapping(address => uint256) public lastCheckIn;
    mapping(bytes32 => Session) public sessions;
    mapping(address => uint32) public bestWpm;
    mapping(address => uint256) public completed;
    mapping(address => uint256) public lastStart;
    mapping(address => mapping(uint8 => bool)) public badges;
    bytes32 constant RESULT = keccak256("Result(bytes32 sessionId,address player,uint32 wpm,uint32 accuracy,uint32 duration,bytes32 logHash)");
    event PlayerRegistered(address indexed player);
    event DailyCheckIn(address indexed player, uint256 indexed day);
    event SessionStarted(bytes32 indexed sessionId, address indexed player, bytes32 passage);
    event SessionFinished(bytes32 indexed sessionId, address indexed player, uint256 indexed day, bytes32 passage, uint32 wpm, uint32 accuracy, uint32 duration, bytes32 logHash);
    event PersonalBest(address indexed player, uint32 wpm);
    event AchievementClaimed(address indexed player, uint8 badge);
    constructor(address signer) EIP712("TypeCat", "1") { require(signer != address(0)); verifier = signer; }
    function registerPlayer() external { require(!registered[msg.sender], "registered"); registered[msg.sender] = true; emit PlayerRegistered(msg.sender); }
    function dailyCheckIn() external { uint256 day = block.timestamp / 1 days; require(registered[msg.sender] && lastCheckIn[msg.sender] != day, "check-in unavailable"); lastCheckIn[msg.sender] = day; emit DailyCheckIn(msg.sender, day); }
    function startSession(bytes32 id, bytes32 passage) external { require(registered[msg.sender] && sessions[id].player == address(0), "invalid session"); require(block.timestamp >= lastStart[msg.sender] + 10, "start cooldown"); lastStart[msg.sender] = block.timestamp; sessions[id] = Session(msg.sender, passage, uint64(block.timestamp), false); emit SessionStarted(id, msg.sender, passage); }
    function finishSession(bytes32 id, uint32 wpm, uint32 accuracy, uint32 duration, bytes32 logHash, bytes calldata signature) external {
        Session storage s = sessions[id];
        require(s.player == msg.sender && !s.complete, "invalid session");
        require(duration >= 5000 && accuracy <= 100 && wpm <= 350, "invalid result");
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(RESULT, id, msg.sender, wpm, accuracy, duration, logHash)));
        require(ECDSA.recover(digest, signature) == verifier, "invalid proof");
        s.complete = true; completed[msg.sender]++;
        if (wpm > bestWpm[msg.sender]) { bestWpm[msg.sender] = wpm; emit PersonalBest(msg.sender, wpm); }
        if (accuracy == 100) badges[msg.sender][4] = true;
        emit SessionFinished(id, msg.sender, block.timestamp / 1 days, s.passage, wpm, accuracy, duration, logHash);
    }
    function claimAchievement(uint8 badge) external {
        require(!badges[msg.sender][badge], "already claimed");
        require((badge == 1 && completed[msg.sender] > 0) || (badge == 2 && bestWpm[msg.sender] >= 60) || (badge == 3 && badges[msg.sender][4]), "not earned");
        badges[msg.sender][badge] = true; emit AchievementClaimed(msg.sender, badge);
    }
}
