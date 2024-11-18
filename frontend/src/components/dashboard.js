import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import { experimentalStyled as styled } from '@mui/material/styles';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { DeploymentForm } from './deploymentform';

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

    const DeploymentItem = styled(Paper)(({ theme }) => ({
        backgroundColor: '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        ...theme.applyStyles('dark', {
            backgroundColor: '#1A2027',
        }),
        height: '100%',
        overflow: 'scroll'
    }));

    const StyledGrid = styled(Grid)(() => ({
        backgroundColor: '#cfb6b6',
        height: '100%',
    }));

    const StyledDeploymentGrid = styled(Grid)(() => ({
        maxHeight: '100%',
    }));

    const StyledBox = styled(Box)(() => ({
        backgroundColor: '#cfb6b6',
        height: '100vh',
        padding: '1rem',
    }));

    const [listDeployments, setListDeployments] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [listDeploymentsErrorCode, setListDeploymentsErrorCode] = useState("")
    const [listDeploymentsErrorMessage, setListDeploymentsErrorMessage] = useState("")

    const getListDeployments = async () => {
        setIsLoading(true);
        try {
            // Fetch all Deployment information from k8s
            const { data: { deployments } } = await axios.get('http://localhost:3070/api/deployment/list');
            setListDeployments(deployments);
            setIsLoading(false);
        } catch (error) {
            console.error(error.code);
            console.error(error.message);
            setListDeploymentsErrorCode(error.code);
            setListDeploymentsErrorMessage(error.message);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getListDeployments();
    }, []);

    return (
        <StyledBox sx={{ flexGrow: 1 }}>
            <StyledGrid container spacing={{ xs: 2, md: 3 }}>
                <Grid size={{ xs: 6 }}>
                    <Item><DeploymentForm getListDeployments={getListDeployments} /></Item>
                </Grid>
                <StyledDeploymentGrid size={{ xs: 6 }}>
                    <DeploymentItem>
                        {listDeploymentsErrorCode && <div style={{ color: 'red' }}>Error code: {listDeploymentsErrorCode}</div>}
                        {listDeploymentsErrorMessage && <div style={{ color: 'red' }}>Error message: {listDeploymentsErrorMessage}</div>}
                        {listDeployments.length > 0 ? listDeployments.map((deployment, index) => (
                            <div
                                key={index}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '4rem', backgroundColor: index % 2 === 0 ? "#add8e6" : "#e6f3f7", padding: '1rem', borderRadius: '0.5rem' }}
                            >
                                <span><b>Deployment name:</b> {deployment.metadata && deployment.metadata.name}</span>
                                <span><b>Replica count:</b> {deployment.spec && deployment.spec.replicas}</span>
                                <span><b>terminationGracePeriodSeconds:</b> {deployment.spec && deployment.spec.terminationGracePeriodSeconds}</span>
                                <span><b>restartPolicy:</b> {deployment.spec && deployment.spec.template.spec.restartPolicy}</span>
                                {deployment.spec.template.spec.containers && deployment.spec.template.spec.containers.map((container, index) => (
                                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <span><b>Container name:</b> {container && container.name}</span>
                                        <span><b>Image:</b> {container && container.image}</span>
                                        <span><b>imagePullPolicy:</b> {container && container.imagePullPolicy}</span>
                                        <ul style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <b>Ports:</b>
                                            {container.ports && container.ports.map((port, index) => (
                                                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: '2rem' }}>
                                                    <li><b>Container Port:</b> {port && port.containerPort}</li>
                                                    <li><b>Protocol:</b> {port && port.protocol}</li>
                                                </div>
                                            ))}
                                        </ul>
                                        <span><b>CPU (limit):</b> {container.resources.limits && container.resources.limits.cpu}</span>
                                        <span><b>Memory (limit):</b> {container.resources.limits && container.resources.limits.memory}</span>
                                    </div>
                                ))}
                            </div>
                        )) : <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}><span>No deployments found</span></div>}
                    </DeploymentItem>
                </StyledDeploymentGrid>
            </StyledGrid>
        </StyledBox>
    );
}

