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
  cyan("            GoodsToken - Deploy");
  cyan("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");

  dim(`network: ${chainName(chainId)} (${isTestEnvironment ? "local" : "remote"})`);
  dim(`deployer: ${deployer}`);

  cyan("\nDeploying GoodsToken Contract...");

  const deployResult = await deploy("GoodsToken", {
    from: deployer,
    args: ["https://bafybeigcd57hrvzegi3jbchx3jxflt3slwncm27mlgwmbfrvjcklkvjmfy.ipfs.nftstorage.link/"],
    skipIfAlreadyDeployed: true
  });

  displayResult("GoodsToken", deployResult);

  green(`\nDone!`);
};

func.tags = ["02_goods_token"];

export default func;