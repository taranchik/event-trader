import "./App.css";

import { Component, createRef } from "react";
import { EVENT_TRADER, GOODS_TOKEN, TICKET_TOKEN } from "../../contracts";

import FormInput from "../Form/FormInput";
import FormSelect from "../Form/FormSelect";
import Web3 from "web3/dist/web3.min.js";

var web3;

const setupWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);

    try {
      window.ethereum.enable();
    } catch (c) {
      alert(c);
    }
  } else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
  } else {
    alert("You have to install MetaMask !");
  }
};

const boolOptions = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

const tokenTypeOptions = [
  { value: "0", label: "E721" },
  { value: "1", label: "E1155" },
];

class App extends Component {
  state = {
    _isTransacted: true,
    currentAccount: "",
  };

  eventTraderInstance;
  goodsTokenInstance;
  ticketTokenInstance;

  eventTraderFunctions = {
    eventTrader_buyToken: {
      formRef: createRef(),
      handleFunc: async (args) => {
        const tokenType = Number(args["tokenType"].value);
        const tokenPrice = await this.eventTraderInstance.methods
          .getTokenPrice(
            args["nftContractAddress"].value,
            tokenType,
            args["tokenId"].value
          )
          .call({ from: this.state.currentAccount })
          .catch(this.handleFailedTransaction);
        await this.eventTraderInstance.methods
          .buyToken(
            args["nftContractAddress"].value,
            args["tokenType"].value,
            args["tokenId"].value,
            args["amount"].value
          )
          .send({ from: this.state.currentAccount, value: tokenPrice })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    eventTrader_useToken: {
      formRef: createRef(),
      handleFunc: async (args) => {
        const tokenType = Number(args["tokenType"].value);
        await this.eventTraderInstance.methods
          .useToken(
            args["validateUser"].value,
            args["nftContractAddress"].value,
            tokenType,
            args["tokenId"].value,
            args["amount"].value
          )
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    eventTrader_claimFunds: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.eventTraderInstance.methods
          .claimFunds()
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    eventTrader_grantModerator: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.eventTraderInstance.methods
          .grantModerator(args["moderatorAddress"].value)
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    eventTrader_revokeModerator: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.eventTraderInstance.methods
          .revokeModerator(args["moderatorAddress"].value)
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    eventTrader_grantRole: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.eventTraderInstance.methods
          .grantRole(args["role"].value, args["account"].value)
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    eventTrader_revokeRole: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.eventTraderInstance.methods
          .revokeRole(args["role"].value, args["account"].value)
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    eventTrader_renounceRole: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.eventTraderInstance.methods
          .renounceRole(args["role"].value, args["account"].value)
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    eventTrader_setCollectionTokensWhitelisting: {
      formRef: createRef(),
      handleFunc: async (args) => {
        const allowedToBeSold = args["allowedToBeSold"].value === "true";
        await this.eventTraderInstance.methods
          .setCollectionTokensWhitelisting(
            args["nftContractAddress"].value,
            args["tokenId"].value,
            allowedToBeSold
          )
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    eventTrader_setTokenPrices: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.eventTraderInstance.methods
          .setTokenPrices(eval(args["tokensPrice"].value))
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    eventTrader_setTokenValidation: {
      formRef: createRef(),
      handleFunc: async (args) => {
        const valid = args["valid"].value === "true";
        await this.eventTraderInstance.methods
          .setTokenValidation(args["usedTokenId"].value, valid)
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    eventTrader_transferCollectionOwnership: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.eventTraderInstance.methods
          .transferCollectionOwnership(
            args["nftContractAddress"].value,
            args["targetAddr"].value
          )
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    eventTrader_getTokenPrice: {
      formRef: createRef(),
      handleFunc: async (args) => {
        const tokenType = Number(args["tokenType"].value);
        await this.eventTraderInstance.methods
          .getTokenPrice(
            args["nftContractAddress"].value,
            tokenType,
            args["tokenId"].value
          )
          .call({ from: this.state.currentAccount })
          .then((price) => {
            this.handlePrintOutput(`numeric: ${price}`);
            this.handleSuccessfulTransaction();
          })
          .catch(this.handleFailedTransaction);
      },
    },
    eventTrader_collectionTokensAllowedForSale: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.eventTraderInstance.methods
          .collectionTokensAllowedForSale(
            args["nftContractAddress"].value,
            args["tokenId"].value
          )
          .call({ from: this.state.currentAccount })
          .then((isAllowed) => {
            this.handlePrintOutput(`bool: ${isAllowed}`);
            this.handleSuccessfulTransaction();
          })
          .catch(this.handleFailedTransaction);
      },
    },
    eventTrader_getUsedToken: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.eventTraderInstance.methods
          .getUsedToken(args["tokenId"].value)
          .call({ from: this.state.currentAccount })
          .then((usedToken) => {
            this.handlePrintOutput(
              `amount: ${usedToken.amount}\n` +
                `date: ${usedToken.date}\n` +
                `nftContractAddress: ${usedToken.nftContractAddress}\n` +
                `owner: ${usedToken.owner}\n` +
                `tokenId: ${usedToken.tokenId}\n` +
                `tokenType: ${usedToken.tokenType}\n` +
                `valid: ${usedToken.valid}\n` +
                `validateUser: ${usedToken.validateUser}`
            );
            this.handleSuccessfulTransaction();
          })
          .catch(this.handleFailedTransaction);
      },
    },
    eventTrader_DEFAULT_ADMIN_ROLE: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.eventTraderInstance.methods
          .DEFAULT_ADMIN_ROLE()
          .call({ from: this.state.currentAccount })
          .then((adminRole) => {
            this.handlePrintOutput(`bytes32: ${adminRole}`);
            this.handleSuccessfulTransaction();
          })
          .catch(this.handleFailedTransaction);
      },
    },
    eventTrader_MODERATOR_ROLE: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.eventTraderInstance.methods
          .MODERATOR_ROLE()
          .call({ from: this.state.currentAccount })
          .then((moderatorRole) => {
            this.handlePrintOutput(`bytes32: ${moderatorRole}`);
            this.handleSuccessfulTransaction();
          })
          .catch(this.handleFailedTransaction);
      },
    },
    eventTrader_hasRole: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.eventTraderInstance.methods
          .hasRole(args["role"].value, args["account"].value)
          .call({ from: this.state.currentAccount })
          .then((hasRole) => {
            this.handlePrintOutput(`bool: ${hasRole}`);
            this.handleSuccessfulTransaction();
          })
          .catch(this.handleFailedTransaction);
      },
    },
    goodsToken_burn: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.goodsTokenInstance.methods
          .burn(args["account"].value, args["id"].value, args["value"].value)
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    goodsToken_safeTransferFrom: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.goodsTokenInstance.methods
          .safeTransferFrom(
            args["from"].value,
            args["to"].value,
            args["id"].value,
            args["amount"].value,
            "0x00"
          )
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    goodsToken_setApprovalForAll: {
      formRef: createRef(),
      handleFunc: async (args) => {
        const approved = args["approved"].value === true;
        await this.goodsTokenInstance.methods
          .setApprovalForAll(args["operator"].value, approved)
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    goodsToken_setURI: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.goodsTokenInstance.methods
          .setURI(args["newuri"].value)
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    goodsToken_transferOwnership: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.goodsTokenInstance.methods
          .transferOwnership(args["newOwner"].value)
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    goodsToken_balanceOf: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.goodsTokenInstance.methods
          .balanceOf(args["account"].value, args["id"].value)
          .call({ from: this.state.currentAccount })
          .then((balance) => {
            this.handlePrintOutput(`numeric: ${balance}`);
            this.handleSuccessfulTransaction();
          })
          .catch(this.handleFailedTransaction);
      },
    },
    goodToken_uri: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.goodsTokenInstance.methods
          .uri(args["tokenId"].value)
          .call({ from: this.state.currentAccount })
          .then((uri) => {
            this.handlePrintOutput(`string: ${uri}`);
            this.handleSuccessfulTransaction();
          })
          .catch(this.handleFailedTransaction);
      },
    },
    ticketToken_approve: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.ticketTokenInstance.methods
          .approve(args["to"].value, args["tokenId"].value)
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    ticketToken_burn: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.ticketTokenInstance.methods
          .burn(args["tokenId"].value)
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    ticketToken_transferFrom: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.ticketTokenInstance.methods
          .transferFrom(
            args["from"].value,
            args["to"].value,
            args["tokenId"].value
          )
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    ticketToken_transferOwnership: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.ticketTokenInstance.methods
          .transferOwnership(args["newOwner"].value)
          .send({ from: this.state.currentAccount })
          .then(this.handleSuccessfulTransaction)
          .catch(this.handleFailedTransaction);
      },
    },
    ticketToken_balanceOf: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.ticketTokenInstance.methods
          .balanceOf(args["owner"].value)
          .call({ from: this.state.currentAccount })
          .then((balance) => {
            this.handlePrintOutput(`numeric: ${balance}`);
            this.handleSuccessfulTransaction();
          })
          .catch(this.handleFailedTransaction);
      },
    },
    ticketToken_tokenURI: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.ticketTokenInstance.methods
          .tokenURI(0)
          .call({ from: this.state.currentAccount })
          .then((uri) => {
            this.handlePrintOutput(`string: ${uri}`);
            this.handleSuccessfulTransaction();
          })
          .catch(this.handleFailedTransaction);
      },
    },
    ticketToken_ownerOf: {
      formRef: createRef(),
      handleFunc: async (args) => {
        await this.ticketTokenInstance.methods
          .ownerOf(args["tokenId"].value)
          .call({ from: this.state.currentAccount })
          .then((owner) => {
            this.handlePrintOutput(`string: ${owner}`);
            this.handleSuccessfulTransaction();
          })
          .catch(this.handleFailedTransaction);
      },
    },
  };

  fetchData = async () => {
    this.setState({
      currentAccount: await web3.eth.getAccounts().then((res) => res[0]),
    });

    window.ethereum.on("accountsChanged", async (accounts) => {
      this.setState({
        currentAccount: await web3.eth.getAccounts().then((res) => res[0]),
      });
    });
  };

  constructor() {
    super();

    setupWeb3();

    this.eventTraderInstance = new web3.eth.Contract(
      EVENT_TRADER.abi,
      EVENT_TRADER.address
    );
    this.goodsTokenInstance = new web3.eth.Contract(
      GOODS_TOKEN.abi,
      GOODS_TOKEN.address
    );
    this.ticketTokenInstance = new web3.eth.Contract(
      TICKET_TOKEN.abi,
      TICKET_TOKEN.address
    );
  }

  componentDidMount() {
    this.fetchData();
  }

  handleTransaction = (functionKey) => {
    if (this.state._isTransacted) {
      this.setState({ _isTransacted: false });
      alert("Please, wait while the transaction is being processed.");
    } else {
      return;
    }

    const args =
      this.eventTraderFunctions[functionKey].formRef &&
      this.eventTraderFunctions[functionKey].formRef.current;

    this.eventTraderFunctions[functionKey]
      .handleFunc(args)
      .catch(this.handleFailedTransaction);
  };

  handleFailedTransaction = async (error, result) => {
    this.setState({ _isTransacted: true });
    console.log(error, result);
    if (error) {
      alert(`Transaction failed.\n\n${error.message}`);
    } else {
      alert(`Transaction failed.\n\n${result}`);
    }
  };

  handleSuccessfulTransaction = () => {
    this.setState({ _isTransacted: true });
    alert("Transaction completed successfully");
  };

  handlePrintOutput = (output) => {
    console.log(output);
    alert(output);
  };

  render() {
    return (
      <div className="App">
        {this.state.currentAccount ? (
          <div className="function-boxes-wrapper">
            <div className="box">
              <div className="box-title">
                <b>Event Trader</b> - Buy token
              </div>
              <form
                ref={this.eventTraderFunctions["eventTrader_buyToken"].formRef}
                className="box-fields"
              >
                <FormInput
                  label="Nft contract address: "
                  name="nftContractAddress"
                  placeholder="address"
                />
                <FormSelect
                  label="Token type: "
                  name="tokenType"
                  options={tokenTypeOptions}
                />
                <FormInput
                  label="Token id: "
                  name="tokenId"
                  placeholder="numeric"
                />
                <FormInput
                  label="Amount: "
                  name="amount"
                  placeholder="numeric"
                />
                <div className="row button-row">
                  <button
                    className="transact-payable-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "eventTrader_buyToken"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Event Trader</b> - Use token
              </div>
              <form
                ref={this.eventTraderFunctions["eventTrader_useToken"].formRef}
                className="box-fields"
              >
                <FormInput
                  label="Validate user: "
                  name="validateUser"
                  placeholder="address"
                />
                <FormInput
                  label="Nft contract address: "
                  name="nftContractAddress"
                  placeholder="address"
                />
                <FormSelect
                  label="Token type: "
                  name="tokenType"
                  options={tokenTypeOptions}
                />
                <FormInput
                  label="Token id: "
                  name="tokenId"
                  placeholder="numeric"
                />
                <FormInput
                  label="Amount: "
                  name="amount"
                  placeholder="numeric"
                />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "eventTrader_useToken"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Event Trader</b> - Claim funds
              </div>
              <form
                ref={
                  this.eventTraderFunctions["eventTrader_claimFunds"].formRef
                }
                className="box-fields"
              >
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "eventTrader_claimFunds"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Event Trader</b> - Grant moderator
              </div>
              <form
                ref={
                  this.eventTraderFunctions["eventTrader_grantModerator"]
                    .formRef
                }
                className="box-fields"
              >
                <FormInput
                  label="Moderator address: "
                  name="moderatorAddress"
                  placeholder="address"
                />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "eventTrader_grantModerator"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Event Trader</b> - Revoke moderator
              </div>
              <form
                ref={
                  this.eventTraderFunctions["eventTrader_revokeModerator"]
                    .formRef
                }
                className="box-fields"
              >
                <FormInput
                  label="Moderator address: "
                  name="moderatorAddress"
                  placeholder="address"
                />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "eventTrader_revokeModerator"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Event Trader</b> - Grant role
              </div>
              <form
                ref={this.eventTraderFunctions["eventTrader_grantRole"].formRef}
                className="box-fields"
              >
                <FormInput label="Role: " name="role" placeholder="bytes32" />
                <FormInput
                  label="Account: "
                  name="account"
                  placeholder="address"
                />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "eventTrader_grantRole"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Event Trader</b> - Revoke Role
              </div>
              <form
                ref={
                  this.eventTraderFunctions["eventTrader_revokeRole"].formRef
                }
                className="box-fields"
              >
                <FormInput label="Role: " name="role" placeholder="bytes32" />
                <FormInput
                  label="Account: "
                  name="account"
                  placeholder="address"
                />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "eventTrader_revokeRole"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Event Trader</b> - Renounce Role
              </div>
              <form
                ref={
                  this.eventTraderFunctions["eventTrader_renounceRole"].formRef
                }
                className="box-fields"
              >
                <FormInput label="Role: " name="role" placeholder="bytes32" />
                <FormInput
                  label="Account: "
                  name="account"
                  placeholder="address"
                />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "eventTrader_renounceRole"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Event Trader</b> - Set collection tokens whitelisting
              </div>
              <form
                ref={
                  this.eventTraderFunctions[
                    "eventTrader_setCollectionTokensWhitelisting"
                  ].formRef
                }
                className="box-fields"
              >
                <FormInput
                  label="Nft contract address: "
                  name="nftContractAddress"
                  placeholder="address"
                />
                <FormInput
                  label="Token id: "
                  name="tokenId"
                  placeholder="numeric"
                />
                <FormSelect
                  label="Allowed to be sold: "
                  name="allowedToBeSold"
                  options={boolOptions}
                />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "eventTrader_setCollectionTokensWhitelisting"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Event Trader</b> - Set token prices
              </div>
              <form
                ref={
                  this.eventTraderFunctions["eventTrader_setTokenPrices"]
                    .formRef
                }
                className="box-fields"
              >
                <FormInput
                  label="Tokens price: "
                  name="tokensPrice"
                  placeholder="tuple[]"
                />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "eventTrader_setTokenPrices"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Event Trader</b> - Set token validation
              </div>
              <form
                ref={
                  this.eventTraderFunctions["eventTrader_setTokenValidation"]
                    .formRef
                }
                className="box-fields"
              >
                <FormInput
                  label="Used token id: "
                  name="usedTokenId"
                  placeholder="numeric"
                />
                <FormSelect
                  label="Valid: "
                  name="valid"
                  options={boolOptions}
                />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "eventTrader_setTokenValidation"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Event Trader</b> - Transfer collection ownership
              </div>
              <form
                ref={
                  this.eventTraderFunctions[
                    "eventTrader_transferCollectionOwnership"
                  ].formRef
                }
                className="box-fields"
              >
                <FormInput
                  label="Nft contract address: "
                  name="nftContractAddress"
                  placeholder="address"
                />
                <FormInput
                  label="Target addr: "
                  name="targetAddr"
                  placeholder="address"
                />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "transferCollectionOwnership"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Event Trader</b> - Get token price
              </div>
              <form
                ref={
                  this.eventTraderFunctions["eventTrader_getTokenPrice"].formRef
                }
                className="box-fields"
              >
                <FormInput
                  label="Nft contract address: "
                  name="nftContractAddress"
                  placeholder="address"
                />
                <FormSelect
                  label="Token type: "
                  name="tokenType"
                  options={tokenTypeOptions}
                />
                <FormInput
                  label="Token id: "
                  name="tokenId"
                  placeholder="numeric"
                />
                <div className="row">
                  <button
                    className="fetch-info-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "eventTrader_getTokenPrice"
                    )}
                  >
                    fetch
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Event Trader</b> - Collection tokens allowed for sale
              </div>
              <form
                ref={
                  this.eventTraderFunctions[
                    "eventTrader_collectionTokensAllowedForSale"
                  ].formRef
                }
                className="box-fields"
              >
                <FormInput
                  label="Nft contract address: "
                  name="nftContractAddress"
                  placeholder="address"
                />
                <FormInput
                  label="Token id: "
                  name="tokenId"
                  placeholder="numeric"
                />
                <div className="row">
                  <button
                    className="fetch-info-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "eventTrader_collectionTokensAllowedForSale"
                    )}
                  >
                    fetch
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Event Trader</b> - Get used token
              </div>
              <form
                ref={
                  this.eventTraderFunctions["eventTrader_getUsedToken"].formRef
                }
                className="box-fields"
              >
                <FormInput
                  label="Token id: "
                  name="tokenId"
                  placeholder="numeric"
                />
                <div className="row">
                  <button
                    className="fetch-info-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "eventTrader_getUsedToken"
                    )}
                  >
                    fetch
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Event Trader</b> - DEFAULT_ADMIN_ROLE
              </div>
              <form
                ref={
                  this.eventTraderFunctions["eventTrader_DEFAULT_ADMIN_ROLE"]
                    .formRef
                }
                className="box-fields"
              >
                <div className="row">
                  <button
                    className="fetch-info-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "eventTrader_DEFAULT_ADMIN_ROLE"
                    )}
                  >
                    fetch
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Event Trader</b> - MODERATOR_ROLE
              </div>
              <form
                ref={
                  this.eventTraderFunctions["eventTrader_MODERATOR_ROLE"]
                    .formRef
                }
                className="box-fields"
              >
                <div className="row">
                  <button
                    className="fetch-info-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "eventTrader_MODERATOR_ROLE"
                    )}
                  >
                    fetch
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Event Trader</b> - Has role
              </div>
              <form
                ref={this.eventTraderFunctions["eventTrader_hasRole"].formRef}
                className="box-fields"
              >
                <FormInput label="Role: " name="role" placeholder="bytes32" />
                <FormInput
                  label="Account: "
                  name="account"
                  placeholder="address"
                />
                <div className="row">
                  <button
                    className="fetch-info-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "eventTrader_hasRole"
                    )}
                  >
                    fetch
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Goods Token</b> - Burn
              </div>
              <form
                ref={this.eventTraderFunctions["goodsToken_burn"].formRef}
                className="box-fields"
              >
                <FormInput
                  label="Account: "
                  name="account"
                  placeholder="address"
                />
                <FormInput label="Id: " name="id" placeholder="numeric" />
                <FormInput label="Value: " name="value" placeholder="numeric" />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "goodsToken_burn"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Goods Token</b> - Safe transfer from
              </div>
              <form
                ref={
                  this.eventTraderFunctions["goodsToken_safeTransferFrom"]
                    .formRef
                }
                className="box-fields"
              >
                <FormInput label="From: " name="from" placeholder="address" />
                <FormInput label="To: " name="to" placeholder="address" />
                <FormInput label="Id: " name="id" placeholder="numeric" />
                <FormInput
                  label="Amount: "
                  name="amount"
                  placeholder="numeric"
                />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "goodsToken_safeTransferFrom"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Goods Token</b> - Set approval for all
              </div>
              <form
                ref={
                  this.eventTraderFunctions["goodsToken_setApprovalForAll"]
                    .formRef
                }
                className="box-fields"
              >
                <FormInput
                  label="Operator: "
                  name="operator"
                  placeholder="address"
                />
                <FormSelect
                  label="Approved: "
                  name="approved"
                  options={boolOptions}
                />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "goodsToken_setApprovalForAll"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Goods Token</b> - Set URI
              </div>
              <form
                ref={this.eventTraderFunctions["goodsToken_setURI"].formRef}
                className="box-fields"
              >
                <FormInput
                  label="New URI: "
                  name="newuri"
                  placeholder="string"
                />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "goodsToken_setURI"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Goods Token</b> - Transfer ownership
              </div>
              <form
                ref={
                  this.eventTraderFunctions["goodsToken_transferOwnership"]
                    .formRef
                }
                className="box-fields"
              >
                <FormInput
                  label="New owner: "
                  name="newOwner"
                  placeholder="address"
                />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "goodsToken_transferOwnership"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Goods Token</b> - Balance of
              </div>
              <form
                ref={this.eventTraderFunctions["goodsToken_balanceOf"].formRef}
                className="box-fields"
              >
                <FormInput
                  label="Account: "
                  name="account"
                  placeholder="address"
                />
                <FormInput label="Id: " name="id" placeholder="numeric" />
                <div className="row">
                  <button
                    className="fetch-info-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "goodsToken_balanceOf"
                    )}
                  >
                    fetch
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Goods Token</b> - URI
              </div>
              <form
                ref={this.eventTraderFunctions["goodToken_uri"].formRef}
                className="box-fields"
              >
                <FormInput
                  label="Token id: "
                  name="tokenId"
                  placeholder="numeric"
                />
                <div className="row">
                  <button
                    className="fetch-info-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(this, "goodToken_uri")}
                  >
                    fetch
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Ticket Token</b> - Approve
              </div>
              <form
                ref={this.eventTraderFunctions["ticketToken_approve"].formRef}
                className="box-fields"
              >
                <FormInput label="To: " name="to" placeholder="address" />
                <FormInput
                  label="Token id: "
                  name="tokenId"
                  placeholder="numeric"
                />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "ticketToken_approve"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <div className="box-title">
                  <b>Ticket Token</b> - Burn
                </div>
              </div>
              <form
                ref={this.eventTraderFunctions["ticketToken_burn"].formRef}
                className="box-fields"
              >
                <FormInput
                  label="Token id: "
                  name="tokenId"
                  placeholder="numeric"
                />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "ticketToken_burn"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Ticket Token</b> - Transfer from
              </div>
              <form
                ref={
                  this.eventTraderFunctions["ticketToken_transferFrom"].formRef
                }
                className="box-fields"
              >
                <FormInput label="From: " name="from" placeholder="address" />
                <FormInput label="To: " name="to" placeholder="address" />
                <FormInput
                  label="Token id: "
                  name="tokenId"
                  placeholder="numeric"
                />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "ticketToken_transferFrom"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Ticket Token</b> - Transfer ownership
              </div>
              <form
                ref={
                  this.eventTraderFunctions["ticketToken_transferOwnership"]
                    .formRef
                }
                className="box-fields"
              >
                <FormInput
                  label="New owner: "
                  name="newOwner"
                  placeholder="address"
                />
                <div className="row button-row">
                  <button
                    className="transact-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "ticketToken_transferOwnership"
                    )}
                  >
                    transact
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Ticket Token</b> - Balance of
              </div>
              <form
                ref={this.eventTraderFunctions["ticketToken_balanceOf"].formRef}
                className="box-fields"
              >
                <FormInput label="Owner: " name="owner" placeholder="address" />
                <div className="row">
                  <button
                    className="fetch-info-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "ticketToken_balanceOf"
                    )}
                  >
                    fetch
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Ticket Token</b> - Token URI
              </div>
              <form
                ref={this.eventTraderFunctions["ticketToken_tokenURI"].formRef}
                className="box-fields"
              >
                <div className="row">
                  <button
                    className="fetch-info-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "ticketToken_tokenURI"
                    )}
                  >
                    fetch
                  </button>
                </div>
              </form>
            </div>
            <div className="box">
              <div className="box-title">
                <b>Ticket Token</b> - Owner of
              </div>
              <form
                ref={this.eventTraderFunctions["ticketToken_ownerOf"].formRef}
                className="box-fields"
              >
                <FormInput
                  label="Token id: "
                  name="tokenId"
                  placeholder="numeric"
                />
                <div className="row">
                  <button
                    className="fetch-info-btn"
                    type="button"
                    onClick={this.handleTransaction.bind(
                      this,
                      "ticketToken_ownerOf"
                    )}
                  >
                    fetch
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    );
  }
}

export default App;
