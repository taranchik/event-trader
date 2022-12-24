const { waffle, ethers } = require("hardhat");
const { provider } = waffle;

const TicketToken = artifacts.require("TicketToken");

contract("TicketToken", accounts => {
  let CONTRACT_DEPLOYER_ADDR, USER_ADDR, ticketToken, tokenURI;

  before("Deploy contracts", async () => {
    tokenURI = "";
    ticketToken = await TicketToken.new(tokenURI);

    CONTRACT_DEPLOYER_ADDR = accounts[0];
    USER_ADDR = accounts[1];
  });

  after("Destruct contracts", () => {
    ticketToken = null;

    CONTRACT_DEPLOYER_ADDR = null;
    USER_ADDR = null;
  });

  describe("Testing of possible functionality", () => {
    it("User should get token uri", async () => {
      // setup
      const tokenId = 0;
      let afterTokenURI;

      // exercise
      afterTokenURI = await ticketToken.tokenURI(tokenId, { from: USER_ADDR });

      // verify
      expect(tokenURI).to.eql(afterTokenURI);
    });

    it("Contract deployer should set token uri", async () => {
      // setup
      const tokenId = 0;
      tokenURI = "https://bafybeibioko72oewngbiclrkzi645cb2t4kpv6lxk2o5jppktbc2a3x4py.ipfs.nftstorage.link/ticket_token.json";
      let afterTokenURI;

      // exercise
      await ticketToken.setURI(tokenURI, { from: CONTRACT_DEPLOYER_ADDR });
      afterTokenURI = await ticketToken.tokenURI(tokenId, { from: CONTRACT_DEPLOYER_ADDR });

      // verify
      expect(tokenURI).to.eql(afterTokenURI);
    });

    it("Contract deployer should mint token", async () => {
      // setup
      let beforeTokenBalance, afterTokenBalance;
      const tokenId = 0;
      const expectedTokenBalanceDiff = "1";

      // exercise
      beforeTokenBalance = await ticketToken.balanceOf(USER_ADDR);
      await ticketToken.safeMint(USER_ADDR, tokenId, { from: CONTRACT_DEPLOYER_ADDR });
      afterTokenBalance = await ticketToken.balanceOf(USER_ADDR);

      const tokenBalanceDiff = afterTokenBalance.sub(beforeTokenBalance).toString();

      // verify
      expect(expectedTokenBalanceDiff).to.eql(tokenBalanceDiff);
    });
  });

  describe("Testing of impossible functionality", () => {
    it("User tries to set token uri", async () => {
      // setup

      try {
        // exercise
        await ticketToken.setURI(tokenURI, { from: USER_ADDR });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Ownable: caller is not the owner");
      }
    });

    it("User tries to mint token", async () => {
      // setup
      const tokenId = 0;

      try {
        // exercise
        await ticketToken.safeMint(USER_ADDR, tokenId, { from: USER_ADDR });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Ownable: caller is not the owner");
      }
    });
  });
});
