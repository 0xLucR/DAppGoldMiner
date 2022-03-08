# DAppGoldMiner
 Gold Miner - Projeto NFT Farm

## Objetivos do projeto
- Esse projeto tem como objetivo o aperfeiçoamento de criação de "smart contracts" em linguagem "solidity", usando o ambiente de desenvolvimento "HARDHAT" com "Typescript" para execução dos testes. 
- Para manter o padrão de seguranã dos "smart contracts", foi usado o "OpenZeppelin", que é uma biblioteca para desenolvimento seguro de contratos inteligentes.
- O porjeto D'aap deverá permitir executar as seguintes ações em seguencia:
     - Clamar Tokens grátis (Padrão ERC20);
     - Usar os Tokens para mintar NFT (Padrão ERC721);
     - Usar os NFT para obter tokens como recompensa (Stake)

## Dependencies
- .Net 6.0 
- Ganache
- MetaMask

## Frontend
- Blazor WebAssembly "dotnet new blazorwasm -o goldMiner" para criar a estrutura de front-end.
    - Blazor Wasm permite Interoperabilidade C#/JavaScript.
- Personalização com Bootstrap.

## Blockchain
- Baseado em ambiente ethereum usando ferramentas e bibliotecas como:
    - Hardhat
      - Hardhat é uma boa opção para "Solidity debugging"
    - Hardhat Network
      - A Hardhat Network é uma rede local Ethereum projetada para desenvolvimento
    - Web3js;
    - Ethers.js;
    - Ganache;
    - VSCode
    - Remix IDE

## Contract 1 - Token.sol
- Token ERC20.
    - "Gold miner token - GMT".
- Smart Contract responsável pelo controle do Token.
 
## Contract 2 - TokenClaim.sol
- Smart Contract responsável pelo claim de tokens GMT. Para clamar os tokens, o balance deve está zerado..

## Contract 3 - MinerNFT.sol
- Token ERC721.
    - "Gold miner NFT".
- Smart Contract responsável por emitir e armazenar os NFTs.
- Segundo regra implementada de Acesso de controle no Smart Contract, para mintar um NFT o emissor tem que está habilitado.
- Os NFT mintado possuem 4 tipos de Classe: A,B,C e D. A chances para cada uma das classes são:
    - Classe A: 10% Zander;
    - Classe B: 15% EthBruceenia;
    - Classe C: 25% Rock;
    - Classe D: 50% Marty.

## Contract 4 - MinerNFTGenerate.sol
- Smart Contract responsável por verificar se o usuário(endereço) está hábil para mintar um NFT, e estando hábil faz uma chamada para o contrato MinerNFT.sol dando continuidade no processo.
- Para está hábil a mintar um NFT, o usuário precisa ter Tokens GMT em seu balanço e também precisa ter dado a permissão para o endereço do Smart Contract utilizar esses Tokens GMT.

## Contract 5- NFTFarm.sol
- Smart Contract onde a mágica acontece rsrs... SC responsável pelo controle do Farm.
- As recompensa são caluladas baseada em 2 parametros:
    - 1º -> Tokens por Blocos
    - 2º -> Quantidade de Tokens por Blocos depende da 'classe do  NFT' que vai de "A à D"
- Permite executar as seguintes ações:
    - Colocar NFTs em stake (DEPOSIT);
      - Em vez de enviar o NFT para um smart contract, optei por criar uma flag em sua struct sinalizando se o NFT está ou não minerando/farmando
        - Não é possível tranferir NFTs que estão minerando/farmando
    - Retirar NFTs do stake (WITHDRAW);
    - Clamar recompensas tokem GMT (HARVEST).

## References
- OpenZeppelin: https://openzeppelin.com/
- Referência de códigos solidity: https://github.com/OpenZeppelin
- IDE Remix: https://remix.ethereum.org/
