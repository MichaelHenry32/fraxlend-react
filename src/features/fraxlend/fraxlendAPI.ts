import { formatUnits } from "viem/utils";
import { FraxlendPairAbi } from "../../abis/Fraxlend/fraxlendPair";
import { FraxlendPairDeployerAbi } from "../../abis/Fraxlend/fraxlendPairDeployer";
import { publicClient } from "../../app/client";
import { calculatePercentage } from "../../utils/numberUtils";
import { FraxlendMarket } from "./fraxlendInterfaces";
import { Erc20Abi } from "../../abis/erc20";


// TODO: Replace this with an automatic fetcher.
const PAIR_TO_HELPER_MAP: Record<`0x${string}`, `0x${string}`> = {
    '0x689087338CFbD1D268AD361F7759Fb1200c921e2': '0xd7446c346f54F8F20164e5620CA810b172df2FEa'
}

function get_helper_address(pairAddress: `0x${string}`): `0x${string}` {
    return PAIR_TO_HELPER_MAP[pairAddress] || pairAddress;
}

export async function getFraxlendMarketDetails(fraxlendMarket: FraxlendMarket, user_address: `0x${string}`): Promise<{ assetBalance: string; sharesBalance: string } | undefined> {
    try {
        const [assetBalance, sharesBalance] = await publicClient.multicall({
            contracts: [
                {
                    address: fraxlendMarket.asset.address,
                    abi: Erc20Abi,
                    functionName: 'balanceOf',
                    args: [user_address]
                },
                {
                    address: fraxlendMarket.pairAddress,
                    abi: Erc20Abi,
                    functionName: 'balanceOf',
                    args: [user_address]
                }
            ]
        });

        return {
            assetBalance: assetBalance.result?.toString() || "0",
            sharesBalance: sharesBalance.result?.toString() || "0"
        };
    } catch (e) {
        console.error("Failed to get fraxlend market details", e)
        return undefined;
    }
}


// I want to see: Market, Collateral, Asset, Utilization, Total Borrow, APR
export async function getFraxlendMarket(pairAddress: `0x${string}`): Promise<FraxlendMarket | undefined> {
    const helperAddress = get_helper_address(pairAddress);

    try {
        const marketValues = await publicClient.multicall({
            contracts: [
                {
                    address: helperAddress,
                    abi: FraxlendPairAbi,
                    functionName: 'name'
                },
                {
                    address: helperAddress,
                    abi: FraxlendPairAbi,
                    functionName: 'asset'
                },
                {
                    address: helperAddress,
                    abi: FraxlendPairAbi,
                    functionName: 'collateralContract'
                },
                {
                    address: helperAddress,
                    abi: FraxlendPairAbi,
                    functionName: 'currentRateInfo'
                },
                {
                    address: helperAddress,
                    abi: FraxlendPairAbi,
                    functionName: 'getPairAccounting'
                }
            ]
        });

        console.log("Market Values: ", marketValues);

        if (marketValues.some(result => result instanceof Error)) {
            console.log("some value is undefined?!?")
            return undefined;
        }

        const [pairName, assetAddress, collateralAddress, currentRateInfoResults, pairAccountingResults] = marketValues;
        const pairAccounting = (pairAccountingResults.result ?? [1n, 1n, 1n, 1n, 1n]).map(x => typeof x === 'bigint' ? x : BigInt(x));;
        const currentRateInfo = (currentRateInfoResults.result ?? [1n, 1n, 1n, 1n, 1n]).map(x => typeof x === 'bigint' ? x : BigInt(x));;

        console.log("Got pairAccount and currentRateInfo")

        const utilization = calculatePercentage(pairAccounting[2], pairAccounting[0]);
        // TODO: Use APY instead of APR
        let lendApr = calculatePercentage(currentRateInfo[3] * BigInt(3153600000), BigInt(10 ** 22));
        lendApr = pairAddress != helperAddress ? lendApr : lendApr * utilization / 100

        const assetCollateralInfo = await publicClient.multicall({
            contracts: [
                {
                    address: assetAddress.result!,
                    abi: Erc20Abi,
                    functionName: 'name'
                },
                {
                    address: assetAddress.result!,
                    abi: Erc20Abi,
                    functionName: 'symbol'
                },
                {
                    address: collateralAddress.result!,
                    abi: Erc20Abi,
                    functionName: 'name'
                },
                {
                    address: collateralAddress.result!,
                    abi: Erc20Abi,
                    functionName: 'symbol'
                },
            ]
        });

        const [assetName, assetSymbol, collateralName, collateralSymbol] = assetCollateralInfo;


        return {
            pairAddress: pairAddress,
            helperAddress: helperAddress,
            name: pairName.result!,
            asset: {
                name: assetName.result!,
                symbol: assetSymbol.result!,
                address: assetAddress.result!
            },
            collateral: {
                name: collateralName.result!,
                symbol: collateralSymbol.result!,
                address: collateralAddress.result!
            }, utilization: utilization,
            lendApr: lendApr,
            totalBorrow: Number(formatUnits(pairAccounting[2], 18)),
            isSfrxUsdMarket: pairAddress != helperAddress
        }
    } catch (e) {
        console.error("Error in getFraxlendMarkets: ", helperAddress, e);
        return undefined;
    }
}

export async function getFraxlendMarkets(): Promise<FraxlendMarket[]> {
    const fraxlendPairDeployerAddress = import.meta.env.VITE_FRAXLEND_PAIR_DEPLOYER_ADDRESS || '0x4C3B0e85CD8C12E049E07D9a4d68C441196E6a12';

    const pairAddressess = await publicClient.readContract({
        address: fraxlendPairDeployerAddress as `0x${string}`,
        abi: FraxlendPairDeployerAbi,
        functionName: "getAllPairAddresses"
    });

    const fraxlendMarkets = await Promise.all(pairAddressess.map(pairAddress => getFraxlendMarket(pairAddress)));
    console.log("All Fraxlend Markets: ", fraxlendMarkets);
    return fraxlendMarkets.filter(market => market !== undefined);
}