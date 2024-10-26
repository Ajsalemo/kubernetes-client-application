import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import { experimentalStyled as styled } from '@mui/material/styles';

export const Dashboard = () => {
    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        ...theme.applyStyles('dark', {
            backgroundColor: '#1A2027',
        }),
    }));

    const StyledBox = styled(Box)(() => ({
        backgroundColor: '#cfb6b6',
        height: '100vh',
        padding: '1rem',
    }));

    return (
        <StyledBox sx={{ flexGrow: 1 }}>
            <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid size={{ xs: 6 }}>
                    <Item>i</Item>
                </Grid>
                <Grid size={{ xs: 6 }}>
                    <Item>i</Item>
                </Grid>
            </Grid>
        </StyledBox>);
}

