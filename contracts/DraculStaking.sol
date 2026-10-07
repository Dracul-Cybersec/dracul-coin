// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

contract DraculStaking is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 private constant RATE_SCALE = 1e18;

    IERC20 public immutable token;

    uint256 public totalStaked;
    uint256 public rewardRateX18;
    uint256 public periodFinish;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public rewardLiability;

    mapping(address => uint256) public balanceOf;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardProgramStarted(
        uint256 reward,
        uint256 duration,
        uint256 rewardRateX18,
        uint256 periodFinish
    );

    constructor(IERC20 token_, address initialOwner) Ownable(initialOwner) {
        require(address(token_) != address(0), "Staking: zero token");
        token = token_;
    }

    modifier updateReward(address account) {
        _updateGlobalReward();

        if (account != address(0)) {
            rewards[account] = _earnedStored(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function rewardRate() public view returns (uint256) {
        return rewardRateX18 / RATE_SCALE;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) return rewardPerTokenStored;

        uint256 applicable = lastTimeRewardApplicable();
        if (applicable <= lastUpdateTime) return rewardPerTokenStored;

        uint256 elapsed = applicable - lastUpdateTime;

        return rewardPerTokenStored
            + Math.mulDiv(elapsed, rewardRateX18, totalStaked);
    }

    function earned(address account) public view returns (uint256) {
        return Math.mulDiv(
            balanceOf[account],
            rewardPerToken() - userRewardPerTokenPaid[account],
            RATE_SCALE
        ) + rewards[account];
    }

    function pendingRewardAccrual() public view returns (uint256) {
        if (totalStaked == 0 || rewardRateX18 == 0) return 0;

        uint256 applicable = lastTimeRewardApplicable();
        if (applicable <= lastUpdateTime) return 0;

        return Math.mulDiv(
            applicable - lastUpdateTime,
            rewardRateX18,
            RATE_SCALE
        );
    }

    function remainingScheduledReward() public view returns (uint256) {
        if (block.timestamp >= periodFinish || rewardRateX18 == 0) return 0;

        return Math.mulDiv(
            periodFinish - block.timestamp,
            rewardRateX18,
            RATE_SCALE
        );
    }

    function availableRewardReserve() public view returns (uint256) {
        uint256 contractBalance = token.balanceOf(address(this));

        uint256 encumbered =
            totalStaked
            + rewardLiability
            + pendingRewardAccrual()
            + remainingScheduledReward();

        if (contractBalance <= encumbered) return 0;

        return contractBalance - encumbered;
    }

    function stake(uint256 amount)
        external
        nonReentrant
        whenNotPaused
        updateReward(msg.sender)
    {
        require(amount > 0, "Staking: zero amount");

        totalStaked += amount;
        balanceOf[msg.sender] += amount;

        token.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount)
        external
        nonReentrant
        updateReward(msg.sender)
    {
        _withdraw(msg.sender, amount);
    }

    function getReward()
        external
        nonReentrant
        updateReward(msg.sender)
    {
        _payReward(msg.sender);
    }

    function exit()
        external
        nonReentrant
        updateReward(msg.sender)
    {
        uint256 staked = balanceOf[msg.sender];

        if (staked > 0) {
            _withdraw(msg.sender, staked);
        }

        _payReward(msg.sender);
    }

    function notifyRewardAmount(uint256 reward, uint256 duration)
        external
        onlyOwner
        whenNotPaused
        updateReward(address(0))
    {
        require(reward > 0, "Staking: zero reward");
        require(duration >= 1 days && duration <= 1825 days, "Staking: bad duration");
        require(block.timestamp >= periodFinish, "Staking: active reward period");

        uint256 available = availableRewardReserve();
        require(reward <= available, "Staking: insufficient free reserve");

        uint256 newRateX18 = Math.mulDiv(reward, RATE_SCALE, duration);
        require(newRateX18 > 0, "Staking: rate zero");

        rewardRateX18 = newRateX18;
        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp + duration;

        emit RewardProgramStarted(reward, duration, newRateX18, periodFinish);
    }

    function _updateGlobalReward() internal {
        uint256 applicable = lastTimeRewardApplicable();

        if (applicable <= lastUpdateTime) return;

        uint256 elapsed = applicable - lastUpdateTime;

        if (totalStaked > 0 && rewardRateX18 > 0) {
            uint256 newlyAccrued =
                Math.mulDiv(elapsed, rewardRateX18, RATE_SCALE);

            rewardLiability += newlyAccrued;

            rewardPerTokenStored +=
                Math.mulDiv(elapsed, rewardRateX18, totalStaked);
        }

        lastUpdateTime = applicable;
    }

    function _earnedStored(address account) internal view returns (uint256) {
        return Math.mulDiv(
            balanceOf[account],
            rewardPerTokenStored - userRewardPerTokenPaid[account],
            RATE_SCALE
        ) + rewards[account];
    }

    function _withdraw(address account, uint256 amount) internal {
        require(amount > 0, "Staking: zero amount");
        require(balanceOf[account] >= amount, "Staking: insufficient stake");

        balanceOf[account] -= amount;
        totalStaked -= amount;

        token.safeTransfer(account, amount);

        emit Withdrawn(account, amount);
    }

    function _payReward(address account) internal {
        uint256 reward = rewards[account];

        if (reward > 0) {
            rewards[account] = 0;

            require(rewardLiability >= reward, "Staking: liability invariant");
            rewardLiability -= reward;

            token.safeTransfer(account, reward);

            emit RewardPaid(account, reward);
        }
    }
}
