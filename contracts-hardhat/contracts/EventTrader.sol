// SPDX-License-Identifier: LicenseRef-EventTrader
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface IERCOwnable {
    function owner() external view returns (address);

    function transferOwnership(address newOwner) external;
}

interface IERC721MintableBurnable {
    function safeMint(address to, uint256 tokenId) external;

    function burn(uint256 tokenId) external;
}

interface IERC1155MintableBurnable {
    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external;

    function burn(
        address account,
        uint256 id,
        uint256 value
    ) external;
}

contract EventTrader is AccessControl {
    // Role #1, the default DEFAULT_ADMIN_ROLE can to anything, but most importantly, assign roles and manage collection ownership
    // Role #2, the MODERATOR cannot manage roles, but can set validation of the tokens
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

    using Counters for Counters.Counter;

    enum TokenType {
        E721,
        E1155
    }

    struct Token {
        address owner;
        address validateUser;
        TokenType tokenType;
        address nftContractAddress;
        uint256 tokenId;
        uint256 amount;
        uint256 date;
        bool valid;
    }

    struct TokenPrice {
        address tokenAddr;
        uint256 tokenId;
        uint256 price;
    }

    event CollectionTokensWhitelistingSet(address contractAddress, uint256 tokenId, bool allowedToBeSold, address performerAddress);

    event TokenPricesSet(TokenPrice[] tokensPrice);

    event TokenUsed(
        address owner,
        address validateUser,
        TokenType tokenType,
        address nftContractAddress,
        uint256 tokenId,
        uint256 amount,
        uint256 date,
        bool valid
    );

    event FundsClaimed(address receiver, uint256 amount);

    // NftAddr => (tokenId => isAllowed)
    mapping(address => mapping(uint256 => bool)) public collectionTokensAllowedForSale;
    // NftAddr => (tokenId => price)
    mapping(address => mapping(uint256 => uint256)) private _tokenPrices;
    mapping(uint256 => Token) private _usedTokens;

    Counters.Counter private _usedTokensCounter;

    address private _goodsAddr;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function grantModerator(address moderatorAddress) public {
        grantRole(MODERATOR_ROLE, moderatorAddress);
    }

    function revokeModerator(address moderatorAddress) public {
        revokeRole(MODERATOR_ROLE, moderatorAddress);
    }

    // For all tokedId allowedToBeSold specifies separately, but for TicketToken tokenId is always 0.
    function setCollectionTokensWhitelisting(
        address nftContractAddress,
        uint256 tokenId,
        bool allowedToBeSold
    ) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only contract admin can whitelist NFT contracts");

        collectionTokensAllowedForSale[nftContractAddress][tokenId] = allowedToBeSold;

        emit CollectionTokensWhitelistingSet(nftContractAddress, tokenId, allowedToBeSold, msg.sender);
    }

    function setTokenPrices(TokenPrice[] calldata tokensPrice) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only contract admin can set token prices");

        for (uint256 i = 0; i < tokensPrice.length; i++) {
            TokenPrice calldata token = tokensPrice[i];

            require(IERCOwnable(token.tokenAddr).owner() == address(this), "EventTrader does not own specified collections");

            _tokenPrices[token.tokenAddr][token.tokenId] = token.price;

            setCollectionTokensWhitelisting(token.tokenAddr, token.tokenId, true);
        }

        emit TokenPricesSet(tokensPrice);
    }

    function buyToken(
        address nftContractAddress,
        TokenType tokenType,
        uint256 tokenId,
        uint256 amount
    ) public payable {
        if (tokenType == TokenType.E721) {
            require(collectionTokensAllowedForSale[nftContractAddress][0], "Specified NFT contract is not whitelisted to be bought");
            require(_tokenPrices[nftContractAddress][0] == msg.value, "Token price is different");
            require(amount == 1, "Only one token is possible to buy per transaction");

            IERC721MintableBurnable(nftContractAddress).safeMint(msg.sender, tokenId);
        }

        if (tokenType == TokenType.E1155) {
            require(collectionTokensAllowedForSale[nftContractAddress][tokenId], "Specified NFT contract is not whitelisted to be bought");
            require(_tokenPrices[nftContractAddress][tokenId] == msg.value, "Token price is different");

            IERC1155MintableBurnable(nftContractAddress).mint(msg.sender, tokenId, amount, "");
        }
    }

    function useToken(
        address validateUser,
        address nftContractAddress,
        TokenType tokenType,
        uint256 tokenId,
        uint256 amount
    ) public {
        require(
            validateUser != address(0) && validateUser != 0x000000000000000000000000000000000000dEaD,
            "Validation user can not be null address"
        );

        if (tokenType == TokenType.E721) {
            require(collectionTokensAllowedForSale[nftContractAddress][0], "Specified NFT contract is not allowed to be used");
            require(amount == 1, "Only one token is possible to use per transaction");
            require(IERC721(nftContractAddress).ownerOf(tokenId) == msg.sender, "User is not the owner of specified ERC721 token");
            require(
                IERC721(nftContractAddress).getApproved(tokenId) == address(this) ||
                    IERC721(nftContractAddress).isApprovedForAll(msg.sender, address(this)),
                "Specified token id has not approval to EventTrader"
            );

            IERC721MintableBurnable(nftContractAddress).burn(tokenId);
        }

        if (tokenType == TokenType.E1155) {
            require(collectionTokensAllowedForSale[nftContractAddress][tokenId], "Specified NFT contract is not allowed to be used");
            require(
                IERC1155(nftContractAddress).balanceOf(msg.sender, tokenId) >= amount,
                "User does not have specified amount of tokens at tokenId to be sold"
            );
            require(
                IERC1155(nftContractAddress).isApprovedForAll(msg.sender, address(this)),
                "Tokens to be used are not approved to EventTrader"
            );

            IERC1155MintableBurnable(nftContractAddress).burn(msg.sender, tokenId, amount);
        }

        uint256 usedTokenId = _usedTokensCounter.current();

        _usedTokens[usedTokenId] = Token({
            owner: msg.sender,
            validateUser: validateUser,
            tokenType: tokenType,
            nftContractAddress: nftContractAddress,
            tokenId: tokenId,
            amount: amount,
            date: block.timestamp,
            valid: true
        });

        _usedTokensCounter.increment();

        emit TokenUsed(msg.sender, validateUser, tokenType, nftContractAddress, tokenId, amount, block.timestamp, true);
    }

    function setTokenValidation(uint256 usedTokenId, bool valid) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(MODERATOR_ROLE, msg.sender),
            "Only contract admin or moderator can set user token validity"
        );

        uint256 currentUsedTokenId = _usedTokensCounter.current();

        require(currentUsedTokenId >= usedTokenId, "usedTokenId does not exist");

        _usedTokens[usedTokenId].valid = valid;
    }

    function claimFunds() public onlyRole(DEFAULT_ADMIN_ROLE) {
        address eventTraderAddr = address(this);
        address payable adminAddr = payable(msg.sender);

        emit FundsClaimed(adminAddr, eventTraderAddr.balance);
        adminAddr.transfer(eventTraderAddr.balance);
    }

    function transferCollectionOwnership(address nftContractAddress, address targetAddr) public onlyRole(DEFAULT_ADMIN_ROLE) {
        IERCOwnable(nftContractAddress).transferOwnership(targetAddr);
    }

    function getTokenPrice(
        address nftContractAddress,
        TokenType tokenType,
        uint256 tokenId
    ) public view returns (uint256) {
        if (tokenType == TokenType.E721) {
            require(collectionTokensAllowedForSale[nftContractAddress][0], "Specified NFT contract is not whitelisted to be bought");

            return _tokenPrices[nftContractAddress][0];
        }

        if (tokenType == TokenType.E1155) {
            require(collectionTokensAllowedForSale[nftContractAddress][tokenId], "Specified NFT contract is not whitelisted to be bought");

            return _tokenPrices[nftContractAddress][tokenId];
        }

        return 0;
    }

    function getUsedToken(uint256 tokenId) public view returns (Token memory) {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(MODERATOR_ROLE, msg.sender),
            "Only contract admin or moderator can get used token"
        );

        return _usedTokens[tokenId];
    }
}
