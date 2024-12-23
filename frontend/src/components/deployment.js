import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from "@mui/material/CircularProgress";
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import { experimentalStyled as styled } from '@mui/material/styles';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from "react-router";
import { useParams } from "react-router-dom";

export const Deployment = () => {
    const params = useParams();
    const deploymentName = params.deployment

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
    }));

    const StyledBox = styled(Box)(() => ({
        backgroundColor: '#cfb6b6',
        height: '100vh',
        padding: '1rem',
    }));


    const [listDeployment, setListDeployment] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [listDeploymentErrorCode, setListDeploymentErrorCode] = useState("")
    const [listDeploymentErrorMessage, setListDeploymentErrorMessage] = useState("")
    const backendApiURL = process.env.REACT_APP_BACKEND_API_URL ?? 'http://localhost:3070';

    const getListDeployment = async () => {
        setIsLoading(true);
        try {
            // Fetch all Deployment information from k8s
            const { data: { deployments } } = await axios.get(`${backendApiURL}/api/deployment/get/${deploymentName}`);
            console.log(deployments)
            setListDeployment(deployments);
            setIsLoading(false);
            setListDeploymentErrorCode("");
            setListDeploymentErrorMessage("");
        } catch (error) {
            console.error(error.code);
            console.error(error.message);
            setListDeploymentErrorCode(error.code);
            setListDeploymentErrorMessage(error.message);
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
                await getListDeployment();
                setIsLoading(false);
            }
            setListDeploymentErrorCode("");
            setListDeploymentErrorMessage("");
        } catch (error) {
            console.error(error.code);
            console.error(error.message);
            setListDeploymentErrorCode(error.code);
            if (error.response && error.response.data && error.response.data.error) {
                console.error(error.response.data.error);
                setListDeploymentErrorMessage(error.response.data.error);
            } else {
                setListDeploymentErrorMessage(error.message);
            }
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getListDeployment();
        console.log(listDeployment)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    console.log(listDeployment)

    return (
        <StyledBox sx={{ flexGrow: 1 }}>
            <Grid style={{ backgroundColor: '#cfb6b6', height: '100vh' }}>
                <Grid style={{ maxHeight: '100%' }}>
                    <DeploymentItem>
                        {listDeploymentErrorCode && <div style={{ color: 'red' }}>Error code: {listDeploymentErrorCode}</div>}
                        {listDeploymentErrorMessage && <div style={{ color: 'red' }}>Error message: {listDeploymentErrorMessage}</div>}
                        {listDeployment.length > 0 ? listDeployment.map((deployment, index) => (
                            <div
                                key={index}
                                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem', backgroundColor: '#add8e6', padding: '1rem', borderRadius: '0.5rem' }}
                            >
                                <Grid size={{ xs: 10 }} style={{ display: 'flex', flexDirection: 'column', textAlign: 'justify' }}>
                                    <div><Link to="#metadata" style={{ margin: '0 1rem'}}>Deployment metadata</Link><Link to="#spec" style={{ margin: '0 1rem'}}>Deployment spec</Link><Link to="#status" style={{ margin: '0 1rem'}}>Deployment status</Link></div>
                                    <div style={{ 'marginTop': '2rem', borderTop: '1px solid #000' }}>
                                        <span id="metadata"><b>Deployment metadata</b></span>
                                        <pre>{JSON.stringify(deployment.metadata, null, 2)}</pre>
                                    </div>
                                    <div style={{ 'marginTop': '2rem', borderTop: '1px solid #000' }}>
                                        <span id="spec"><b>Deployment spec</b></span>
                                        <pre>{JSON.stringify(deployment.spec, null, 2)}</pre>
                                    </div>
                                    <div style={{ 'marginTop': '2rem', borderTop: '1px solid #000' }}>
                                        <span id="status"><b>Deployment status</b></span>
                                        <pre>{JSON.stringify(deployment.status, null, 2)}</pre>
                                    </div>
                                    <div style={{ 'marginTop': '2rem', borderTop: '1px solid #000', width: '100%', display: 'flex', alignItems: 'flex-start' }}>
                                        {/* <Button variant="contained" color="primary" style={{ 'marginTop': '1rem' }}>
                                            <Link to={`/deployment/${deployment.metadata.name}`} style={{ color: '#fff' }}>View deployment</Link>
                                        </Button> */}
                                    </div>
                                </Grid>
                                <Grid size={{ xs: 2 }}>
                                    <Button variant="contained" color="error" onClick={() => deleteDeployment(deploymentName.metadata.name)} disabled={isLoading}>{isLoading ? <CircularProgress color="primary" /> : "Delete"}</Button>
                                </Grid>
                            </div>
                        )) : <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}><span>No deployments found</span></div>}
                    </DeploymentItem>
                </Grid>
            </Grid>
        </StyledBox>
    )
}