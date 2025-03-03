import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { fetchMarketsData } from "../features/fraxlend/fraxlendSlice";
import { Table } from "@chakra-ui/react"
import { useNavigate } from 'react-router-dom';
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Paper
// } from '@mui/material';
import { FraxlendMarket } from "../features/fraxlend/fraxlendInterfaces";

export const FraxlendMarketsList = () => {
    const { markets, status } = useAppSelector(state => state.fraxlend);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchMarketsData())
        }
    })

    const handleMarketClick = (pairAddress: `0x${string}`) => {
        navigate(`/markets/${pairAddress}`);
    };

    const columns = Object.keys(markets[0] ?? {})
    return (
        <Table.Root size="sm" striped>
            <Table.Header>
                <Table.Row>
                    {
                        columns.map(
                            (column) => (
                                <Table.ColumnHeader key={column}>{column}</Table.ColumnHeader>
                            )
                        )
                    }
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {
                    markets.map((market) =>
                        <Table.Row key={market.pairAddress} onClick={() => handleMarketClick(market.pairAddress)}>
                            {
                                columns.map((column) => (<Table.Cell>{market[column as keyof FraxlendMarket]}</Table.Cell>))
                            }
                        </Table.Row>
                    )
                }
            </Table.Body>
        </Table.Root>
    )
}