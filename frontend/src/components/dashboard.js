import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import { experimentalStyled as styled } from '@mui/material/styles';
import axios from 'axios';
import { useEffect, useState } from 'react';

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
        height: '100%',
    }));

    const StyledGrid = styled(Grid)(() => ({
        backgroundColor: '#cfb6b6',
        height: '100%',
    }));

    const StyledBox = styled(Box)(() => ({
        backgroundColor: '#cfb6b6',
        height: '100vh',
        padding: '1rem',
    }));

    const [listDeployments, setListDeployments] = useState([])
    const [listDeploymentsErrorCode, setListDeploymentsErrorCode] = useState("")
    const [listDeploymentsErrorMessage, setListDeploymentsErrorMessage] = useState("")

    useEffect(() => {
        const getListDeployments = async() => {
            try {
                // Fetch all Deployment information from k8s
                const { data: { deployments } } = await axios.get('http://localhost:3070/api/deployment/list');
                setListDeployments(deployments);
            } catch (error) {
                console.error(error.code);
                console.error(error.message);
                setListDeploymentsErrorCode(error.code);
                setListDeploymentsErrorMessage(error.message);
            }
        }

        getListDeployments();
    }, []);
    console.log(listDeployments);
    return (
        <StyledBox sx={{ flexGrow: 1 }}>
            <StyledGrid container spacing={{ xs: 2, md: 3 }}>
                <Grid size={{ xs: 6 }}>
                    <Item>i</Item>
                </Grid>
                <Grid size={{ xs: 6 }}>
                    <Item>
                        {listDeploymentsErrorCode && <div style={{color: 'red'}}>Error code: {listDeploymentsErrorCode}</div>}
                        {listDeploymentsErrorMessage && <div style={{color: 'red'}}>Error message: {listDeploymentsErrorMessage}</div>}
                        {listDeployments.map((deployment, index) => (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span><b>Deployment name:</b> {deployment.metadata.name}</span>
                                <span><b>Replica count:</b> {deployment.spec.replicas}</span>
                                <span><b>terminationGracePeriodSeconds:</b> {deployment.spec.terminationGracePeriodSeconds}</span>
                                {deployment.spec.template.spec.containers.map((container, index) => (
                                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <span><b>Container name:</b> {container.name}</span>
                                        <span><b>Image:</b> {container.image}</span>
                                        <ul style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <b>Ports:</b> 
                                            {container.ports.map((port, index) => (
                                            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: '2rem' }}>
                                                <li><b>Container Port:</b> {port.containerPort}</li>
                                                <li><b>Protocol:</b> {port.protocol}</li>
                                            </div>
                                        ))}
                                        </ul>
                                        <span><b>CPU (limit):</b> {container.resources.limits.cpu}</span>
                                        <span><b>Memory (limit):</b> {container.resources.limits.memory}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </Item>
                </Grid>
            </StyledGrid>
        </StyledBox>
    );
}

