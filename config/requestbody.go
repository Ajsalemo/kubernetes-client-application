package config

type CreateDeploymentStruct struct {
	DeploymentName          string `json:"deploymentName"`
	DeploymentLabel         string `json:"deploymentLabel"`
	ContainerName           string `json:"containerName"`
	ContainerRegistryServer string `json:"containerRegistryServer"`
	ContainerImageName      string `json:"containerImageName"`
	ContainerImageTag       string `json:"containerImageTag"`
	ContainerPort           string `json:"containerPort"`
	ReplicaCount            string `json:"replicaCount"`
	RegistryType            string `json:"registryType"`
	RegistryUsername        string `json:"registryUsername"`
	RegistryPassword        string `json:"registryPassword"`
	CPU                     string `json:"cpu"`
	Memory                  string `json:"memory"`
}
