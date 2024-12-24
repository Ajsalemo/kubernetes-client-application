import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from "@mui/material/CircularProgress";
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import { experimentalStyled as styled } from '@mui/material/styles';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from "react-router";
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

    const [listDeployments, setListDeployments] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [listDeploymentsErrorCode, setListDeploymentsErrorCode] = useState("")
    const [listDeploymentsErrorMessage, setListDeploymentsErrorMessage] = useState("")
    const backendApiURL = process.env.REACT_APP_BACKEND_API_URL ?? 'http://localhost:3070';

    const getListDeployments = async () => {
        setIsLoading(true);
        try {
            console.log('getListDeployments() was called');
            // Fetch all Deployment information from k8s
            const { data: { deployments } } = await axios.get(`${backendApiURL}/api/deployment/list`);
            setListDeployments(deployments);
            setIsLoading(false);
            setListDeploymentsErrorCode("");
            setListDeploymentsErrorMessage("");
        } catch (error) {
            console.error(error.code);
            console.error(error.message);
            setListDeploymentsErrorCode(error.code);
            setListDeploymentsErrorMessage(error.message);
            setIsLoading(false);
        }
    }

    const deleteDeployment = async (deploymentName) => {
        setIsLoading(true);
        try {
            // Fetch all Deployment information from k8s
            const res = await axios.delete(`${backendApiURL}/api/deployment/delete/${deploymentName}`);
            if (res) {
                // Get the updated list of deployments
                await getListDeployments();
                setIsLoading(false);
            }
            setListDeploymentsErrorCode("");
            setListDeploymentsErrorMessage("");
        } catch (error) {
            console.error(error.code);
            console.error(error.message);
            setListDeploymentsErrorCode(error.code);
            if (error.response && error.response.data && error.response.data.error) {
                console.error(error.response.data.error);
                setListDeploymentsErrorMessage(error.response.data.error);
            } else {
                setListDeploymentsErrorMessage(error.message);
            }
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getListDeployments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Box sx={{ flexGrow: 1 }} style={{ backgroundColor: '#cfb6b6', height: '100vh', padding: '1rem' }}>
            <Grid container spacing={{ xs: 2, md: 3 }} style={{ backgroundColor: '#cfb6b6', height: '100vh' }}>
                <Grid size={{ xs: 6 }}>
                    <Item><DeploymentForm getListDeployments={getListDeployments} /></Item>
                </Grid>
                <Grid size={{ xs: 6 }} style={{ maxHeight: '100%' }}>
                    <DeploymentItem>
                        {listDeploymentsErrorCode && <div style={{ color: 'red' }}>Error code: {listDeploymentsErrorCode}</div>}
                        {listDeploymentsErrorMessage && <div style={{ color: 'red' }}>Error message: {listDeploymentsErrorMessage}</div>}
                        {listDeployments.length > 0 ? listDeployments.map((deployment, index) => (
                            <div
                                key={index}
                                style={{ display: 'flex', marginBottom: '4rem', backgroundColor: index % 2 === 0 ? "#add8e6" : "#e6f3f7", padding: '1rem', borderRadius: '0.5rem' }}
                            >
                                <Grid size={{ xs: 10 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
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
                                    <div style={{ 'marginTop': '2rem', borderTop: '1px solid #000', width: '100%', display: 'flex', alignItems: 'flex-start' }}>
                                        <Button variant="contained" color="primary" style={{ 'marginTop': '1rem' }}>
                                            <Link to={`/deployment/${deployment.metadata.name}`} style={{ color: '#fff', textDecoration: 'none' }}>View deployment</Link>
                                        </Button>
                                    </div>
                                </Grid>
                                <Grid size={{ xs: 2 }}>
                                    <Button variant="contained" color="error" onClick={() => deleteDeployment(deployment.metadata.name)} disabled={isLoading}>{isLoading ? <CircularProgress color="primary" /> : "Delete"}</Button>
                                </Grid>
                                <div></div>
                            </div>
                        )) : <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}><span>No deployments found</span></div>}
                    </DeploymentItem>
                </Grid>
            </Grid>
        </Box>
    );
}

