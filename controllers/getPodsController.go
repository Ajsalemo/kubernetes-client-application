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
func GetPods(c *fiber.Ctx) error {
	clientset, err := config.KubeConfig()
	if err != nil {
		zap.L().Error(err.Error())
		panic(err)
	}
	// Check if the parameter is empty - if so, return a 400 for bad request
	if c.Params("pod") == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Name is required"})
	}
	zap.L().Info("User provided deployment name: " + c.Params("deployment"))

	podsClient := clientset.CoreV1().Pods(apiv1.NamespaceDefault)
	listOptions := metav1.ListOptions{
		LabelSelector: fmt.Sprintf("app=%s", c.Params("pod")),
	}

	getPods, err := podsClient.List(context.TODO(), metav1.ListOptions{LabelSelector: listOptions.LabelSelector})

	if err != nil {
		zap.L().Error(err.Error())
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	// Log the deployment names
	for _, d := range getPods.Items {
		zap.L().Info(" * " + d.GetName())
	}
	// If the deployment is not found, return a 404
	if len(getPods.Items) == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Pod or replicas not found"})
	} else {
		return c.JSON(fiber.Map{"pods": getPods.Items})
	}
}
