package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"

	config "github.com/Ajsalemo/kubernetes-client-application/config"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func CreateDeployment(c *fiber.Ctx) error {
	var secretData []byte
	clientset, err := config.KubeConfig()
	if err != nil {
		zap.L().Error(err.Error())
		panic(err)
	}

	var createDeploymentStruct = config.CreateDeploymentStruct{}
	deploymentsClient := clientset.AppsV1().Deployments(apiv1.NamespaceDefault)
	// Parse the request body into the createDeploymentStruct struct
	if err := c.BodyParser(&createDeploymentStruct); err != nil {
		zap.L().Error(err.Error())
		return err
	}
	// If the deployment is using a private registry, create a secret for the registry
	// Image pull secrets are required for private registries - we create a k8s secret to store the credentials and then reference it in ImagePullSecrets for the PodSpec
	// https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/#create-a-secret-by-providing-credentials-on-the-command-line
	if createDeploymentStruct.RegistryType == "private" {
		conf := config.DockerRegistryConfig{
			Auths: map[string]config.DockerRegistryAuth{
				createDeploymentStruct.ContainerRegistryServer: {
					Username: createDeploymentStruct.RegistryUsername,
					Password: createDeploymentStruct.RegistryPassword,
				},
			},
		}
		secretData, _ = json.Marshal(conf)
		// Create the secret object
		secret := &apiv1.Secret{
			ObjectMeta: metav1.ObjectMeta{
				Name: fmt.Sprintf("%s-image-pull-secret", createDeploymentStruct.DeploymentName),
			},
			Type: "kubernetes.io/dockerconfigjson",
			Data: map[string][]byte{".dockerconfigjson": []byte(secretData)},
		}

		// Create the Secret used for image pulls with private registries
		_, secretErr := clientset.CoreV1().Secrets(apiv1.NamespaceDefault).Create(context.TODO(), secret, metav1.CreateOptions{})
		if secretErr != nil {
			zap.L().Error(secretErr.Error())
			return c.Status(500).JSON(fiber.Map{"error": secretErr.Error()})
		}

		zap.L().Info("Created secret " + secret.ObjectMeta.Name)
	}
	// Convert containerPort from a string to int32
	containerPort, err := strconv.ParseInt(createDeploymentStruct.ContainerPort, 10, 32)
	if err != nil {
		zap.L().Error(err.Error())
		return err
	}
	// Convert replicaCount from a string to int32
	replicaCount, err := strconv.ParseInt(createDeploymentStruct.ReplicaCount, 10, 32)
	if err != nil {
		zap.L().Error(err.Error())
		return err
	}

	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name: createDeploymentStruct.DeploymentName,
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: config.Int32Ptr(int32(replicaCount)),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app":   createDeploymentStruct.DeploymentLabel,
					"owner": createDeploymentStruct.DeploymentName,
				},
			},
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"app":   createDeploymentStruct.DeploymentLabel,
						"owner": createDeploymentStruct.DeploymentName,
					},
				},
				Spec: apiv1.PodSpec{
					Containers: []apiv1.Container{
						{
							Name:  createDeploymentStruct.ContainerName,
							Image: createDeploymentStruct.ContainerRegistryServer + "/" + createDeploymentStruct.ContainerImageName + ":" + createDeploymentStruct.ContainerImageTag,
							Ports: []apiv1.ContainerPort{
								{
									Name:          "http",
									Protocol:      apiv1.ProtocolTCP,
									ContainerPort: int32(containerPort),
								},
							},
						},
					},
				},
			},
		},
	}
	// If the deployment is using a private registry, add the image pull secret to the deployment
	// Otherwise, this isn't added as this is an optional field and will be assumed a public registry is used
	if createDeploymentStruct.RegistryType == "private" {
		deployment.Spec.Template.Spec.ImagePullSecrets = []apiv1.LocalObjectReference{{Name: fmt.Sprintf("%s-image-pull-secret", createDeploymentStruct.DeploymentName)}}
	}

	// Create Deployment
	zap.L().Info("Creating deployment " + createDeploymentStruct.DeploymentName)
	result, err := deploymentsClient.Create(context.TODO(), deployment, metav1.CreateOptions{})
	if err != nil {
		zap.L().Error(err.Error())
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	zap.L().Info("Created deployment " + result.GetObjectMeta().GetName())
	return c.JSON(fiber.Map{"message": "Created deployment " + result.GetObjectMeta().GetName()})
}
