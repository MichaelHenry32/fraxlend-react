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
    Button,
    Tab,
    Tabs
} from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import { fetchMarketDetailData } from '../features/fraxlend/fraxlendSlice';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { Erc20Abi } from '../abis/erc20';
import { FraxlendPairAbi } from '../abis/Fraxlend/fraxlendPair';
import { formatUnits } from "viem/utils";


// Define the type for your route parameters

const FraxlendMarketDetail = () => {
    const [tabValue, setTabValue] = useState('0'); // 0 for deposit, 1 for withdraw
    const [depositAmount, setDepositAmount] = useState('');
    const dispatch = useAppDispatch();
    const { address, isConnected } = useAccount();
    const userAddress = address ? address : "0x0000000000000000000000000000000000000000";
    // Use the type with useParams
    const { pairAddress } = useParams() as { pairAddress: `0x${string}` };

    const market = useAppSelector(state => state.fraxlend.markets[pairAddress]);
    const marketDetails = useAppSelector(state => state.fraxlend.marketDetails[pairAddress]);

    const { data: depositAllowance, refetch: refetchDeposit } = useReadContract({
        address: market.asset.address,
        abi: Erc20Abi,
        functionName: "allowance",
        args: [userAddress, market.helperAddress],
    });

    const { data: withdrawAllowance, refetch: refetchWithdraw } = useReadContract({
        address: market.pairAddress,
        abi: FraxlendPairAbi,
        functionName: "allowance",
        args: [userAddress, market.helperAddress],
    });

    // Convert input value to BigInt for comparison with allowance
    const inputValueBigInt = depositAmount ? BigInt(parseFloat(depositAmount) * (10 ** 18)) : BigInt(0);

    // Check if allowance is sufficient for the input amount
    const hasDepositAllowance = depositAllowance && inputValueBigInt > 0 ? BigInt(depositAllowance.toString()) >= inputValueBigInt : false;
    const hasWithdrawAllowance = withdrawAllowance && inputValueBigInt > 0 ? BigInt(withdrawAllowance.toString()) >= inputValueBigInt : false;
    const hasAllowance = tabValue === "0" ? hasDepositAllowance : hasWithdrawAllowance;

    useEffect(() => {
        // Only fetch if we don't have details yet or if the user address has changed
        if (marketDetails === undefined || marketDetails.userAddress !== userAddress || marketDetails.status === 'idle') {
            dispatch(fetchMarketDetailData({ fraxlendMarket: market, userAddress }));
        }
    }, [dispatch, market, marketDetails, userAddress]);

    const { isPending, writeContract } = useWriteContract({
        mutation: {
            onSettled: (data, error) => {
                if (data) {
                    console.log('Transaction Hash: ', data);
                }

                if (error) {
                    console.error('Transaction failed: ', error.message);
                    return;
                }

                refetchDeposit();
                refetchWithdraw();
                dispatch(fetchMarketDetailData({ fraxlendMarket: market, userAddress }));
            }
        }
    });

    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        setTabValue(newValue);
    };

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
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
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
                                            onClick={() => setDepositAmount(
                                                tabValue === '0'
                                                    ? formatUnits(BigInt(marketDetails.assetBalance), 18)
                                                    : formatUnits(BigInt(marketDetails.depositedBalance), 18)
                                            )}
                                        >
                                            MAX
                                        </Button>
                                        <Typography variant="body2" color="textSecondary">{market.asset.symbol}</Typography>
                                    </Box>
                                )
                            }}
                        />
                    </Grid>
                    <TabContext value={tabValue}>
                        <Tabs value={tabValue} onChange={handleTabChange}>
                            <Tab label="Deposit" value="0" />
                            <Tab label="Withdraw" value="1" />
                        </Tabs>
                        <TabPanel value="0">
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        disabled={isPending || hasAllowance || depositAmount === ''}
                                        onClick={() => writeContract({
                                            address: market.asset.address,
                                            abi: Erc20Abi,
                                            functionName: "approve",
                                            args: [market.helperAddress, inputValueBigInt],
                                        })}
                                    >
                                        {isPending ? 'Processing...' : 'Approve'}
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        disabled={isPending || !hasAllowance || depositAmount === ''}
                                        onClick={() => writeContract({
                                            address: market.helperAddress,
                                            abi: FraxlendPairAbi,
                                            functionName: "deposit",
                                            args: [inputValueBigInt, userAddress],
                                        })}
                                    >
                                        {isPending ? 'Processing...' : 'Deposit'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </TabPanel>
                        <TabPanel value="1">
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        disabled={isPending || hasAllowance || depositAmount === ''}
                                        onClick={() => writeContract({
                                            address: market.pairAddress,
                                            abi: FraxlendPairAbi,
                                            functionName: "approve",
                                            args: [market.helperAddress, inputValueBigInt],
                                        })}
                                    >
                                        {isPending ? 'Processing...' : 'Approve'}
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        disabled={isPending || !hasAllowance || depositAmount === ''}
                                        onClick={() => writeContract({
                                            address: market.helperAddress,
                                            abi: FraxlendPairAbi,
                                            functionName: "withdraw",
                                            args: [inputValueBigInt, userAddress, userAddress],
                                        })}
                                    >
                                        {isPending ? 'Processing...' : 'Withdraw'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </TabPanel>
                    </TabContext>
                </Grid>
            </Box>
        </Paper>
    );
}

export default FraxlendMarketDetail;