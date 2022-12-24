// SPDX-License-Identifier: LicenseRef-EventTrader
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

contract GoodsToken is ERC1155, ERC1155Burnable, Ownable {
    string private _uri;

    constructor(string memory tokenUri) ERC1155(tokenUri) {
        _uri = tokenUri;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return (bytes(_uri).length > 0 ? string(abi.encodePacked(_uri, Strings.toString(tokenId), ".json")) : "");
    }

    function setURI(string memory newuri) public onlyOwner {
        _uri = newuri;
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyOwner {
        _mint(account, id, amount, data);
    }
}
