package config

import (
	"context"

	"go.uber.org/zap"

	containerd "github.com/containerd/containerd/v2/client"
	"github.com/containerd/containerd/v2/core/remotes/docker"
	"github.com/containerd/containerd/v2/pkg/namespaces"
)

func ContainerdClient() (*containerd.Client, context.Context, error) {
	client, err := containerd.New("/run/containerd/containerd.sock")
	ctx := namespaces.WithNamespace(context.Background(), "default")

	return client, ctx, err
}

// Function to pull authenticated images
// The primary difference here is the use of `Resolver` to handle authentication
func PullAuthenticatedImage(imageDefinition CreateDeploymentStruct) error {
	client, ctx, err := ContainerdClient()
	resolver := docker.NewResolver(docker.ResolverOptions{
		Credentials: func(host string) (string, string, error) {
			return imageDefinition.RegistryUsername, imageDefinition.RegistryPassword, nil
		},
	})

	if err != nil {
		zap.L().Error("An error occurred when trying to use the containerd client..")
		zap.L().Error(err.Error())
		return err
	}

	image, err := client.Pull(ctx, imageDefinition.ContainerRegistryServer+"/"+imageDefinition.ContainerImageName+":"+imageDefinition.ContainerImageTag, containerd.WithPullUnpack, containerd.WithResolver(resolver))

	if err != nil {
		zap.L().Error("An error occurred when trying to pull an authenticated image..")
		zap.L().Error(err.Error())
		return err
	}

	zap.L().Info("Succesfully pulled image " + image.Name())

	return err
}
