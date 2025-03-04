import { useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { useEffect, useState } from 'react';
import {
    Typography,
    Paper,
    Card,
    CardContent,
    Grid,
    Divider,
    Chip,
    Stack,
    Box,
    TextField,
    Button
} from '@mui/material';
import { fetchMarketDetailData } from '../features/fraxlend/fraxlendSlice';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { Erc20Abi } from '../abis/erc20';
import { FraxlendPairAbi } from '../abis/Fraxlend/fraxlendPair';
import { formatUnits } from "viem/utils";


// Define the type for your route parameters

const FraxlendMarketDetail = () => {
    const [inputValue, setInputValue] = useState('');
    const dispatch = useAppDispatch();
    const { address, isConnected } = useAccount();
    const { data: hash, isPending, writeContract } = useWriteContract();
    const userAddress = address ? address : "0x0000000000000000000000000000000000000000";
    // Use the type with useParams
    const { pairAddress } = useParams() as { pairAddress: `0x${string}` };

    const market = useAppSelector(state => state.fraxlend.markets[pairAddress]);
    const marketDetails = useAppSelector(state => state.fraxlend.marketDetails[pairAddress]);

    const { data: allowance, refetch } = useReadContract({
        address: market.asset.address,
        abi: Erc20Abi,
        functionName: "allowance",
        args: [userAddress, market.helperAddress],
    });

    // Convert input value to BigInt for comparison with allowance
    const inputValueBigInt = inputValue ? BigInt(parseFloat(inputValue) * (10 ** 18)) : BigInt(0);
    
    // Check if allowance is sufficient for the input amount
    const hasAllowance = allowance && inputValueBigInt > 0 ? BigInt(allowance.toString()) >= inputValueBigInt : false;

    useEffect(() => {
        if (!marketDetails) {
            dispatch(fetchMarketDetailData({ fraxlendMarket: market, userAddress }));
            return;
        }

        if (marketDetails.status === 'idle' || marketDetails.user_address !== userAddress) {
            dispatch(fetchMarketDetailData({ fraxlendMarket: market, userAddress }))
        }
    }, [dispatch, market, userAddress, marketDetails]);

    useEffect(() => {
        if (hash) {
            refetch()
        }
    }, [hash, isPending, refetch]);

    if (market === undefined || marketDetails === undefined) {
        return (
            <Typography variant="body1">
                <strong>Please connect wallet</strong>
            </Typography>
        )
    }

    if (!isConnected) {
        return <></>
    }

    console.log("Market Details: ", marketDetails);

    return (
        <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h4" gutterBottom>
                {market.name}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Market Details
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Stack spacing={2}>
                                <Typography variant="body1">
                                    <strong>Pair Address:</strong> {market.pairAddress}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Helper Address:</strong> {market.helperAddress}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Asset:</strong> {market.asset.name}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Collateral:</strong> {market.collateral.name}
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography component="span">
                                        <strong>Type:</strong>
                                    </Typography>
                                    {market.isSfrxUsdMarket ?
                                        <Chip label="Enhanced Market" color="primary" size="small" /> :
                                        <Chip label="Standard Market" color="default" size="small" />
                                    }
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Market Metrics
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Stack spacing={2}>
                                <Typography variant="body1">
                                    <strong>Lending APR:</strong> {market.lendApr.toFixed(2)}%
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Utilization:</strong> {market.utilization.toFixed(2)}%
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Total Borrow:</strong> {market.totalBorrow.toLocaleString()}
                                </Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box mt={4} p={2} sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                    Interact with Market
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                        <TextField
                            fullWidth
                            label="Amount"
                            variant="outlined"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Enter amount..."
                            disabled={isPending}
                            InputProps={{
                                endAdornment: (
                                    <Box display="flex" alignItems="center">
                                        <Button
                                            size="small"
                                            disabled={isPending}
                                            sx={{
                                                minWidth: 'auto',
                                                fontSize: '0.7rem',
                                                mr: 1,
                                                py: 0.5,
                                                px: 1,
                                                borderRadius: '4px',
                                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(25, 118, 210, 0.12)'
                                                }
                                            }}
                                            onClick={() => setInputValue(formatUnits(BigInt(marketDetails.assetBalance), 18))}
                                        >
                                            MAX
                                        </Button>
                                        <Typography variant="body2" color="textSecondary">{market.asset.symbol}</Typography>
                                    </Box>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={isPending || hasAllowance || inputValue === ''}
                            onClick={() => writeContract({
                                address: market.asset.address,
                                abi: Erc20Abi,
                                functionName: "approve",
                                args: [market.helperAddress, BigInt(inputValue) * BigInt(10 ** 18)],
                            })}
                        >
                            {isPending ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={isPending || !hasAllowance || inputValue === ''}
                            onClick={() => writeContract({
                                address: market.helperAddress,
                                abi: FraxlendPairAbi,
                                functionName: "deposit",
                                args: [BigInt(inputValue) * BigInt(10 ** 18), userAddress],
                            })}
                        >
                            {isPending ? 'Processing...' : 'Lend'}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
}

export default FraxlendMarketDetail;