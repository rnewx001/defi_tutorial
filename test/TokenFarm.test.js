//3 contract object variable definitions, just like the deployment script
const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
	.use(require('chai-as-promised'))
	.should()

//helper function to convert any amount of Ether (or 18 decimal token) to its Wei form
function tokens(n){
	return web3.utils.toWei(n, 'Ether');
}

//owner = accounts[0], investor = accounts[1]
contract('TokenFarm', ([owner, investor]) => {

	let daiToken, dappToken, tokenFarm

	before( async () => {
		//load contracts
		daiToken = await DaiToken.new()
		dappToken = await DappToken.new()
		tokenFarm = await TokenFarm.new(daiToken.address, dappToken.address)

		//transfer all tokens to TokenFarm contract
		//transfer all dappTokens to the TokenFarm contract (1 mil total)
		await dappToken.transfer(tokenFarm.address, tokens('1000000'))

		//transfer 100 mock DAI to one of the Ganache accounts to act as an 'investor'
		await daiToken.transfer(investor, tokens('100'), { from: owner } )
	})

	describe('Mock DAI deployment', async () =>{
		it('has a name', async () => {
			const name = await daiToken.name()
			assert.equal(name, 'Mock DAI Token')
		})
	})

	describe('Mock DAPP deployment', async () =>{
		it('has a name', async () => {
			const name = await dappToken.name()
			assert.equal(name, 'DApp Token')
		})
	})

	describe('Mock TokenFarm deployment', async () =>{
		it('has a name', async () => {
			const name = await tokenFarm.name()
			assert.equal(name, 'Dapp Token Farm')
		})

		it('has all 1 mil DappToken', async () => {
			const balance = await dappToken.balanceOf(tokenFarm.address)
			assert.equal(balance.toString(), tokens('1000000'))
		})
	})

	describe ('Farming Tokens', async () => {
		it('rewards investors for staking mDAI tokens', async () => {
			let result
			
			//test investor's balance before staking
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor mock DAI balance should be correct PRIOR to staking')
		
			//initiate approval function so tokenFarm can 'spend' the investor's DAI
			await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
		
			//test the investor's mock DAI staking
			await tokenFarm.stakeTokens(tokens('100'), { from: investor })
			
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('0'), 'investor mock DAI balance should be correct AFTER staking')
			
			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('100'), 'tokenFarm mock DAI balance should be correct AFTER staking')
			
			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('100'), 'investors staking balance should be correct AFTER staking')
		
			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'true', 'investors staking status should be TRUE AFTER staking')
		

			//issue tokens
			await tokenFarm.issueTokens({ from: owner })

			//check balance after issuance
			//three ways to write this
			result = await dappToken.balanceOf(investor)
			let expected = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), expected.toString(), 'investor DAPP token balance should be the same as that which was staked')
			//assert.equal(result.toString(), await tokenFarm.stakingBalance(investor), 'investor DAPP token balance should be the same as that which was staked')
			//assert.equal(result.toString(), tokens('100'), 'investor DAPP token balance should be the same as that which was staked')

			//ensure only owner can call issueTokens
			await tokenFarm.issueTokens({ from: investor }).should.be.rejected

			//Unstake Tokens test
			await tokenFarm.unstakeTokens({from: investor})

			//check results after staking
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'),'investor mockDAI balance back to 100')
			
			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('0'),'owner mockDAI balance back to 0')

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('0'),'investor mockDAI staking balance back to 0')

			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'false', 'investor staking flag set back to FALSE')

		})
	})

	




})

