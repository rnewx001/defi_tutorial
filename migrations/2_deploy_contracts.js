const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')

module.exports = async function(deployer, network, accounts) {
	//Deploy Mock DAI Token
	await deployer.deploy(DaiToken)
	const daiToken = await DaiToken.deployed()

	//Deploy Dapp Token
	await deployer.deploy(DappToken)
	const dappToken = await DappToken.deployed()

	//Deploy TokenFarm
	await deployer.deploy(TokenFarm, daiToken.address, dappToken.address)
	const tokenFarm = await TokenFarm.deployed()

	//transfer all dappTokens to the TokenFarm contract (1 mil total)
	await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

	//transfer 100 mock DAI to one of the Ganache accounts to act as an 'investor'
	await daiToken.transfer(accounts[1], '100000000000000000000')
}
