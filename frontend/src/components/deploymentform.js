import { Button, MenuItem } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup, { useRadioGroup } from "@mui/material/RadioGroup";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import * as yup from "yup";
import { backendApiURL } from "../utils/constants";

const StyledTextField = styled((props) => (
    <TextField
        slotProps={{
            htmlInput: {
                style: {
                    color: "white"
                }
            },
            inputLabel: {
                style: {
                    color: "white"
                }
            }
        }}
        {...props}
    />
))(() => ({
    "& .MuiSelect-select": {
        color: "#fff"
    },
}));

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
        containerRegistryServer: yup
            .string("Enter your container registry server")
            .min(1, "Container Registry Server should be of minimum 1 character length")
            .required("Container Registry Server is required"),
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
        replicaCount: yup
            .number("Enter your replica count")
            .required("Replica count is required"),
        registryUsername: yup.string().when("registryType", {
            is: "private",
            then: () => yup.string("Enter your registry username").required("Registry username is required")
                .min(1, "Registry Username should be of minimum 1 character length")
                .required("Registry Username is required"),
        }),
        registryPassword: yup.string().when("registryType", {
            is: "private",
            then: () => yup.string("Enter your registry password").required("Registry password is required")
                .min(1, "Registry password should be of minimum 1 character length")
                .required("Registry password is required"),
        }),
        cpu: yup
            .number("Enter your CPU value")
            .required("CPU is required"),
        memory: yup
            .number("Enter your memory value")
            .required("Memory is required"),
    });

    const [isLoading, setIsLoading] = useState(false);
    const [listDeploymentsErrorCode, setListDeploymentsErrorCode] = useState("");
    const [listDeploymentsErrorMessage, setListDeploymentsErrorMessage] = useState("");

    const createDeployment = async (values) => {
        try {
            setIsLoading(true);
            // Fetch all Deployment information from k8s
            const res = await axios.post(`${backendApiURL}/api/deployment/create`, values);
            if (res) {
                // Get the updated list of deployments
                await getListDeployments();
                setIsLoading(false);
            }
            setListDeploymentsErrorCode("");
            setListDeploymentsErrorMessage("");
        } catch (error) {
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

    const CustomRadioFormControlLabelComponent = (props) => {
        const radioGroup = useRadioGroup();
        let checked = false;

        if (radioGroup) {
            checked = radioGroup.value === props.value;
        }

        return <FormControlLabel checked={checked} {...props} />
    }

    const cpuOptions = [
        { value: "0.5", label: "0.5" },
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "4", label: "4" },
        { value: "8", label: "8" },
        { value: "16", label: "16" },
    ];

    const memoryOptions = [
        { value: "0.5", label: "0.5" },
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "4", label: "4" },
        { value: "8", label: "8" },
        { value: "16", label: "16" },
    ];

    const formik = useFormik({
        initialValues: {
            deploymentName: "",
            deploymentLabel: "",
            containerName: "",
            containerRegistryServer: "",
            containerImageName: "",
            containerImageTag: "",
            containerPort: "",
            replicaCount: "",
            registryUsername: "",
            registryPassword: "",
            registryServer: "",
            registryType: "public",
            cpu: cpuOptions[0].value,
            memory: memoryOptions[0].value,
        },
        validationSchema: validationSchema,
        onSubmit: (values) => createDeployment(values)
    });

    return (
        <Paper style={{ backgroundColor: "#2c2b3b" }} >
            <form onSubmit={formik.handleSubmit}>
                <StyledTextField
                    fullWidth
                    id="deploymentName"
                    name="deploymentName"
                    label="Deployment Name"
                    value={formik.values.deploymentName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.deploymentName && Boolean(formik.errors.deploymentName)}
                    helperText={formik.touched.deploymentName && formik.errors.deploymentName}
                    style={{ marginBottom: "1rem" }}
                    variant="standard"
                />
                <StyledTextField
                    fullWidth
                    id="deploymentLabel"
                    name="deploymentLabel"
                    label="Deployment Label"
                    value={formik.values.deploymentLabel}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.deploymentLabel && Boolean(formik.errors.deploymentLabel)}
                    helperText={formik.touched.deploymentLabel && formik.errors.deploymentLabel}
                    style={{ marginBottom: "1rem" }}
                    variant="standard"
                />
                <StyledTextField
                    fullWidth
                    id="containerName"
                    name="containerName"
                    label="Container Name"
                    value={formik.values.containerName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.containerName && Boolean(formik.errors.containerName)}
                    helperText={formik.touched.containerName && formik.errors.containerName}
                    style={{ marginBottom: "1rem" }}
                    variant="standard"
                />
                <StyledTextField
                    fullWidth
                    id="containerRegistryServer"
                    name="containerRegistryServer"
                    label="Container Registry Server"
                    placeholder="eg. docker.io"
                    value={formik.values.containerRegistryServer}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.containerRegistryServer && Boolean(formik.errors.containerRegistryServer)}
                    helperText={formik.touched.containerRegistryServer && formik.errors.containerRegistryServer}
                    style={{ marginBottom: "1rem" }}
                    variant="standard"
                />
                <StyledTextField
                    fullWidth
                    id="containerImageName"
                    name="containerImageName"
                    label="Container Image Name"
                    value={formik.values.containerImageName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.containerImageName && Boolean(formik.errors.containerImageName)}
                    helperText={formik.touched.containerImageName && formik.errors.containerImageName}
                    style={{ marginBottom: "1rem" }}
                    variant="standard"
                />
                <StyledTextField
                    fullWidth
                    id="containerImageTag"
                    name="containerImageTag"
                    label="Container Image Tag"
                    value={formik.values.containerImageTag}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.containerImageTag && Boolean(formik.errors.containerImageTag)}
                    helperText={formik.touched.containerImageTag && formik.errors.containerImageTag}
                    style={{ marginBottom: "1rem" }}
                    variant="standard"
                />
                <Grid display="flex" justifyContent="flex-start">
                    <RadioGroup
                        row
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        name="registryType"
                        id="registryType"
                        onBlur={formik.handleBlur}
                        value={formik.values.registryType}
                        onChange={formik.handleChange}
                        defaultValue="public"
                    >
                        <CustomRadioFormControlLabelComponent control={<Radio />} label="Public image" value="public" style={{ color: "#fff" }} />
                        <CustomRadioFormControlLabelComponent control={<Radio />} label="Private image" value="private" style={{ color: "#fff" }} />
                    </RadioGroup>
                </Grid>
                {/* If a private image is used, ask for a username and password for registry authentication */}
                {formik.values.registryType === "private" && <StyledTextField
                    fullWidth
                    id="registryUsername"
                    name="registryUsername"
                    label="Registry Username"
                    value={formik.values.registryUsername}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.registryUsername && Boolean(formik.errors.registryUsername)}
                    helperText={formik.touched.registryUsername && formik.errors.registryUsername}
                    style={{ marginBottom: "1rem" }}
                    variant="standard"
                />}
                {formik.values.registryType === "private" && <StyledTextField
                    fullWidth
                    id="registryPassword"
                    name="registryPassword"
                    label="Registry Password"
                    value={formik.values.registryPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.registryPassword && Boolean(formik.errors.registryPassword)}
                    helperText={formik.touched.registryPassword && formik.errors.registryPassword}
                    style={{ marginBottom: "1rem" }}
                    type="password"
                    variant="standard"
                />}
                <StyledTextField
                    fullWidth
                    id="containerPort"
                    name="containerPort"
                    label="Container Port"
                    value={formik.values.containerPort}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.containerPort && Boolean(formik.errors.containerPort)}
                    helperText={formik.touched.containerPort && formik.errors.containerPort}
                    style={{ marginBottom: "1rem" }}
                    variant="standard"
                />
                <StyledTextField
                    fullWidth
                    id="replicaCount"
                    name="replicaCount"
                    label="Replica Count"
                    value={formik.values.replicaCount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.replicaCount && Boolean(formik.errors.replicaCount)}
                    helperText={formik.touched.replicaCount && formik.errors.replicaCount}
                    style={{ marginBottom: "1rem" }}
                    variant="standard"
                />
                <StyledTextField
                    fullWidth
                    id="cpu"
                    name="cpu"
                    label="CPU"
                    value={formik.values.cpu}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    select={true}
                    error={formik.touched.cpu && Boolean(formik.errors.cpu)}
                    helperText={formik.touched.cpu && formik.errors.cpu}
                    style={{ marginBottom: "1rem", textAlign: "left" }}
                    variant="standard"
                >
                    {cpuOptions.map((cpuOption, index) => (
                        <MenuItem key={index} value={cpuOption.value}>{cpuOption.label}</MenuItem>
                    ))}
                </StyledTextField>
                <StyledTextField
                    fullWidth
                    id="memory"
                    name="memory"
                    label="Memory"
                    value={formik.values.memory}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    select={true}
                    error={formik.touched.memory && Boolean(formik.errors.memory)}
                    helperText={formik.touched.memory && formik.errors.memory}
                    style={{ marginBottom: "1rem", textAlign: "left" }}
                    variant="standard"
                >
                    {memoryOptions.map((memoryOption, index) => (
                        <MenuItem key={index} value={memoryOption.value}>{memoryOption.label}</MenuItem>
                    ))}
                </StyledTextField>
                <Button color="primary" variant="contained" fullWidth type="submit" disabled={isLoading} >
                    {isLoading ? <CircularProgress color="primary" /> : "Submit"}
                </Button>
                {listDeploymentsErrorCode !== "" && <div style={{ color: "red", marginTop: "1rem" }}>Error code: {listDeploymentsErrorCode}</div>}
                {listDeploymentsErrorMessage !== "" && <div style={{ color: "red", marginTop: "1rem" }}>Error message: {listDeploymentsErrorMessage}</div>}
            </form>
        </Paper>
    )
}

