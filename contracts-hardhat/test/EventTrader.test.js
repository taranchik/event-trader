/*[["0xd7Fcf63aBc49E1EAAf697C2EE3b8e1966e0c0C12", 0, 600000000000000],["0x96DC799520A9311bf37F1CA33ef537027060daf5", 0, 600000000000000],["0x96DC799520A9311bf37F1CA33ef537027060daf5", 1, 600000000000000],["0x96DC799520A9311bf37F1CA33ef537027060daf5", 2, 600000000000000],["0x96DC799520A9311bf37F1CA33ef537027060daf5", 3, 600000000000000],["0x96DC799520A9311bf37F1CA33ef537027060daf5", 4, 600000000000000],["0x96DC799520A9311bf37F1CA33ef537027060daf5", 5, 600000000000000],["0x96DC799520A9311bf37F1CA33ef537027060daf5", 6, 600000000000000],["0x96DC799520A9311bf37F1CA33ef537027060daf5", 7, 600000000000000]]*/

const { waffle, ethers } = require("hardhat");
const { provider } = waffle;

const EventTrader = artifacts.require("EventTrader");
const TicketToken = artifacts.require("TicketToken");
const GoodsToken = artifacts.require("GoodsToken");

contract("EventTrader", accounts => {
  let CONTRACT_DEPLOYER_ADDR, MODERATOR_ADDR, USER_ADDR, eventTrader, goodsToken, ticketToken;

  const beforeDescribe = async () => {
    eventTrader = await EventTrader.new();
    ticketToken = await TicketToken.new(
      "https://bafybeibioko72oewngbiclrkzi645cb2t4kpv6lxk2o5jppktbc2a3x4py.ipfs.nftstorage.link/ticket_token.json"
    );
    goodsToken = await GoodsToken.new("https://bafybeigcd57hrvzegi3jbchx3jxflt3slwncm27mlgwmbfrvjcklkvjmfy.ipfs.nftstorage.link/");

    await ticketToken.transferOwnership(eventTrader.address);
    await goodsToken.transferOwnership(eventTrader.address);

    CONTRACT_DEPLOYER_ADDR = accounts[0];
    MODERATOR_ADDR = accounts[1];
    USER_ADDR = accounts[2];
  };

  const afterDescribe = () => {
    eventTrader = null;
    ticketToken = null;
    goodsToken = null;

    CONTRACT_DEPLOYER_ADDR = null;
    MODERATOR_ADDR = null;
    USER_ADDR = null;
  };

  describe("Testing of possible functionality", () => {
    before("Deploy contracts", beforeDescribe);
    after("Destruct contracts", afterDescribe);

    it("Contact owner should have an admin role of EventTrader", async () => {
      // setup
      let DEFAULT_ADMIN_ROLE, hasAdminRole;

      // exercise
      DEFAULT_ADMIN_ROLE = await eventTrader.DEFAULT_ADMIN_ROLE();
      hasAdminRole = await eventTrader.hasRole(DEFAULT_ADMIN_ROLE, CONTRACT_DEPLOYER_ADDR);

      // verify
      expect(hasAdminRole).to.be.true;
    });

    it("Admin should grant a moderator role", async () => {
      // setup
      let MODERATOR_ROLE, hasModeratorRole;

      // exercise
      MODERATOR_ROLE = await eventTrader.MODERATOR_ROLE();
      await eventTrader.grantModerator(MODERATOR_ADDR, { from: CONTRACT_DEPLOYER_ADDR });
      hasModeratorRole = await eventTrader.hasRole(MODERATOR_ROLE, MODERATOR_ADDR);

      // verify
      expect(hasModeratorRole).to.be.true;
    });

    it("Moderator should get an information about used token", async () => {
      // setup
      let usedToken;
      const expectedUsedToken = {
        owner: "0x0000000000000000000000000000000000000000",
        validateUser: "0x0000000000000000000000000000000000000000",
        tokenType: "0",
        nftContractAddress: "0x0000000000000000000000000000000000000000",
        tokenId: "0",
        amount: "0",
        date: "0",
        valid: false,
      };
      const tokenId = 0;

      // exercise
      usedToken = await eventTrader
        .getUsedToken(tokenId, { from: MODERATOR_ADDR })
        .then(({ owner, validateUser, tokenType, nftContractAddress, tokenId, amount, date, valid }) => {
          return {
            owner,
            validateUser,
            tokenType,
            nftContractAddress,
            tokenId,
            amount,
            date,
            valid,
          };
        });

      // verify
      expect(expectedUsedToken).to.eql(usedToken);
    });

    it("User should get an information about collections allowed for sale", async () => {
      // setup
      let allowed;
      const nftContractAddress = ticketToken.address;
      const tokenId = 0;

      // exercise
      allowed = await eventTrader.collectionTokensAllowedForSale(nftContractAddress, tokenId, { from: USER_ADDR });

      // verify
      expect(allowed).to.be.false;
    });

    it("Admin should set token prices and tokens should be whitelisted", async () => {
      // setup
      let afterTokenPrices, expectedCollectionTokensAllowedForSale, collectionTokensAllowedForSale;
      const TOKEN_PRICES = [
        [ticketToken.address, 0, 600000000000000],
        [goodsToken.address, 0, 600000000000000],
        [goodsToken.address, 1, 600000000000000],
        [goodsToken.address, 2, 600000000000000],
        [goodsToken.address, 3, 600000000000000],
        [goodsToken.address, 4, 600000000000000],
        [goodsToken.address, 5, 600000000000000],
        [goodsToken.address, 6, 600000000000000],
        [goodsToken.address, 7, 600000000000000],
      ];

      // exercise
      await eventTrader.setTokenPrices(TOKEN_PRICES, { from: CONTRACT_DEPLOYER_ADDR });

      for (const tokenData of TOKEN_PRICES) {
        if (!afterTokenPrices) {
          afterTokenPrices = [
            [
              tokenData[0],
              tokenData[1],
              await eventTrader.getTokenPrice(tokenData[0], 0, tokenData[1], { from: CONTRACT_DEPLOYER_ADDR }).then(price => price.toNumber()),
            ],
          ];
        } else {
          afterTokenPrices.push([
            tokenData[0],
            tokenData[1],
            await eventTrader.getTokenPrice(tokenData[0], 1, tokenData[1], { from: CONTRACT_DEPLOYER_ADDR }).then(price => price.toNumber()),
          ]);
        }

        if (!collectionTokensAllowedForSale) {
          expectedCollectionTokensAllowedForSale = {
            [tokenData[0]]: { [tokenData[1]]: true },
          };
          collectionTokensAllowedForSale = {
            [tokenData[0]]: { [tokenData[1]]: await eventTrader.collectionTokensAllowedForSale(tokenData[0], tokenData[1]) },
          };
        } else {
          expectedCollectionTokensAllowedForSale = {
            ...expectedCollectionTokensAllowedForSale,
            [tokenData[0]]: { ...expectedCollectionTokensAllowedForSale[tokenData[0]], [tokenData[1]]: true },
          };
          collectionTokensAllowedForSale = {
            ...collectionTokensAllowedForSale,
            [tokenData[0]]: {
              ...collectionTokensAllowedForSale[tokenData[0]],
              [tokenData[1]]: await eventTrader.collectionTokensAllowedForSale(tokenData[0], tokenData[1]),
            },
          };
        }
      }

      // verify
      expect(TOKEN_PRICES).to.eql(afterTokenPrices);
      expect(expectedCollectionTokensAllowedForSale).to.eql(collectionTokensAllowedForSale);
    });

    it("User should get an information about ERC721 token price", async () => {
      // setup
      let tokenPrice;
      const expectedTokenPrice = "600000000000000";
      const nftContractAddress = ticketToken.address;
      const tokenType = 0;
      const tokenId = 0;

      // exercise
      tokenPrice = await eventTrader.getTokenPrice(nftContractAddress, tokenType, tokenId, { from: USER_ADDR }).then(price => price.toString());

      // verify
      expect(tokenPrice).to.equal(expectedTokenPrice);
    });

    it("User should get an information about ERC1155 token price", async () => {
      // setup
      let tokenPrice;
      const expectedTokenPrice = "600000000000000";
      const nftContractAddress = ticketToken.address;
      const tokenType = 1;
      const tokenId = 0;

      // exercise
      tokenPrice = await eventTrader.getTokenPrice(nftContractAddress, tokenType, tokenId, { from: USER_ADDR }).then(price => price.toString());

      // verify
      expect(tokenPrice).to.equal(expectedTokenPrice);
    });

    it("Admin should set token whitelisting to false", async () => {
      // setup
      let afterAllowedToBeSold;
      const nftContractAddress = goodsToken.address;
      const tokenId = 7;
      const allowedToBeSold = false;

      // exercise
      await eventTrader.setCollectionTokensWhitelisting(nftContractAddress, tokenId, allowedToBeSold, { from: CONTRACT_DEPLOYER_ADDR });
      afterAllowedToBeSold = await eventTrader.collectionTokensAllowedForSale(nftContractAddress, tokenId);

      // verify
      expect(afterAllowedToBeSold).to.be.false;
    });

    it("User should buy ERC721 token", async () => {
      // setup
      let afterTokenOwner, beforeContractBalance, afterContractBalance, expectedDifference, tokenPrice;
      const nftContractAddress = ticketToken.address;
      const tokenType = 0;
      const tokenId = 0;
      const amount = 1;

      // exercise
      beforeContractBalance = await provider.getBalance(eventTrader.address);
      tokenPrice = await eventTrader.getTokenPrice(nftContractAddress, tokenType, tokenId, { from: USER_ADDR }).then(price => price.toString());
      await eventTrader.buyToken(nftContractAddress, tokenType, tokenId, amount, { from: USER_ADDR, value: tokenPrice });
      afterTokenOwner = await ticketToken.ownerOf(tokenId, { from: USER_ADDR });
      afterContractBalance = await provider.getBalance(eventTrader.address);

      expectedDifference = afterContractBalance.sub(beforeContractBalance);

      // verify
      expect(USER_ADDR).to.equal(afterTokenOwner);
      expect(tokenPrice).to.equal(expectedDifference.toString());
    });

    it("User should buy ERC1155 tokens", async () => {
      // setup
      let beforeTokenBalance, afterTokenBalance, beforeContractBalance, afterContractBalance, tokenPrice, expectedContractBalanceDiff;
      const expectedTokenBalanceDiff = "5";
      const nftContractAddress = goodsToken.address;
      const tokenType = 1;
      const tokenId = 0;
      const amount = 5;

      // exercise
      beforeContractBalance = await provider.getBalance(eventTrader.address);
      beforeTokenBalance = await goodsToken.balanceOf(USER_ADDR, tokenId, { from: USER_ADDR });
      tokenPrice = await eventTrader.getTokenPrice(nftContractAddress, tokenType, tokenId, { from: USER_ADDR }).then(price => price.toString());
      await eventTrader.buyToken(nftContractAddress, tokenType, tokenId, amount, { from: USER_ADDR, value: tokenPrice });
      afterTokenBalance = await goodsToken.balanceOf(USER_ADDR, tokenId, { from: USER_ADDR });
      afterContractBalance = await provider.getBalance(eventTrader.address);

      expectedContractBalanceDiff = afterContractBalance.sub(beforeContractBalance);

      // verify
      expect(afterTokenBalance.sub(beforeTokenBalance).toString()).to.equal(expectedTokenBalanceDiff);
      expect(tokenPrice).to.equal(expectedContractBalanceDiff.toString());
    });

    it("User should use ERC721 token on own behalf", async () => {
      // setup
      let afterUsedToken;
      const nftContractAddress = ticketToken.address;
      const tokenType = 0;
      const tokenId = 0;
      const amount = 1;
      const usedTokenId = 0;

      // exercise
      await ticketToken.approve(eventTrader.address, tokenId, { from: USER_ADDR });
      const { timestamp } = await eventTrader
        .useToken(USER_ADDR, nftContractAddress, tokenType, tokenId, amount, { from: USER_ADDR })
        .then(async tx => await provider.getBlock(tx.blockNumber));

      const expectedUsedToken = {
        owner: USER_ADDR,
        validateUser: USER_ADDR,
        tokenType: `${tokenType}`,
        nftContractAddress,
        tokenId: `${tokenId}`,
        amount: `${amount}`,
        date: `${timestamp}`,
        valid: true,
      };

      afterUsedToken = await eventTrader
        .getUsedToken(usedTokenId, { from: CONTRACT_DEPLOYER_ADDR })
        .then(({ owner, validateUser, tokenType, nftContractAddress, tokenId, amount, date, valid }) => {
          return {
            owner,
            validateUser,
            tokenType,
            nftContractAddress,
            tokenId,
            amount,
            date,
            valid,
          };
        });

      // verify
      expect(expectedUsedToken).to.eql(afterUsedToken);
    });

    it("User should use ERC1155 token on own behalf", async () => {
      // setup
      let afterUsedToken;
      const operator = eventTrader.address;
      const approved = true;
      const nftContractAddress = goodsToken.address;
      const tokenType = 1;
      const tokenId = 0;
      const amount = 1;
      const usedTokenId = 1;

      // exercise
      await goodsToken.setApprovalForAll(operator, approved, { from: USER_ADDR });
      const { timestamp } = await eventTrader
        .useToken(USER_ADDR, nftContractAddress, tokenType, tokenId, amount, { from: USER_ADDR })
        .then(async tx => await provider.getBlock(tx.blockNumber));

      const expectedUsedToken = {
        owner: USER_ADDR,
        validateUser: USER_ADDR,
        tokenType: `${tokenType}`,
        nftContractAddress,
        tokenId: `${tokenId}`,
        amount: `${amount}`,
        date: `${timestamp}`,
        valid: true,
      };

      afterUsedToken = await eventTrader
        .getUsedToken(usedTokenId, { from: CONTRACT_DEPLOYER_ADDR })
        .then(({ owner, validateUser, tokenType, nftContractAddress, tokenId, amount, date, valid }) => {
          return {
            owner,
            validateUser,
            tokenType,
            nftContractAddress,
            tokenId,
            amount,
            date,
            valid,
          };
        });

      // verify
      expect(expectedUsedToken).to.eql(afterUsedToken);
    });

    it("Moderator should make user token invalid", async () => {
      // setup
      let afterTokenValidation;
      const tokenId = 0;
      const tokenValidation = false;

      // exercise
      await eventTrader.setTokenValidation(tokenId, tokenValidation, { from: MODERATOR_ADDR });
      afterTokenValidation = await eventTrader.getUsedToken(tokenId, { from: MODERATOR_ADDR }).then(({ valid }) => valid);

      // verify
      expect(afterTokenValidation).to.be.false;
    });

    it("Admin should revoke a moderator role", async () => {
      // setup
      let MODERATOR_ROLE, hasModeratorRole;

      // exercise
      MODERATOR_ROLE = await eventTrader.MODERATOR_ROLE();
      await eventTrader.revokeModerator(MODERATOR_ADDR, { from: CONTRACT_DEPLOYER_ADDR });
      hasModeratorRole = await eventTrader.hasRole(MODERATOR_ROLE, MODERATOR_ADDR);

      // verify
      expect(hasModeratorRole).to.be.false;
    });

    it("Admin should claim funds from the EventTrader", async () => {
      // setup
      let beforeAdminBalance, afterAdminBalance, beforeContractBalance, afterContractBalance;

      // exercise
      beforeAdminBalance = await provider.getBalance(CONTRACT_DEPLOYER_ADDR);
      beforeContractBalance = await provider.getBalance(eventTrader.address);

      const transactionData = await eventTrader.claimFunds({ from: CONTRACT_DEPLOYER_ADDR });
      const gasUsed = transactionData.receipt.gasUsed;

      const gasPrice = await provider.getTransaction(transactionData.tx).then(tx => tx.gasPrice);
      const gasCost = gasPrice.mul(gasUsed);

      afterContractBalance = await provider.getBalance(eventTrader.address);
      afterAdminBalance = await provider.getBalance(CONTRACT_DEPLOYER_ADDR);

      const expectedAdminBalance = beforeAdminBalance.sub(gasCost).add(beforeContractBalance);

      // verify
      expect(expectedAdminBalance.eq(afterAdminBalance)).to.be.true;
      expect(afterContractBalance.eq(0)).to.be.true;
    });

    it("Admin should transfer collections ownership from EventTrader to himself", async () => {
      // setup
      let beforeTicketTokenOwner, beforeGoodsTokenOwner, afterTicketTokenOwner, afterGoodsTokenOwner;
      const EVENT_TRADER_ADDR = eventTrader.address;
      const TICKET_TOKEN_ADDR = ticketToken.address;
      const GOODS_TOKEN_ADDR = goodsToken.address;

      // exercise
      beforeTicketTokenOwner = await ticketToken.owner({ from: CONTRACT_DEPLOYER_ADDR });
      beforeGoodsTokenOwner = await goodsToken.owner({ from: CONTRACT_DEPLOYER_ADDR });

      await eventTrader.transferCollectionOwnership(TICKET_TOKEN_ADDR, CONTRACT_DEPLOYER_ADDR, { from: CONTRACT_DEPLOYER_ADDR });
      await eventTrader.transferCollectionOwnership(GOODS_TOKEN_ADDR, CONTRACT_DEPLOYER_ADDR, { from: CONTRACT_DEPLOYER_ADDR });

      afterTicketTokenOwner = await ticketToken.owner({ from: CONTRACT_DEPLOYER_ADDR });
      afterGoodsTokenOwner = await goodsToken.owner({ from: CONTRACT_DEPLOYER_ADDR });

      // verify
      expect(beforeTicketTokenOwner).to.eql(EVENT_TRADER_ADDR);
      expect(beforeGoodsTokenOwner).to.eql(EVENT_TRADER_ADDR);
      expect(afterTicketTokenOwner).to.eql(CONTRACT_DEPLOYER_ADDR);
      expect(afterGoodsTokenOwner).to.eql(CONTRACT_DEPLOYER_ADDR);
    });
  });

  describe("Testing of impossible functionality", () => {
    before("Deploy contracts", beforeDescribe);
    after("Destruct contracts", afterDescribe);

    it("User tries to whitelist collection", async () => {
      // setup
      const nftContractAddress = ticketToken.address;
      const tokenId = 0;
      const allowedToBeSold = true;

      try {
        // exercise
        await eventTrader.setCollectionTokensWhitelisting(nftContractAddress, tokenId, allowedToBeSold, { from: USER_ADDR });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Only contract admin can whitelist NFT contracts");
      }
    });

    it("User tries to set token prices", async () => {
      // setup
      const TOKEN_PRICES = [
        [ticketToken.address, 0, 600000000000000],
        [goodsToken.address, 0, 600000000000000],
        [goodsToken.address, 1, 600000000000000],
        [goodsToken.address, 2, 600000000000000],
        [goodsToken.address, 3, 600000000000000],
        [goodsToken.address, 4, 600000000000000],
        [goodsToken.address, 5, 600000000000000],
        [goodsToken.address, 6, 600000000000000],
        [goodsToken.address, 7, 600000000000000],
      ];

      try {
        // exercise
        await eventTrader.setTokenPrices(TOKEN_PRICES, { from: USER_ADDR });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Only contract admin can set token prices");
      }
    });

    it("Admin tries to set token prices using collections for which EventTrader does not have ownership", async () => {
      // setup
      const FAKE_TICKET_TOKEN = await TicketToken.new("").then(instance => instance.address);
      const FAKE_GOODS_TOKEN = await GoodsToken.new("").then(instance => instance.address);
      const TOKEN_PRICES = [
        [FAKE_TICKET_TOKEN, 0, 600000000000000],
        [FAKE_GOODS_TOKEN, 0, 600000000000000],
        [FAKE_GOODS_TOKEN, 1, 600000000000000],
        [FAKE_GOODS_TOKEN, 2, 600000000000000],
        [FAKE_GOODS_TOKEN, 3, 600000000000000],
        [FAKE_GOODS_TOKEN, 4, 600000000000000],
        [FAKE_GOODS_TOKEN, 5, 600000000000000],
        [FAKE_GOODS_TOKEN, 6, 600000000000000],
        [FAKE_GOODS_TOKEN, 7, 600000000000000],
      ];

      try {
        // exercise
        await eventTrader.setTokenPrices(TOKEN_PRICES, { from: CONTRACT_DEPLOYER_ADDR });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("EventTrader does not own specified collections");
      }
    });

    it("User tries to buy an unspecified ERC721 NFT contract", async () => {
      // setup
      const tokenPrice = 600000000000000;
      const nftContractAddress = "0x0000000000000000000000000000000000000000";
      const tokenType = 0;
      const tokenId = 0;
      const amount = 1;

      try {
        // exercise
        await eventTrader.buyToken(nftContractAddress, tokenType, tokenId, amount, { from: USER_ADDR, value: tokenPrice });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Specified NFT contract is not whitelisted to be bought");
      }
    });

    it("User tries to buy ERC721 token paying wrong price", async () => {
      // setup
      let tokenPrice;
      const nftContractAddress = ticketToken.address;
      const tokenType = 0;
      const tokenId = 0;
      const amount = 1;
      const TOKEN_PRICES = [
        [ticketToken.address, 0, 600000000000000],
        [goodsToken.address, 0, 600000000000000],
        [goodsToken.address, 1, 600000000000000],
        [goodsToken.address, 2, 600000000000000],
        [goodsToken.address, 3, 600000000000000],
        [goodsToken.address, 4, 600000000000000],
        [goodsToken.address, 5, 600000000000000],
        [goodsToken.address, 6, 600000000000000],
        [goodsToken.address, 7, 600000000000000],
      ];

      try {
        // exercise
        await eventTrader.setTokenPrices(TOKEN_PRICES, { from: CONTRACT_DEPLOYER_ADDR });
        tokenPrice = await eventTrader
          .getTokenPrice(nftContractAddress, tokenType, tokenId, { from: USER_ADDR })
          .then(price => price.toString());
        await eventTrader.buyToken(nftContractAddress, tokenType, tokenId, amount, { from: USER_ADDR, value: `${tokenPrice}1111` });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Token price is different");
      }
    });

    it("User tries to buy more than one ERC721 token per transaction", async () => {
      // setup
      let tokenPrice;
      const nftContractAddress = ticketToken.address;
      const tokenType = 0;
      const tokenId = 0;
      const amount = 2;

      try {
        // exercise
        tokenPrice = await eventTrader
          .getTokenPrice(nftContractAddress, tokenType, tokenId, { from: USER_ADDR })
          .then(price => price.toString());
        await eventTrader.buyToken(nftContractAddress, tokenType, tokenId, amount, { from: USER_ADDR, value: tokenPrice });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Only one token is possible to buy per transaction");
      }
    });

    it("User tries to buy an unspecified ERC1155 NFT contract", async () => {
      // setup
      const tokenPrice = 600000000000000;
      const nftContractAddress = goodsToken.address;
      const tokenType = 1;
      const tokenId = 100;
      const amount = 2;

      try {
        // exercise
        await eventTrader.buyToken(nftContractAddress, tokenType, tokenId, amount, { from: USER_ADDR, value: tokenPrice });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Specified NFT contract is not whitelisted to be bought");
      }
    });

    it("User tries to buy ERC1155 token paying wrong price", async () => {
      // setup
      const tokenPrice = 600000000000001;
      const nftContractAddress = goodsToken.address;
      const tokenType = 1;
      const tokenId = 0;
      const amount = 1;

      try {
        // exercise
        await eventTrader.buyToken(nftContractAddress, tokenType, tokenId, amount, { from: USER_ADDR, value: tokenPrice });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Token price is different");
      }
    });

    it("User tries to use token specifing zero user validate address", async () => {
      // setup
      const validateUser = "0x0000000000000000000000000000000000000000";
      const nftContractAddress = ticketToken.address;
      const tokenType = 0;
      const tokenId = 0;
      const amount = 1;

      try {
        // exercise
        await eventTrader.useToken(validateUser, nftContractAddress, tokenType, tokenId, amount, { from: USER_ADDR });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Validation user can not be null address");
      }
    });

    it("User tries to use not whitilisted ERC721 collection token", async () => {
      // setup
      const nftContractAddress = "0x0000000000000000000000000000000000000000";
      const tokenType = 0;
      const tokenId = 0;
      const amount = 1;

      try {
        // exercise
        await eventTrader.useToken(USER_ADDR, nftContractAddress, tokenType, tokenId, amount, { from: USER_ADDR });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Specified NFT contract is not allowed to be used");
      }
    });

    it("User tries to use more than one ERC721 token per transaction", async () => {
      // setup
      const nftContractAddress = ticketToken.address;
      const tokenType = 0;
      const tokenId = 0;
      const amount = 2;

      try {
        // exercise
        await eventTrader.useToken(USER_ADDR, nftContractAddress, tokenType, tokenId, amount, { from: USER_ADDR });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Only one token is possible to use per transaction");
      }
    });

    it("User tries to use not owned ERC721 token", async () => {
      // setup
      let tokenPrice;
      const nftContractAddress = ticketToken.address;
      const tokenType = 0;
      const tokenId = 1;
      const amount = 1;

      try {
        // exercise
        tokenPrice = await eventTrader
          .getTokenPrice(nftContractAddress, tokenType, tokenId, { from: CONTRACT_DEPLOYER_ADDR })
          .then(price => price.toString());
        await eventTrader.buyToken(nftContractAddress, tokenType, tokenId, amount, { from: CONTRACT_DEPLOYER_ADDR, value: tokenPrice });

        await ticketToken.ownerOf(tokenId);
        await eventTrader.useToken(USER_ADDR, nftContractAddress, tokenType, tokenId, amount, { from: USER_ADDR });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("User is not the owner of specified ERC721 token");
      }
    });

    it("User tries to use ERC721 token without approval to EventTrader", async () => {
      // setup
      let tokenPrice;
      const nftContractAddress = ticketToken.address;
      const tokenType = 0;
      const tokenId = 2;
      const amount = 1;

      try {
        // exercise
        tokenPrice = await eventTrader
          .getTokenPrice(nftContractAddress, tokenType, tokenId, { from: USER_ADDR })
          .then(price => price.toString());
        await eventTrader.buyToken(nftContractAddress, tokenType, tokenId, amount, { from: USER_ADDR, value: tokenPrice });
        await eventTrader.useToken(USER_ADDR, nftContractAddress, tokenType, tokenId, amount, { from: USER_ADDR });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Specified token id has not approval to EventTrader");
      }
    });

    it("User tries to use not whitilisted ERC1155 collection token", async () => {
      // setup
      const nftContractAddress = "0x0000000000000000000000000000000000000000";
      const tokenType = 1;
      const tokenId = 0;
      const amount = 1;

      try {
        // exercise
        await eventTrader.useToken(USER_ADDR, nftContractAddress, tokenType, tokenId, amount, { from: USER_ADDR });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Specified NFT contract is not allowed to be used");
      }
    });

    it("User tries to use more ERC1155 tokens than he has", async () => {
      // setup
      let tokenPrice;
      const nftContractAddress = goodsToken.address;
      const tokenType = 1;
      const tokenId = 1;
      const amount = 1;
      const useTokenAmount = 2;

      try {
        // exercise
        tokenPrice = await eventTrader
          .getTokenPrice(nftContractAddress, tokenType, tokenId, { from: CONTRACT_DEPLOYER_ADDR })
          .then(price => price.toNumber());
        await eventTrader.buyToken(nftContractAddress, tokenType, tokenId, amount, { from: USER_ADDR, value: tokenPrice });
        await eventTrader.useToken(USER_ADDR, nftContractAddress, tokenType, tokenId, useTokenAmount, { from: USER_ADDR });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("User does not have specified amount of tokens at tokenId to be sold");
      }
    });

    it("User tries to use ERC1155 collection token without approval to EventTrader", async () => {
      // setup
      const operator = eventTrader.address;
      const approved = false;
      const nftContractAddress = goodsToken.address;
      const tokenType = 1;
      const tokenId = 1;
      const amount = 1;

      try {
        // exercise
        await goodsToken.setApprovalForAll(operator, approved, { from: USER_ADDR });
        const { timestamp } = await eventTrader
          .useToken(USER_ADDR, nftContractAddress, tokenType, tokenId, amount, { from: USER_ADDR })
          .then(async tx => await provider.getBlock(tx.blockNumber));
        await eventTrader.useToken(USER_ADDR, nftContractAddress, tokenType, tokenId, useTokenAmount, { from: USER_ADDR });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Tokens to be used are not approved to EventTrader");
      }
    });

    it("User tries to set token validation", async () => {
      // setup
      const usedTokenId = 0;
      const tokenValidation = false;

      try {
        // exercise
        await eventTrader.setTokenValidation(usedTokenId, tokenValidation, { from: USER_ADDR });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Only contract admin or moderator can set user token validity");
      }
    });

    it("Admin tries to set token validation specifing unexisting token id", async () => {
      // setup
      const usedTokenId = 10;
      const tokenValidation = false;

      try {
        // exercise
        await eventTrader.setTokenValidation(usedTokenId, tokenValidation, { from: CONTRACT_DEPLOYER_ADDR });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("usedTokenId does not exist");
      }
    });

    it("User tries to get data of used token", async () => {
      // setup
      const usedTokenId = 0;

      try {
        // exercise
        await eventTrader.getUsedToken(usedTokenId, { from: USER_ADDR });

        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        // verify
        expect(error.message).to.include("Only contract admin or moderator can get used token");
      }
    });
  });
});
