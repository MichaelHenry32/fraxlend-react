export interface FraxlendMarket {
    helperAddress: `0x${string}`,
    pairAddress: `0x${string}`,
    name: string,
    asset: `0x${string}`,
    collateral: `0x${string}`
    lendApr: number,
    utilization: number,
    totalBorrow: number,
    isSfrxUsdMarket: boolean
}

export interface FraxlendInterface {
    markets: FraxlendMarket[],
    status: "idle" | "loading" | "succeeded" | "rejected"
}