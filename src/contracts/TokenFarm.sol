pragma solidity ^0.5.0;

import "./DaiToken.sol";
import "./DappToken.sol";

contract TokenFarm{

	string public name = "Dapp Token Farm";
	
	address public owner;
	DaiToken public daiToken;
	DappToken public dappToken;
	

	address[] public stakers;
	mapping (address => uint) public stakingBalance;
	mapping (address => bool) public hasStaked;
	mapping (address => bool) public isStaking;

	constructor(DaiToken _daiToken, DappToken _dappToken) public {
		owner = msg.sender;
		daiToken = _daiToken;
		dappToken = _dappToken;
	}

	//Stake Tokens (Deposit)

	function stakeTokens(uint _amount) public {
		require(_amount > 0, 'staking amount must be greater than zero');

		//Transfer mock DAI to this contract for staking
		daiToken.transferFrom(msg.sender, address(this), _amount);

		//Update user's staking balance 
		stakingBalance[msg.sender] += _amount;

		//Add users to stakers array if they haven't staked previously
		if(!hasStaked[msg.sender]){
			stakers.push(msg.sender);
		}

		//Update user's staking status
		hasStaked[msg.sender] = true;
		isStaking[msg.sender] = true;
	}

	//Unstake Tokens (Withdrawel)
	function unstakeTokens() public{
		//require that stakingBalance > 0 for investor before unstaking can occur
		require(stakingBalance[msg.sender] > 0, 'cannot unstake w/ 0 tokens in stakingBalance');
		
		//transfer all rightful daiToken from this contract to msg.sender
		daiToken.transfer(msg.sender, stakingBalance[msg.sender]);
		
		//reset staking balance to zero
		stakingBalance[msg.sender] = 0;
		
		//set isStaking flag to false since all tokens have been withdrawn
		isStaking[msg.sender] = false;
	}

 
	//Issuing Tokens (Earning Interest)
	function issueTokens() public {
		//only the owner can issue tokens
		require(msg.sender == owner, 'issueTokens caller must be owner');

		//issue tokens to all users in the stakers array
		//issue exactly as many tokens to each staker as their stakingBalance
		for(uint i = 0; i < stakers.length; i++ ){
			//address recipient = stakers[i];
			//uint balance = stakingBalance[recipient];
			//if(balance > 0){
			//	dappToken.transfer(recipient, balance);
			//}

			//another way to write the issuance logic
			//require(isStaking[stakers[i]] == true, 'investor is not currently staking DAI tokens');
			require(stakingBalance[stakers[i]] > 0, 'staking balance must be > 0 to issue tokens to investor');
			dappToken.transfer(stakers[i], stakingBalance[stakers[i]]);

		}
		

	}

}
