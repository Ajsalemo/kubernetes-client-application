import { useFormik } from "formik";
import Paper from "@mui/material/Paper";
import { Button } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import * as yup from "yup";
import { useState } from 'react';
import axios from 'axios';

export const DeploymentForm = ({ getListDeployments }) => {
    const validationSchema = yup.object({
        deploymentName: yup
            .string("Enter your deployment name")
            .min(2, "Deployment Name should be of minimum 2 characters length")
            .required("Deployment Name is required"),
        deploymentLabel: yup
            .string("Enter your deployment label")
            .min(2, "Deployment Label should be of minimum 2 characters length")
            .required("Password is required"),
        containerName: yup
            .string("Enter your container name")
            .min(2, "Container Name should be of minimum 2 characters length")
            .required("Container Name is required"),
        containerImageName: yup
            .string("Enter your container image name")
            .min(1, "Container Image Name should be of minimum 1 character length")
            .required("Container Image Name is required"),
        containerImageTag: yup
            .string("Enter your container image tag")
            .min(1, "Container Image Tag should be of minimum 1 character length")
            .required("Container Image Tag is required"),
        containerPort: yup
            .number("Enter your container port")
            .required("Container Port is required"),
    });

    const [isLoading, setIsLoading] = useState(false);
    const [listDeploymentsErrorCode, setListDeploymentsErrorCode] = useState("");
    const [listDeploymentsErrorMessage, setListDeploymentsErrorMessage] = useState("");
    const backendApiURL = process.env.REACT_APP_BACKEND_API_URL ?? 'http://localhost:3070';

    const createDeployment = async (values) => {
        try {
            setIsLoading(true);
            // Fetch all Deployment information from k8s
            const res = await axios.post(`${backendApiURL}/api/deployment/create`, values);
            if (res) {
                // Get the updated list of deployments
                await getListDeployments();
                setIsLoading(false);
                console.log(isLoading);
            }
            setListDeploymentsErrorCode("");
            setListDeploymentsErrorMessage("");
        } catch (error) {
            console.error(error.code);
            console.error(error.message);
            console.error(error);
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

    const formik = useFormik({
        initialValues: {
            deploymentName: "",
            deploymentLabel: "",
            containerName: "",
            containerImageName: "",
            containerImageTag: "",
            containerPort: ""
        },
        validationSchema: validationSchema,
        onSubmit: (values) => createDeployment(values)
    });

    return (
        <Paper>
            <form onSubmit={formik.handleSubmit}>
                <TextField
                    fullWidth
                    id="deploymentName"
                    name="deploymentName"
                    label="Deployment Name"
                    value={formik.values.deploymentName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.deploymentName && Boolean(formik.errors.deploymentName)}
                    helperText={formik.touched.deploymentName && formik.errors.deploymentName}
                    style={{ marginBottom: '1rem' }}
                />
                <TextField
                    fullWidth
                    id="deploymentLabel"
                    name="deploymentLabel"
                    label="Deployment Label"
                    value={formik.values.deploymentLabel}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.deploymentLabel && Boolean(formik.errors.deploymentLabel)}
                    helperText={formik.touched.deploymentLabel && formik.errors.deploymentLabel}
                    style={{ marginBottom: '1rem' }}
                />
                <TextField
                    fullWidth
                    id="containerName"
                    name="containerName"
                    label="Container Name"
                    value={formik.values.containerName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.containerName && Boolean(formik.errors.containerName)}
                    helperText={formik.touched.containerName && formik.errors.containerName}
                    style={{ marginBottom: '1rem' }}
                />
                <TextField
                    fullWidth
                    id="containerImageName"
                    name="containerImageName"
                    label="Container Image Name"
                    value={formik.values.containerImageName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.containerImageName && Boolean(formik.errors.containerImageName)}
                    helperText={formik.touched.containerImageName && formik.errors.containerImageName}
                    style={{ marginBottom: '1rem' }}
                />
                <TextField
                    fullWidth
                    id="containerImageTag"
                    name="containerImageTag"
                    label="Container Image Tag"
                    value={formik.values.containerImageTag}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.containerImageTag && Boolean(formik.errors.containerImageTag)}
                    helperText={formik.touched.containerImageTag && formik.errors.containerImageTag}
                    style={{ marginBottom: '1rem' }}
                />
                <TextField
                    fullWidth
                    id="containerPort"
                    name="containerPort"
                    label="Container Port"
                    value={formik.values.containerPort}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.containerPort && Boolean(formik.errors.containerPort)}
                    helperText={formik.touched.containerPort && formik.errors.containerPort}
                    style={{ marginBottom: '1rem' }}
                />
                <Button color="primary" variant="contained" fullWidth type="submit" disabled={isLoading} >
                    {isLoading ? <CircularProgress color="primary" /> : "Submit"}
                </Button>
                {listDeploymentsErrorCode && <div style={{ color: 'red', marginTop: '1rem' }}>Error code: {listDeploymentsErrorCode}</div>}
                {listDeploymentsErrorMessage && <div style={{ color: 'red', marginTop: '1rem' }}>Error message: {listDeploymentsErrorMessage}</div>}
            </form>
        </Paper>
    )
}

