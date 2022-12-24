import { chainName, cyan, dim, displayResult, green } from "./utilities/utils";

import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, getChainId } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = parseInt(await getChainId());

  // 31337 is unit testing, 1337 is for coverage
  const isTestEnvironment = chainId === 31337 || chainId === 1337;

  cyan("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  cyan("            TicketToken - Deploy");
  cyan("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");

  dim(`network: ${chainName(chainId)} (${isTestEnvironment ? "local" : "remote"})`);
  dim(`deployer: ${deployer}`);

  cyan("\nDeploying TicketToken Contract...");

  const deployResult = await deploy("TicketToken", {
    from: deployer,
    args: ["https://bafybeibioko72oewngbiclrkzi645cb2t4kpv6lxk2o5jppktbc2a3x4py.ipfs.nftstorage.link/ticket_token.json"],
    skipIfAlreadyDeployed: true,
  });

  displayResult("TicketToken", deployResult);

  green(`\nDone!`);
};

func.tags = ["01_ticket_token"];

export default func;