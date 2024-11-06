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
    const [listDeploymentsError, setListDeploymentsError] = useState("")

    useEffect(() => {
        const getListDeployments = async() => {
            try {
                // Fetch all Deployment information from k8s
                const response = await axios.get('http://localhost:3070/api/deployment/list');
                console.log(response.data);
                setListDeployments(response.data.deployments);
                console.log(listDeployments);
            } catch (error) {
                console.error(error);
                console.error(error.response.data.error);
                if (error.response.data && error.response.data.error) {
                    setListDeploymentsError(error.response.data.error);
                }
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
                    {/* {listDeploymentsError && <Item>{listDeploymentsError}</Item>} */}

                    {listDeployments.map((deployment, index) => (
                        <Item key={index}>
                            Deployment name: {deployment.metadata.name}
                            Replica count: {deployment.spec.replicas}
                            terminationGracePeriodSeconds: {deployment.spec.terminationGracePeriodSeconds}
                            {deployment.spec.template.spec.containers.map((container, index) => (
                                <div key={index}>
                                    Container name: {container.name}
                                    Image: {container.image}
                                    Ports: {container.ports.map((port, index) => (
                                        <div key={index}>
                                            Container Port: {port.containerPort}
                                            Protocol: {port.protocol}
                                        </div>
                                    ))}
                                    CPU (limit): {container.resources.limits.cpu}
                                    Memory (limit): {container.resources.limits.memory}
                                </div>
                            ))}
                        </Item>
                    ))}
                </Grid>
            </StyledGrid>
        </StyledBox>
    );
}

