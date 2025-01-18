import { Button } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import { experimentalStyled as styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useSearchParams } from "react-router-dom";
import { backendApiURL } from "../utils/constants";

export const ListAllPodsForDeployment = () => {
    const [searchParams] = useSearchParams();
    const deploymentName = searchParams.get("name") || "";
    const podAppLabelName = searchParams.get("label") || "";

    const DeploymentItem = styled(Paper)(({ theme }) => ({
        ...theme.typography.body2,
        padding: theme.spacing(2),
        textAlign: "center",
        color: theme.palette.text.secondary,
        backgroundColor: "#2c2b3b",
        height: "100%",
    }));

    const [listAllPodsForDeployment, setListAllPodsForDeployment] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingForDeletion, setIsLoadingForDeletion] = useState({});
    const [listAllPodsForDeploymentErrorCode, setListAllPodsForDeploymentErrorCode] = useState("")
    const [listAllPodsForDeploymentErrorMessage, setListAllPodsForDeploymentErrorMessage] = useState("")

    const getAllPodsForDeployment = async () => {
        setIsLoading(true);
        try {
            // Fetch all Deployment information from k8s
            const { data: { pods } } = await axios.get(`${backendApiURL}/api/deployment/list/${deploymentName}/pods/${podAppLabelName}`);
            setListAllPodsForDeployment(pods);
            setIsLoading(false);
            setListAllPodsForDeploymentErrorCode("");
            setListAllPodsForDeploymentErrorMessage("");
        } catch (error) {
            console.error(error.code);
            console.error(error.message);
            setListAllPodsForDeploymentErrorCode(error.code);
            setListAllPodsForDeploymentErrorMessage(error.message);
            setIsLoading(false);
        }
    }

    const deletePod = async (podName) => {
        setIsLoadingForDeletion({ ...isLoadingForDeletion, [podName]: true });
        try {
            // Fetch all Deployment information from k8s
            const res = await axios.delete(`${backendApiURL}/api/deployment/pod/delete/${podName}`);
            if (res) {
                // Delete the pod and then refresh the list of pods
                await getAllPodsForDeployment();
                setIsLoadingForDeletion({ ...isLoadingForDeletion, [podName]: false });
            }
            setListAllPodsForDeploymentErrorCode("");
            setListAllPodsForDeploymentErrorMessage("");
        } catch (error) {
            console.error(error.code);
            console.error(error.message);
            setListAllPodsForDeploymentErrorCode(error.code);
            setListAllPodsForDeploymentErrorMessage(error.message);
            setIsLoadingForDeletion({ ...isLoadingForDeletion, [podName]: false });
        }
    }

    useEffect(() => {
        getAllPodsForDeployment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Box sx={{ flexGrow: 1 }} style={{ backgroundColor: "#2c2b3b", padding: "1rem" }}>
            <Grid style={{ backgroundColor: "#2c2b3b", height: "100%" }}>
                <Grid style={{ minHeight: "100%" }}>
                    <AppBar position="static" style={{ backgroundColor: "#2c2b3b" }}>
                        <Toolbar variant="dense">
                            <Typography variant="h6" component="div">
                                <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>Home</Link>
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <DeploymentItem>
                        <div style={{ display: "flex", flexDirection: "column", marginBottom: "4rem", backgroundColor: "#2c2b3b", padding: "1rem", borderRadius: "0.5rem", color: "#f37171" }}>
                            {listAllPodsForDeploymentErrorCode !== "" && <div style={{ color: "red" }}>Error code: {listAllPodsForDeploymentErrorCode}</div>}
                            {listAllPodsForDeploymentErrorMessage !== "" && <div style={{ color: "red" }}>Error message: {listAllPodsForDeploymentErrorMessage}</div>}
                            {isLoading
                                ?
                                <div style={{ display: "flex", justifyContent: "center", height: "100vh" }}>
                                    <CircularProgress color="primary" />
                                </div>
                                :
                                listAllPodsForDeployment.length > 0 ? listAllPodsForDeployment.map((pod, index) => (
                                    <div key={index} style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", margin: "1rem 0", width: "100%", borderBottom: "1px solid #fff" }}>
                                        <Grid size={{ xs: 10 }} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                            <Button variant="contained" color="primary" style={{ margin: "0 1rem" }}><Link to={`/pod?name=${encodeURIComponent(deploymentName)}&pod=${encodeURIComponent(pod.metadata.name)}&label=${encodeURIComponent(podAppLabelName)}`} style={{ margin: "0 1rem", textDecoration: "none", color: "#fff" }}>{pod.metadata.name}</Link></Button>
                                            <Grid style={{ textAlign: "left" }}>
                                                <pre>{JSON.stringify(pod.status, null, 2)}</pre>
                                            </Grid>
                                        </Grid>
                                        <Grid size={{ xs: 2 }} style={{ alignSelf: "flex-start" }}>
                                            <Button variant="contained" color="error" onClick={() => deletePod(pod.metadata.name)} disabled={isLoadingForDeletion[pod.metadata.name]}>{isLoadingForDeletion[pod.metadata.name] ? <CircularProgress color="primary" /> : "Delete"}</Button>
                                        </Grid>
                                    </div>
                                )) : (
                                    <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#fff" }}><span>No pods found</span></div>
                                )
                            }
                        </div>
                    </DeploymentItem>
                    {listAllPodsForDeployment.length > 0 && (
                        <Button variant="contained" color="primary" style={{ margin: "1rem 0 1rem 1rem" }} onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" })}>Scroll to top</Button>
                    )}
                </Grid>
            </Grid>
        </Box>
    )
}