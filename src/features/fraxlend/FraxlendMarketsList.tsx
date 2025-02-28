import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { fetchMarketsData } from "./fraxlendSlice";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { FraxlendMarket } from "./fraxlendInterfaces";

export const FraxlendMarketsList = () => {
    const { markets, status } = useAppSelector(state => state.fraxlend);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchMarketsData())
        }
    })

    const columns = Object.keys(markets[0] ?? {})
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        {
                            columns.map(
                                (column) => (
                                    <TableCell key={column}>{column}</TableCell>
                                )
                            )
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        markets.map((market) =>
                            <TableRow key={market.pairAddress}>
                                {
                                    columns.map((column) => (<TableCell>{market[column as keyof FraxlendMarket]}</TableCell>))
                                }
                            </TableRow>
                        )
                    }
                </TableBody>
            </Table>
        </TableContainer>
    );
}