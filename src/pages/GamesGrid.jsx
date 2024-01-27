import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import NativeSelect from '@mui/material/NativeSelect';

const GamesGrid = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('-discountStartAt');
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [handlingScroll, setHandlingScroll] = useState(false);

    useEffect(async () => {
        await fetchData(searchQuery, page, sortBy);
    }, []);

    function randomString(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }

    const fetchData = async (searchQuery, pageNo, sortBy) => {
        console.log("fetching pageNo:", pageNo);
        await new Promise(r => setTimeout(r, 1000));
        try {
            const response = await axios.get(`/api/games?pageNo=${pageNo + 1}&pageSize=50` + (sortBy ? ('&sortBy=' + sortBy) : '') + (searchQuery ? ('&q=' + searchQuery) : ''));
            setData((prev) => [...prev, ...response.data]);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    const handleSearch = async () => {
        setPage(0);
        setData([]);
        setIsLoading(true)
        await fetchData();
    };

    const handleSortChange = async (event) => {
        // console.log("handleSortChange");
        setSortBy(event.target.value);
        setPage(0);
        setData([]);
        setIsLoading(true)
        await fetchData(searchQuery, 0, event.target.value);
    };

    const handleScroll = async () => {
        // console.log("handleScroll 1st:", handlingScroll, window.innerHeight, window.scrollY, document.body.offsetHeight)
        if (!handlingScroll && !isLoading && (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1.5 * window.innerHeight)) {
            // Fetch new data
            setHandlingScroll(true);
            setPage(page + 1);
            setIsLoading(true);
            await fetchData(searchQuery, page + 1, sortBy);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            setHandlingScroll(false);
        }
    }, [document.body.offsetHeight]);

    function getCurrentPriceLabel(data) {
        return <Grid container justifyContent="space-between" alignItems="flex-end">
            <Grid item>
                <Typography variant="h5" sx={{ padding: "0 0 0 5px" }} display="inline">
                    <span style={{ color: '#ed934e' }}><b>${data.currentPrice}</b></span>
                </Typography>
            </Grid>
            <Grid item>
                {getCheapestPriceLabel(data)}
            </Grid>
        </Grid>
    }

    function getCheapestPriceLabel(data) {
        if (!data.cheapestPriceEndAt || !data.cheapestPrice) {
            return;
        }

        const dateLabel = data.cheapestPriceEndAt ? new Date(Date.parse(data.cheapestPriceEndAt)).toLocaleDateString('zh-HK') : '-';
        return (<Typography variant="caption" sx={{ padding: "0 5px 0 0" }} display="inline">
            <span style={{ color: '#8f8f8f' }}>${data.cheapestPrice} ({dateLabel})</span>
        </Typography>);
    }

    function getPriceLabel(data) {
        if (!data.discountRate) {
            return <Grid container alignItems="flex-end">
                <Grid item xs={12} sm={12} md={12} lg={12} >
                    {getCurrentPriceLabel(data)}
                </Grid>
            </Grid>;
        }

        const startAtLabel = data.discountStartAt ? new Date(Date.parse(data.discountStartAt)).toLocaleDateString('zh-HK') : '-';
        const endAtLabel = data.discountEndAt ? new Date(Date.parse(data.discountEndAt)).toLocaleDateString('zh-HK') : '-';

        return (<Grid container alignItems="flex-end">
            <Grid item xs={12} sm={12} md={12} lg={12}>
                <Typography variant="subtitle2" sx={{ padding: "0 5px" }} >
                    <span style={{ color: '#999999' }}>{startAtLabel} ~ {endAtLabel} </span>
                </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} >
                <Typography variant="body1" sx={{ padding: "0 0 0 5px" }} >
                    <span style={{ color: '#c4c4c4', textDecoration: 'line-through' }}><b>${data.regularPrice}</b></span>
                    <span style={{ color: '#eb5252' }}> (↓{data.discountRate}%)</span>
                </Typography>
                {getCurrentPriceLabel(data)}
            </Grid>
        </Grid>);
    }

    return (
        <div>
            <AppBar position="sticky">
                <Toolbar>
                    <Grid container justifyContent="space-between" alignItems="stretch">
                        <IconButton edge="start" color="inherit" aria-label="menu">
                            <SearchIcon />
                        </IconButton>
                        <TextField
                            label="Search"
                            variant="outlined"
                        // value={searchTerm}
                        // onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <NativeSelect value={sortBy} onChange={handleSortChange}>
                            <option value="-discountStartAt">最新優惠</option>
                            <option value="discountEndAt">就完優惠</option>
                            <option value="currentPrice">售價</option>
                            <option value="-discountRate">折扣</option>
                        </NativeSelect>
                    </Grid>
                </Toolbar>
            </AppBar>
            <Container sx={{ padding: "0 0" }}>
                <Grid container justifyContent="center" alignItems="center" spacing={0.5} >
                    {data.map((item) => (
                        <Grid item xs={12} sm={6} md={6} lg={6} key={item.id}>
                            <Card>
                                <Grid container >
                                    <Grid item xs={6} sm={6} md={6} lg={6}>
                                        <CardActionArea href={item.link} target="_blank" referrerPolicy="no-referrer" >
                                            {/* style={{ width: (window.innerWidth > 600 ? 600 : window.innerWidth), height: 'auto' }} */}
                                            <CardMedia component="img" sx={{ objectFit: "contain" }} image={item.image} alt={item.name} referrerPolicy="no-referrer" />
                                        </CardActionArea>
                                    </Grid>
                                    <Grid container item xs={6} sm={6} md={6} lg={6}>
                                        <Grid item xs={12} sm={12} md={12} lg={12}>
                                            <Typography variant="body2" sx={{ padding: "0 5px", display: "-webkit-box", overflow: "hidden", textOverflow: "ellipsis", WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.name}</Typography>
                                        </Grid>
                                        {getPriceLabel(item)}
                                    </Grid>
                                </Grid>
                            </Card>
                        </Grid>
                    ))}
                    {isLoading && <Grid item justifyContent="center" alignItems="center"><CircularProgress sx={{ padding: "10px 0" }} /></Grid>}
                </Grid>
            </Container>
        </div>
    );
};

export default GamesGrid;