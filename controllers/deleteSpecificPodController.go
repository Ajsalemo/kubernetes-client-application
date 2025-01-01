package controllers

import (
	"context"

	config "github.com/Ajsalemo/kubernetes-client-application/config"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Delete a specific pod
func DeleteSpecificPod(c *fiber.Ctx) error {
	clientset, err := config.KubeConfig()
	if err != nil {
		zap.L().Error(err.Error())
		panic(err)
	}
	// Check if the parameters are empty - if so, return a 400 for bad request
	if c.Params("pod") == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Pod name is required"})
	}

	zap.L().Info("User provided pod name: " + c.Params("pod"))

	podsClient := clientset.CoreV1().Pods(apiv1.NamespaceDefault)
	podDeleteErr := podsClient.Delete(context.TODO(), c.Params("pod"), metav1.DeleteOptions{})

	if podDeleteErr != nil {
		zap.L().Error(podDeleteErr.Error())
		return c.Status(500).JSON(fiber.Map{"error": podDeleteErr.Error()})
	}

	return c.JSON(fiber.Map{"pods": "Deleted pod " + c.Params("pod")})
}
