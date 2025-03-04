export interface ERC20Interface {
    name: string,
    symbol: string,
    address: `0x${string}`
}

export interface FraxlendMarket {
    helperAddress: `0x${string}`,
    pairAddress: `0x${string}`,
    name: string,
    asset: ERC20Interface,
    collateral: ERC20Interface,
    lendApr: number,
    utilization: number,
    totalBorrow: number,
    isSfrxUsdMarket: boolean
}

export interface FraxlendMarketDetails {
    userAddress: `0x${string}`,
    assetBalance: string,
    depositedBalance: string,
    status: "idle" | "loading" | "succeeded" | "rejected"
}

export interface FraxlendInterface {
    markets: {
        [pairAddress: `0x${string}`]: FraxlendMarket
    },
    marketDetails: {
        [pairAddress: `0x${string}`]: FraxlendMarketDetails
    },
    status: "idle" | "loading" | "succeeded" | "rejected"
}