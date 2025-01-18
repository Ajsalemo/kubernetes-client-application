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
import { useNavigate, useSearchParams } from "react-router-dom";
import { backendApiURL } from "../utils/constants";

export const GetPod = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const deploymentName = searchParams.get("name") || "";
    const podName = searchParams.get("pod") || "";
    const podAppLabelName = searchParams.get("label") || "";

    const DeploymentItem = styled(Paper)(({ theme }) => ({
        backgroundColor: "#2c2b3b",
        ...theme.typography.body2,
        padding: theme.spacing(2),
        textAlign: "center",
        color: theme.palette.text.secondary,
        height: "100%",
    }));

    const [getPod, setGetPod] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [getPodErrorCode, setGetPodErrorCode] = useState("")
    const [getPodErrorMessage, setGetPodErrorMessage] = useState("")

    const getSpecificPod = async () => {
        setIsLoading(true);
        try {
            // Fetch all Deployment information from k8s
            const { data: { pods } } = await axios.get(`${backendApiURL}/api/deployment/get/${deploymentName}/pod/${podName}`);
            setGetPod(pods);
            setIsLoading(false);
            setGetPodErrorCode("");
            setGetPodErrorMessage("");
        } catch (error) {
            console.error(error.code);
            console.error(error.message);
            setGetPodErrorCode(error.code);
            setGetPodErrorMessage(error.message);
            setIsLoading(false);
        }
    }

    const deletePod = async () => {
        setIsLoading(true);
        try {
            // Fetch all Deployment information from k8s
            const res = await axios.delete(`${backendApiURL}/api/deployment/pod/delete/${podName}`);
            if (res) {
                // Delete the pod and then navigate back to the `listAllPodsForDeployment` page
                setIsLoading(false);
                navigate(`/deployment/pods?name=${encodeURIComponent(deploymentName)}&label=${encodeURIComponent(podAppLabelName)}`);
            }
            setGetPodErrorCode("");
            setGetPodErrorMessage("");
        } catch (error) {
            console.error(error.code);
            console.error(error.message);
            setGetPodErrorCode(error.code);
            setGetPodErrorMessage(error.message);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getSpecificPod();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Box sx={{ flexGrow: 1 }} style={{ backgroundColor: "#2c2b3b", padding: "1rem" }}>
            <Grid style={{ backgroundColor: "#2c2b3b" }}>
                <Grid style={{ maxHeight: "100%" }}>
                    <AppBar position="static" style={{ backgroundColor: "#2c2b3b" }} elevation={0}>
                        <Toolbar variant="dense">
                            <Typography variant="h6" component="div">
                                <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>Home</Link>
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <DeploymentItem elevation={0}>
                        <div style={{ display: "flex", flexDirection: "column", textAlign: "justify", marginBottom: "4rem", backgroundColor: "#2c2b3b", padding: "1rem", borderRadius: "0.5rem", color: "#f37171" }}>
                            {getPodErrorCode !== "" && <div style={{ color: "red", textAlign: "center" }}>Error code: {getPodErrorCode}</div>}
                            {getPodErrorMessage !== "" && <div style={{ color: "red", textAlign: "center" }}>Error message: {getPodErrorMessage}</div>}
                            {isLoading
                                ?
                                <div style={{ display: "flex", justifyContent: "center", height: "100vh"  }}>
                                    <CircularProgress color="primary" />
                                </div>
                                :
                                getPod.length > 0 ? getPod.map((pod, index) => (
                                    <div
                                        key={index}
                                        style={{ display: "flex", justifyContent: "space-between", marginBottom: "4rem", backgroundColor: "#2c2b3b", padding: "1rem", borderRadius: "0.5rem" }}
                                    >
                                        <Grid size={{ xs: 10 }} style={{ display: "flex", flexDirection: "column", textAlign: "justify" }}>
                                            <div>
                                                <Button variant="contained" color="primary" tyle={{ margin: "0 1rem" }}>
                                                    <Link to={`/deployment?name=${encodeURIComponent(deploymentName)}`} style={{ color: "#fff", textDecoration: "none" }}>View deployment</Link>
                                                </Button>
                                                <Button variant="contained" color="primary" style={{ margin: "0 1rem" }}><Link to={{ pathname: "/pod", search: `?name=${deploymentName}&pod=${podName}&label=${podAppLabelName}`, hash: "#metadata" }} style={{ margin: "0 1rem", textDecoration: "none", color: "#fff" }}>Pod metadata</Link></Button>
                                                <Button variant="contained" color="primary" style={{ margin: "0 1rem" }}><Link to={{ pathname: "/pod", search: `?name=${deploymentName}&pod=${podName}&label=${podAppLabelName}`, hash: "#spec" }} style={{ margin: "0 1rem", textDecoration: "none", color: "#fff" }}>Pod spec</Link></Button>
                                                <Button variant="contained" color="primary" style={{ margin: "0 1rem" }}><Link tto={{ pathname: "/pod", search: `?name=${deploymentName}&pod=${podName}&label=${podAppLabelName}`, hash: "#status" }} style={{ margin: "0 1rem", textDecoration: "none", color: "#fff" }}>Pod status</Link></Button>
                                            </div>
                                            <div style={{ "marginTop": "2rem", borderTop: "1px solid #fff" }}>
                                                <div id="metadata" style={{ "marginTop": "2rem", color: "#fff" }}><b>Pod metadata</b></div>
                                                <pre>{JSON.stringify(pod.metadata, null, 2)}</pre>
                                            </div>
                                            <div style={{ "marginTop": "2rem", borderTop: "1px solid #fff" }}>
                                                <div id="spec" style={{ "marginTop": "2rem", color: "#fff" }}><b>Pod spec</b></div>
                                                <pre>{JSON.stringify(pod.spec, null, 2)}</pre>
                                            </div>
                                            <div style={{ "marginTop": "2rem", borderTop: "1px solid #fff" }}>
                                                <div id="status" style={{ "marginTop": "2rem", color: "#fff" }}><b>Pod status</b></div>
                                                <pre>{JSON.stringify(pod.status, null, 2)}</pre>
                                            </div>
                                        </Grid>
                                        <Grid size={{ xs: 2 }}>
                                            <Button variant="contained" color="error" onClick={() => deletePod()} disabled={isLoading}>{isLoading ? <CircularProgress color="primary" /> : "Delete"}</Button>
                                        </Grid>
                                    </div>)) : (
                                    <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#fff" }}><span>No pod found</span></div>
                                )
                            }
                        </div>
                    </DeploymentItem>
                    {getPod.length > 0 && (
                        <Button variant="contained" color="primary" style={{ margin: "1rem 0 1rem 1rem" }} onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" })}>Scroll to top</Button>
                    )}
                </Grid>
            </Grid>
        </Box>
    )
}