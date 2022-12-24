// SPDX-License-Identifier: LicenseRef-EventTrader
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract TicketToken is ERC721, ERC721Burnable, Ownable {
    string private _uri;

    constructor(string memory tokenUri) ERC721("TicketToken", "TTK") {
        _uri = tokenUri;
    }

    function tokenURI(uint256) public view override returns (string memory) {
        return _uri;
    }

    function setURI(string memory newuri) public onlyOwner {
        _uri = newuri;
    }

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
}
