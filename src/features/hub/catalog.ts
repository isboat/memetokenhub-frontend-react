export interface DirectoryItem {
  name: string;
  description: string;
  url?: string;
  category: string;
}
const networkRows = [
  [
    "Robinhood",
    "Robinhood Chain",
    "A network associated with Robinhood’s on-chain finance plans. Confirm current availability, chain identity and official launch details before using it.",
    "https://robinhood.com",
  ],
  [
    "Solana",
    "Layer 1",
    "Introduced by Anatoly Yakovenko, Solana combines proof of history with proof of stake. Its fast, low-cost ecosystem became a gathering place for NFT and meme-token communities.",
    "https://solana.com",
  ],
  [
    "BSC",
    "Layer 1",
    "BNB Smart Chain grew from the Binance ecosystem with EVM compatibility and inexpensive transactions. PancakeSwap and retail token communities helped shape its identity.",
    "https://www.bnbchain.org",
  ],
  [
    "Base",
    "Ethereum L2",
    "Incubated by Coinbase and built with the OP Stack, Base aims to bring more people on-chain. Consumer apps, creators and meme communities are part of its culture.",
    "https://base.org",
  ],
  [
    "Ethereum",
    "Layer 1",
    "Proposed by Vitalik Buterin and launched in 2015, Ethereum popularized programmable smart contracts. Its open developer culture underpins DeFi, NFTs and many scaling networks.",
    "https://ethereum.org",
  ],
  [
    "Polygon",
    "Ethereum scaling",
    "Originally Matic Network, Polygon grew around accessible Ethereum-compatible applications. Its ecosystem includes a proof-of-stake chain and several scaling technologies.",
    "https://polygon.technology",
  ],
  [
    "PulseChain",
    "Layer 1",
    "An Ethereum-derived network launched by Richard Heart, PulseChain built its community around a copied Ethereum state and a distinct native economy.",
    "https://pulsechain.com",
  ],
  [
    "HyperEVM",
    "EVM environment",
    "The EVM execution environment in the Hyperliquid ecosystem connects general-purpose smart contracts with its trading-focused infrastructure.",
    "https://hyperliquid.xyz",
  ],
  [
    "TON",
    "Layer 1",
    "The Open Network traces its origins to Telegram’s original blockchain project and subsequent community development. Messaging, mini apps and consumer payments shape its story.",
    "https://ton.org",
  ],
  [
    "Arbitrum",
    "Ethereum L2",
    "Developed by Offchain Labs, Arbitrum scales Ethereum using optimistic rollups. Its community grew through DeFi applications, governance and app-specific chains.",
    "https://arbitrum.io",
  ],
  [
    "Ink",
    "Ethereum L2",
    "Ink was introduced by Kraken using the OP Stack, with an emphasis on on-chain financial applications and connections to the broader Ethereum ecosystem.",
    "https://inkonchain.com",
  ],
  [
    "Cronos",
    "EVM ecosystem",
    "Cronos grew alongside Crypto.com, combining EVM applications with the broader Cosmos ecosystem. Its community includes payments, DeFi and gaming projects.",
    "https://cronos.org",
  ],
  [
    "Sui",
    "Layer 1",
    "Created by Mysten Labs, Sui uses the Move language and an object-centered model. Its story emphasizes parallel execution and consumer-friendly on-chain assets.",
    "https://sui.io",
  ],
  [
    "Avalanche",
    "Layer 1",
    "Developed by Ava Labs, Avalanche combines its own consensus design with customizable networks. The EVM-compatible C-Chain became a center for its DeFi community.",
    "https://avax.network",
  ],
  [
    "XRPL",
    "Layer 1",
    "The XRP Ledger launched in 2012 with payments and an integrated decentralized exchange at its core. Its long-running community focuses on value transfer and issued assets.",
    "https://xrpl.org",
  ],
  [
    "Stable",
    "Identity to confirm",
    "This name can refer to different stablecoin-oriented networks or projects. A listing needs an official website, chain identifier and project-provided history before an identity can be confirmed.",
  ],
  [
    "Hyperliquid",
    "Layer 1",
    "Hyperliquid grew around an on-chain perpetuals exchange and its own execution infrastructure. Its trading community and HyperEVM are closely connected but distinct concepts.",
    "https://hyperliquid.xyz",
  ],
  [
    "Monad",
    "Layer 1",
    "Monad’s origin story centers on parallel execution while retaining EVM compatibility. Its community formed around performance engineering and a recognizable meme culture.",
    "https://monad.xyz",
  ],
  [
    "Abstract",
    "Ethereum L2",
    "Abstract is a ZK-based Ethereum scaling project associated with Igloo. Its identity focuses on consumer crypto, entertainment and approachable applications.",
    "https://abs.xyz",
  ],
  [
    "Tron",
    "Layer 1",
    "Founded by Justin Sun, Tron began with a vision for decentralized digital content. Stablecoin transfers and accessible applications became central parts of its ecosystem.",
    "https://tron.network",
  ],
  [
    "World Chain",
    "Ethereum L2",
    "World Chain is built using the OP Stack and connected to the World ecosystem. Its stated focus is applications for humans and access through World’s identity infrastructure.",
    "https://world.org/world-chain",
  ],
  [
    "Sonic",
    "Layer 1",
    "Sonic emerged from the team behind Fantom with a new network and performance-focused identity. Its migration story is distinct from the original Fantom Opera chain.",
    "https://soniclabs.com",
  ],
  [
    "Mantle",
    "Ethereum L2",
    "Mantle grew out of the BitDAO community with a modular approach to Ethereum scaling. Its ecosystem connects governance, treasury resources and DeFi applications.",
    "https://mantle.xyz",
  ],
  [
    "NEAR",
    "Layer 1",
    "Co-founded by Illia Polosukhin and Alexander Skidanov, NEAR emphasizes usability, sharding and readable accounts. Its developer story also connects to AI and chain abstraction.",
    "https://near.org",
  ],
  [
    "Hedera",
    "Distributed ledger",
    "Hedera uses hashgraph consensus rather than a conventional block chain. Its identity includes a governing council and applications for enterprise and public users.",
    "https://hedera.com",
  ],
  [
    "MultiversX",
    "Layer 1",
    "Originally Elrond, MultiversX adopted a new name as it broadened its application ecosystem. Adaptive sharding and the EGLD community remain part of its origin story.",
    "https://multiversx.com",
  ],
  [
    "Optimism",
    "Ethereum L2",
    "Optimism helped develop optimistic Ethereum scaling and the OP Stack. Its community narrative connects public goods funding, collective governance and the Superchain.",
    "https://optimism.io",
  ],
  [
    "Plasma",
    "Payments network",
    "Plasma is a project centered on stablecoin payments. The name is also used for an older Ethereum scaling design; confirm the intended network through its official documentation.",
    "https://plasma.to",
  ],
  [
    "Linea",
    "Ethereum L2",
    "Developed by Consensys, Linea uses zero-knowledge technology to scale Ethereum-compatible applications. Its story draws on the wider Ethereum developer ecosystem.",
    "https://linea.build",
  ],
  [
    "Berachain",
    "Layer 1",
    "Berachain grew from an NFT community and a playful bear-themed culture. Its proof-of-liquidity design connects the network’s security incentives with ecosystem liquidity.",
    "https://berachain.com",
  ],
  [
    "MegaETH",
    "Ethereum scaling",
    "MegaETH centers its identity on real-time, high-throughput Ethereum applications. Confirm current deployment details and supported environments in its official documentation.",
    "https://megaeth.com",
  ],
  [
    "Sei V2",
    "Layer 1",
    "Sei began with a trading-oriented focus. Its V2 evolution introduced parallelized EVM execution as part of a broader move toward general-purpose applications.",
    "https://sei.io",
  ],
  [
    "zkSync",
    "Ethereum L2",
    "Developed by Matter Labs, ZKsync uses validity proofs to scale Ethereum. Its ecosystem narrative includes account abstraction and interoperable ZK-based chains.",
    "https://zksync.io",
  ],
  [
    "ICP",
    "Layer 1",
    "The Internet Computer was developed by the DFINITY ecosystem to host applications through canister smart contracts. Its story centers on decentralized compute and web services.",
    "https://internetcomputer.org",
  ],
  [
    "Starknet",
    "Ethereum L2",
    "Starknet grew out of StarkWare’s work on STARK proofs. Its Cairo language and validity-rollup architecture give it a distinct developer community.",
    "https://starknet.io",
  ],
  [
    "Fantom",
    "Layer 1",
    "Fantom Opera built an EVM-compatible DeFi community around its consensus technology. It is historically related to Sonic, but network identifiers and assets should not be treated as interchangeable.",
    "https://fantom.foundation",
  ],
  [
    "Unichain",
    "Ethereum L2",
    "Introduced by Uniswap Labs, Unichain uses the OP Stack with a DeFi-oriented design. It reflects the Uniswap ecosystem’s expansion into scaling infrastructure.",
    "https://unichain.org",
  ],
  [
    "Algorand",
    "Layer 1",
    "Founded by cryptographer Silvio Micali, Algorand uses pure proof of stake. Its story emphasizes accessible participation, payments and application development.",
    "https://algorand.co",
  ],
  [
    "Flare",
    "Layer 1",
    "Flare combines EVM execution with protocols for acquiring external data. Its community story includes bridges between smart contracts and assets from other ecosystems.",
    "https://flare.network",
  ],
  [
    "Aptos",
    "Layer 1",
    "Aptos was created by developers with experience on Meta’s Diem project. It uses Move and emphasizes scalable execution and consumer applications.",
    "https://aptosfoundation.org",
  ],
  [
    "Flow EVM",
    "EVM environment",
    "Flow was developed by Dapper Labs after its early NFT work. Flow EVM brings Ethereum-compatible applications into an ecosystem known for consumer collectibles.",
    "https://flow.com",
  ],
  [
    "Stacks",
    "Bitcoin ecosystem",
    "Stacks began as Blockstack and evolved toward smart contracts connected to Bitcoin. Its Clarity language and Bitcoin-oriented community distinguish its application model.",
    "https://stacks.co",
  ],
  [
    "Blast",
    "Ethereum L2",
    "Blast emerged from the team associated with Blur. Its initial community narrative centered on native yield, applications and incentives within an Ethereum scaling network.",
    "https://blast.io",
  ],
  [
    "ApeChain",
    "Layer 3",
    "ApeChain grew from the ApeCoin ecosystem using Arbitrum technology. Its identity connects gaming, NFTs and the broader Ape community.",
    "https://apechain.com",
  ],
  [
    "Cardano",
    "Layer 1",
    "Founded by Charles Hoskinson, Cardano developed around peer-reviewed research and proof of stake. Its community includes staking, native assets and extended-UTXO applications.",
    "https://cardano.org",
  ],
  [
    "Injective",
    "Layer 1",
    "Injective grew within the Cosmos ecosystem with a focus on financial applications. Exchange infrastructure and interoperability are central to its community narrative.",
    "https://injective.com",
  ],
  [
    "Metis",
    "Ethereum L2",
    "Metis is an Ethereum scaling ecosystem with roots in optimistic rollups. Its narrative emphasizes decentralized infrastructure and communities building on-chain businesses.",
    "https://metis.io",
  ],
  [
    "Soneium",
    "Ethereum L2",
    "Soneium was introduced by Sony Block Solutions Labs using the OP Stack. Its story links Ethereum scaling with entertainment, creators and consumer applications.",
    "https://soneium.org",
  ],
  [
    "Celo",
    "Ethereum ecosystem",
    "Celo began as a mobile-first blockchain focused on payments and financial inclusion, later pursuing Ethereum L2 alignment. Its history includes stable assets and real-world use cases.",
    "https://celo.org",
  ],
  [
    "opBNB",
    "BNB scaling",
    "opBNB uses OP Stack technology to scale the BNB ecosystem. It aims to support applications needing inexpensive, frequent transactions.",
    "https://www.bnbchain.org/en/opbnb",
  ],
  [
    "Beam",
    "Gaming ecosystem",
    "The gaming-focused Beam ecosystem grew from Merit Circle. Other projects also use the name Beam, so confirm chain identity before transferring assets.",
    "https://onbeam.com",
  ],
  [
    "Katana",
    "Ethereum L2",
    "Katana is associated with the Polygon and Agglayer ecosystem and a DeFi-oriented design. Check official documentation for chain identity and current availability.",
    "https://katana.network",
  ],
  [
    "Conflux",
    "Layer 1",
    "Conflux originated in academic research and combines its Tree-Graph architecture with EVM-compatible execution through eSpace. Its ecosystem has strong roots in Asia.",
    "https://confluxnetwork.org",
  ],
  [
    "Manta",
    "Ethereum scaling",
    "Manta’s ecosystem includes Manta Pacific and earlier privacy-oriented work. Distinguish its execution environments and network identifiers when exploring its history.",
    "https://manta.network",
  ],
  [
    "Harmony",
    "Layer 1",
    "Harmony built its identity around sharding and inexpensive EVM transactions. Its ecosystem history includes cross-chain applications and significant bridge-security challenges.",
    "https://harmony.one",
  ],
  [
    "Kava",
    "Layer 1",
    "Kava connects Cosmos-based infrastructure with EVM applications. Its origins in collateralized lending helped shape a DeFi-focused community.",
    "https://kava.io",
  ],
  [
    "Scroll",
    "Ethereum L2",
    "Scroll grew from research into an Ethereum-compatible zero-knowledge rollup. Its story emphasizes Ethereum alignment and open technical collaboration.",
    "https://scroll.io",
  ],
  [
    "Story",
    "Layer 1",
    "Story is designed around programmable intellectual property. Its community narrative connects creators, licensing and infrastructure for IP-based applications.",
    "https://story.foundation",
  ],
  [
    "Fogo",
    "Layer 1",
    "Fogo is an SVM-oriented network with a focus on low-latency execution and trading applications. Confirm current network status and deployment details through official sources.",
    "https://fogo.io",
  ],
  [
    "Fuse",
    "Payments network",
    "Fuse grew around accessible blockchain payments and business adoption. Its ecosystem focuses on making on-chain transactions usable in everyday applications.",
    "https://fuse.io",
  ],
  [
    "Merlin Chain",
    "Bitcoin ecosystem",
    "Merlin Chain emerged as a Bitcoin-oriented scaling project. Its narrative connects Bitcoin assets with smart-contract applications and cross-chain infrastructure.",
    "https://merlinchain.io",
  ],
  [
    "Telos",
    "EVM ecosystem",
    "Telos began with roots in EOSIO technology and later added EVM execution. Its story includes community governance and accessible application development.",
    "https://telos.net",
  ],
  [
    "Vana",
    "Data network",
    "Vana focuses on user-owned data and data collectives. Its community narrative connects data contribution, ownership and applications involving AI.",
    "https://vana.org",
  ],
  [
    "Moonriver",
    "Kusama ecosystem",
    "Moonriver is Moonbeam’s companion network in the Kusama ecosystem. It combines EVM compatibility with a community and deployment environment distinct from Moonbeam.",
    "https://moonbeam.network",
  ],
  [
    "Movement",
    "Move ecosystem",
    "Movement brings Move-based execution into a broader blockchain infrastructure ecosystem. Its story centers on Move tooling and application development; consult official docs for network specifics.",
    "https://movementnetwork.xyz",
  ],
  [
    "Venom",
    "Layer 1",
    "Venom’s architecture draws on TVM-style execution and dynamic sharding. Its ecosystem narrative emphasizes scalable infrastructure and financial applications.",
    "https://venom.network",
  ],
  [
    "Oasis Sapphire",
    "Confidential EVM",
    "Sapphire is the confidential EVM environment in the Oasis ecosystem. Its story centers on privacy-aware applications and protected smart-contract computation.",
    "https://oasis.net",
  ],
  [
    "Polkadot",
    "Multichain ecosystem",
    "Founded by Gavin Wood, Polkadot connects specialized chains through shared infrastructure. Its community grew around interoperability, governance and Substrate development.",
    "https://polkadot.com",
  ],
  [
    "Taiko",
    "Ethereum L2",
    "Taiko develops Ethereum scaling with an emphasis on Ethereum equivalence and based rollup designs. Its narrative highlights permissionless participation and Ethereum alignment.",
    "https://taiko.xyz",
  ],
  [
    "ZKFair",
    "Ethereum L2",
    "ZKFair emerged with a community-oriented launch narrative and zero-knowledge scaling technology. Check current official documentation before relying on its network details.",
    "https://zkfair.io",
  ],
  [
    "Neon EVM",
    "EVM environment",
    "Neon EVM brings Ethereum-compatible execution to Solana. Its origin story is the connection between Ethereum tooling and Solana’s transaction infrastructure.",
    "https://neonevm.org",
  ],
  [
    "Step Network",
    "Fitness ecosystem",
    "Step Network is associated with the Step App fitness ecosystem. Its story connects activity-based applications with EVM-compatible infrastructure.",
    "https://step.network",
  ],
  [
    "Mode",
    "Ethereum L2",
    "Mode uses OP Stack technology with a DeFi-oriented ecosystem. Its story centers on application growth and incentives within the wider Superchain.",
    "https://mode.network",
  ],
] as const;
export const networkDirectory: DirectoryItem[] = networkRows.map(
  ([name, category, description, url]) => ({
    name,
    category,
    description,
    url,
  }),
);
export const launchpadDirectory: DirectoryItem[] = [
  {
    name: "pump.fun",
    category: "Solana",
    description:
      "A token creation and launch platform associated with Solana meme-token communities. Review current launch mechanics, fees and eligibility on its website.",
    url: "https://pump.fun",
  },
  {
    name: "Raydium LaunchLab",
    category: "Solana",
    description:
      "Raydium’s token launch infrastructure, connecting launches with its Solana liquidity ecosystem.",
    url: "https://raydium.io",
  },
  {
    name: "PinkSale",
    category: "Multichain",
    description:
      "A platform for token presales and fair launches across supported networks. Terms and contract risks vary by project.",
    url: "https://www.pinksale.finance",
  },
  {
    name: "Four.meme",
    category: "BSC",
    description:
      "A meme-token launch platform within the BNB Chain ecosystem. Check its official site for current supported networks and rules.",
    url: "https://four.meme",
  },
  {
    name: "Clanker",
    category: "Base",
    description:
      "Token creation tooling associated with the Base and Farcaster ecosystems. Review current contracts and supported launch flows.",
    url: "https://www.clanker.world",
  },
  {
    name: "PONS",
    category: "Project supplied · identity unconfirmed",
    description:
      "Named in the PEPEASTEROID promo example. An official URL, supported network and launch details have not been confirmed; no launch link is provided.",
  },
];
export const exchangeDirectory: DirectoryItem[] = [
  {
    name: "Uniswap",
    category: "Decentralized",
    description:
      "An automated market maker protocol that began on Ethereum and expanded across multiple networks. Anyone can create pools; a pool is not an endorsement.",
    url: "https://app.uniswap.org",
  },
  {
    name: "Raydium",
    category: "Decentralized",
    description:
      "A Solana exchange ecosystem offering liquidity pools and token trading tools.",
    url: "https://raydium.io",
  },
  {
    name: "PancakeSwap",
    category: "Decentralized",
    description:
      "An exchange ecosystem that grew on BNB Smart Chain and expanded to other networks.",
    url: "https://pancakeswap.finance",
  },
  {
    name: "Aerodrome",
    category: "Decentralized",
    description:
      "A Base liquidity and exchange protocol with token-incentivized pools.",
    url: "https://aerodrome.finance",
  },
  {
    name: "Jupiter",
    category: "Aggregator",
    description:
      "A Solana trading aggregator that routes swaps across liquidity sources. It is distinct from the underlying exchanges it uses.",
    url: "https://jup.ag",
  },
  {
    name: "Coinbase",
    category: "Centralized",
    description:
      "A custodial cryptocurrency exchange founded in 2012. Asset access and services depend on jurisdiction and account eligibility.",
    url: "https://www.coinbase.com",
  },
  {
    name: "Kraken",
    category: "Centralized",
    description:
      "A cryptocurrency exchange founded in 2011, offering custodial trading services subject to regional availability.",
    url: "https://www.kraken.com",
  },
  {
    name: "Binance",
    category: "Centralized",
    description:
      "A global exchange ecosystem founded in 2017. Availability, legal entities and supported products differ by location.",
    url: "https://www.binance.com",
  },
];
