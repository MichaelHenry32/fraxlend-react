import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { fetchMarketsData } from "../features/fraxlend/fraxlendSlice";
import { useNavigate } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';

export const FraxlendMarketsList = () => {
    const { markets, status } = useAppSelector(state => state.fraxlend);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchMarketsData())
        }
    }, [status, dispatch]);

    const handleMarketClick = (pairAddress: `0x${string}`) => {
        navigate(`/markets/${pairAddress}`);
    };


    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Asset</TableCell>
                        <TableCell>Collateral</TableCell>
                        <TableCell>Lend APR</TableCell>
                        <TableCell>Total Borrow</TableCell>
                        <TableCell>Utilization</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        Object.values(markets).map(market =>
                            <TableRow key={market.pairAddress} onClick={() => handleMarketClick(market.pairAddress)} >
                                <TableCell>{market.name}</TableCell>
                                <TableCell>{market.asset}</TableCell>
                                <TableCell>{market.collateral}</TableCell>
                                <TableCell>{market.lendApr}</TableCell>
                                <TableCell>{market.totalBorrow}</TableCell>
                                <TableCell>{market.utilization}</TableCell>
                            </TableRow>
                        )
                    }
                </TableBody>
            </Table>
        </TableContainer >
    )
}