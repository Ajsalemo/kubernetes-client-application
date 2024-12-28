package controllers

import (
	"context"
	"fmt"

	config "github.com/Ajsalemo/kubernetes-client-application/config"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Get a specific deployment
func GetDeployments(c *fiber.Ctx) error {
	clientset, err := config.KubeConfig()
	if err != nil {
		zap.L().Error(err.Error())
		panic(err)
	}
	// Check if the parameter is empty - if so, return a 400 for bad request
	if c.Params("deployment") == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Deployment name is required"})
	}

	deploymentName := c.Params("deployment")
	zap.L().Info("User provided deployment name: " + deploymentName)

	deploymentsClient := clientset.AppsV1().Deployments(apiv1.NamespaceDefault)
	listOptions := metav1.ListOptions{
		FieldSelector: fmt.Sprintf("metadata.name=%s", deploymentName),
	}
	getDeployment, err := deploymentsClient.List(context.TODO(), metav1.ListOptions{FieldSelector: listOptions.FieldSelector})

	if err != nil {
		zap.L().Error(err.Error())
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	// Log the deployment names
	for _, d := range getDeployment.Items {
		zap.L().Info(" * " + d.GetName())
	}

	return c.JSON(fiber.Map{"deployments": getDeployment.Items})
}
