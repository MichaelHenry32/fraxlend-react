import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';

export function useFraxlendMarketDetails() {
    return useSelector((state: RootState) => state.fraxlend);
}

// Additional hooks related to fraxlend
export function useSpecificMarket(pairAddress: `0x${string}`) {
    return useSelector((state: RootState) => state.fraxlend.markets[pairAddress]);
}