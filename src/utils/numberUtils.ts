import { formatUnits } from "viem/utils";

export function calculatePercentage(
    numerator: bigint,
    denominator: bigint,
    decimals: number = 2
): number {
    // Prevent division by zero
    if (denominator === 0n) {
        return 0;
    }

    // Scale by 100 for percentage and add extra precision
    const scale = 10n ** BigInt(decimals);
    const scaledResult = (numerator * scale * 100n) / denominator;

    // Format the result with proper decimal places
    const percentageValue = formatUnits(scaledResult, decimals);
    return Number(percentageValue);
}