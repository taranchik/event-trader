const { waffle, ethers } = require("hardhat");
const { provider } = waffle;

const GoodsToken = artifacts.require("GoodsToken");

contract("GoodsToken", accounts => {
  let CONTRACT_DEPLOYER_ADDR, USER_ADDR, goodsToken, baseURI;

  before("Deploy contracts", async () => {
    baseURI = "";
    goodsToken = await GoodsToken.new(baseURI);

    CONTRACT_DEPLOYER_ADDR = accounts[0];
    USER_ADDR = accounts[1];
  });

  after("Destruct contracts", () => {
    goodsToken = null;

    CONTRACT_DEPLOYER_ADDR = null;
    USER_ADDR = null;
  });

  describe("Testing of possible functionality", () => {
    it("User should get token uri", async () => {
      // setup
      let tokenURI;
      const tokenId = 0;

      // exercise
      tokenURI = await goodsToken.uri(tokenId, { from: USER_ADDR });

      // verify
      expect(baseURI).to.eql(tokenURI);
    });

    it("Contract deployer should set base uri", async () => {
      // setup
      baseURI = "https://bafybeigcd57hrvzegi3jbchx3jxflt3slwncm27mlgwmbfrvjcklkvjmfy.ipfs.nftstorage.link/";
      let tokenURI;
      const tokenId = 0;
      const expectedTokenURI = `${baseURI}${tokenId}.json`;

      // exercise
      await goodsToken.setURI(baseURI, { from: CONTRACT_DEPLOYER_ADDR });
      tokenURI = await goodsToken.uri(tokenId, { from: CONTRACT_DEPLOYER_ADDR });

      // verify
      expect(expectedTokenURI).to.eql(tokenURI);
    });

    it("Contract deployer should mint token", async () => {
      // setup
      let beforeTokenBalance, afterTokenBalance;
      const tokenId = 0;
      const amount = "2";

      // exercise
      beforeTokenBalance = await goodsToken.balanceOf(USER_ADDR, tokenId);
      await goodsToken.mint(USER_ADDR, tokenId, amount, "0x00", { from: CONTRACT_DEPLOYER_ADDR });
      afterTokenBalance = await goodsToken.balanceOf(USER_ADDR, tokenId);

      const tokenBalanceDiff = afterTokenBalance.sub(beforeTokenBalance).toString();

      // verify
      expect(amount).to.eql(tokenBalanceDiff);
    });
  });

  describe("Testing of impossible functionality", () => {
    it("User tries to set base uri", async () => {
      // setup
      const tokenId = 0;

      try {
        // exercise
        await goodsToken.setURI(baseURI, { from: USER_ADDR });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Ownable: caller is not the owner");
      }
    });

    it("User tries to mint token", async () => {
      // setup
      const tokenId = 0;
      const amount = "2";

      try {
        // exercise
        await goodsToken.mint(USER_ADDR, tokenId, amount, "0x00", { from: USER_ADDR });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Ownable: caller is not the owner");
      }
    });
  });
});
