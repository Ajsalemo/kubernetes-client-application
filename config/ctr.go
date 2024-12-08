package config

import (
	"context"

	"go.uber.org/zap"

	containerd "github.com/containerd/containerd/v2/client"
	"github.com/containerd/containerd/v2/core/remotes"
	"github.com/containerd/containerd/v2/pkg/namespaces"
)

type ImageDefintion struct {
	Registry         string `json:"registry"`
	Image            string `json:"image"`
	Tag              string `json:"tag"`
	IsPublic         *bool  `json:"isPublic"`
	RegistryUsername string `json:"registryUsername"`
	RegistryPassword string `json:"registryPassword"`
	ContainerName    string `json:"containerName"`
}

func ContainerdClient() (*containerd.Client, context.Context, error) {
	client, err := containerd.New("/run/containerd/containerd.sock")
	ctx := namespaces.WithNamespace(context.Background(), "default")

	return client, ctx, err
}

// Function to pull authenticated images
// The primary difference here is the use of `Resolver` to handle authentication
func PullAuthenticatedImage(imageDefinition ImageDefintion, resolver remotes.Resolver) error {
	client, ctx, err := ContainerdClient()

	if err != nil {
		zap.L().Error("An error occurred when trying to use the containerd client..")
		zap.L().Error(err.Error())
		return err
	}

	image, err := client.Pull(ctx, imageDefinition.Registry+"/"+imageDefinition.Image+":"+imageDefinition.Tag, containerd.WithPullUnpack, containerd.WithResolver(resolver))

	if err != nil {
		zap.L().Error("An error occurred when trying to pull an authenticated image..")
		zap.L().Error(err.Error())
		return err
	}

	zap.L().Info("Succesfully pulled image " + image.Name())

	return err
}

// Function to pull public images
// No authentication
func PullPublicImage(imageDefinition ImageDefintion) error {
	client, ctx, err := ContainerdClient()
	if err != nil {
		zap.L().Error("An error occurred when trying to use the containerd client..")
		zap.L().Error(err.Error())
		return err
	}

	image, err := client.Pull(ctx, imageDefinition.Registry+"/"+imageDefinition.Image+":"+imageDefinition.Tag, containerd.WithPullUnpack)

	if err != nil {
		zap.L().Error("An error occurred when trying to pull a public image..")
		return err
	}

	zap.L().Info("Succesfully pulled image " + image.Name())

	return err
}
