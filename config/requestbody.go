package config

type CreateDeploymentStruct struct {
	DeploymentName     string `json:"deploymentName"`
	DeploymentLabel    string `json:"deploymentLabel"`
	ContainerName      string `json:"containerName"`
	ContainerImageName string `json:"containerImageName"`
	ContainerImageTag  string `json:"containerImageTag"`
	ContainerPort      string `json:"containerPort"`
}
