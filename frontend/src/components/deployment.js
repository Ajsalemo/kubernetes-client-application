import { Button } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CircularProgress from "@mui/material/CircularProgress";
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import { experimentalStyled as styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from "react-router";
import { useNavigate, useParams } from "react-router-dom";
import { backendApiURL } from "../utils/constants";

export const Deployment = () => {
    const params = useParams();
    const navigate = useNavigate();
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

    const [listDeployment, setListDeployment] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [listDeploymentErrorCode, setListDeploymentErrorCode] = useState("")
    const [listDeploymentErrorMessage, setListDeploymentErrorMessage] = useState("")

    const getDeployment = async () => {
        setIsLoading(true);
        try {
            // Fetch all Deployment information from k8s
            const { data: { deployments } } = await axios.get(`${backendApiURL}/api/deployment/get/${deploymentName}`);
            setListDeployment(deployments);
            setIsLoading(false);
            setListDeploymentErrorCode("");
            setListDeploymentErrorMessage("");
        } catch (error) {
            console.error(error);
            setListDeploymentErrorCode(error.code);
            setListDeploymentErrorMessage(error.message);
            setIsLoading(false);
        }
    }

    const deleteSpecificDeployment = async (deploymentName) => {
        setIsLoading(true);
        try {
            // Fetch all Deployment information from k8s
            const res = await axios.delete(`${backendApiURL}/api/deployment/delete/${deploymentName}`);
            if (res) {
                // Get the updated list of deployments
                await getDeployment();
                setIsLoading(false);
                navigate("/")
            }
            setListDeploymentErrorCode("");
            setListDeploymentErrorMessage("");
        } catch (error) {
            console.error(error);
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
        getDeployment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Box sx={{ flexGrow: 1 }} style={{ backgroundColor: '#cfb6b6', minHeight: '100vh', padding: '1rem' }}>
            <Grid style={{ backgroundColor: '#cfb6b6', height: '100%' }}>
                <Grid>
                    <AppBar position="static" style={{ backgroundColor: '#1A2027' }}>
                        <Toolbar variant="dense">
                            <Typography variant="h6" component="div">
                                <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <DeploymentItem>
                        {listDeploymentErrorCode !== "" && <div style={{ color: 'red' }}>Error code: {listDeploymentErrorCode}</div>}
                        {listDeploymentErrorMessage !== "" && <div style={{ color: 'red' }}>Error message: {listDeploymentErrorMessage}</div>}
                        {isLoading
                            ?
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <CircularProgress color="primary" />
                            </div>
                            :
                            listDeployment.length > 0 ? listDeployment.map((deployment, index) => (
                                <div
                                    key={index}
                                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem', backgroundColor: '#add8e6', padding: '1rem', borderRadius: '0.5rem' }}
                                >
                                    <Grid size={{ xs: 10 }} style={{ display: 'flex', flexDirection: 'column', textAlign: 'justify' }}>
                                        <div>
                                            <Button variant="contained" color="primary" style={{ margin: '0 1rem' }}><Link to="#metadata" style={{ margin: '0 1rem', textDecoration: 'none', color: '#fff' }}>Deployment metadata</Link></Button>
                                            <Button variant="contained" color="primary" style={{ margin: '0 1rem' }}><Link to="#spec" style={{ margin: '0 1rem', textDecoration: 'none', color: '#fff' }}>Deployment spec</Link></Button>
                                            <Button variant="contained" color="primary" style={{ margin: '0 1rem' }}><Link to="#status" style={{ margin: '0 1rem', textDecoration: 'none', color: '#fff' }}>Deployment status</Link></Button>
                                            <Button variant="contained" color="primary" style={{ margin: '0 1rem' }}><Link to={`/deployment/${deployment.metadata.name}/pods/${deployment.spec.template.metadata.labels.app}`} style={{ margin: '0 1rem', textDecoration: 'none', color: '#fff' }}>View pods</Link></Button>
                                        </div>
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
                                    </Grid>
                                    <Grid size={{ xs: 2 }}>
                                        <Button variant="contained" color="error" onClick={() => deleteSpecificDeployment(deployment.metadata.name)} disabled={isLoading}>{isLoading ? <CircularProgress color="primary" /> : "Delete"}</Button>
                                    </Grid>
                                </div>
                            )) : (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}><span>No deployments found</span></div>
                            )
                        }
                    </DeploymentItem>
                    {listDeployment.length > 0 && (
                        <Button variant="contained" color="primary" style={{ margin: '1rem 0 1rem 1rem' }} onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}>Scroll to top</Button>
                    )}
                </Grid>
            </Grid>
        </Box>
    )
}