package controllers

import (
	"context"

	config "github.com/Ajsalemo/kubernetes-client-application/config"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Get a specific deployment
func GetPods(c *fiber.Ctx) error {
	clientset, err := config.KubeConfig()
	if err != nil {
		zap.L().Error(err.Error())
		panic(err)
	}
	// Check if the parameters are empty - if so, return a 400 for bad request
	if c.Params("label") == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Label name is required"})
	}
	// Check if the parameters are empty - if so, return a 400 for bad request
	if c.Params("deployment") == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Deployment name is required"})
	}
	zap.L().Info("User provided deployment name: " + c.Params("deployment"))
	zap.L().Info("User provided label name: " + c.Params("label"))

	podsClient := clientset.CoreV1().Pods(apiv1.NamespaceDefault)
	labelSelector := metav1.LabelSelector{MatchLabels: map[string]string{"app": c.Params("label"), "owner": c.Params("deployment")}}
	listOptions := metav1.ListOptions{LabelSelector: metav1.FormatLabelSelector(&labelSelector)}

	getPods, err := podsClient.List(context.TODO(), listOptions)

	if err != nil {
		zap.L().Error(err.Error())
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	// Log the pod names
	for _, d := range getPods.Items {
		zap.L().Info(" * " + d.GetName())
	}

	return c.JSON(fiber.Map{"pods": getPods.Items})
}
