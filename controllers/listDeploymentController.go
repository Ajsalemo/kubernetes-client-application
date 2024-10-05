package controllers

import (
	"context"

	config "github.com/Ajsalemo/kubernetes-client-application/config"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// List all Deployments
func ListDeployments(c *fiber.Ctx) error {
	clientset, err := config.KubeConfig()
	if err != nil {
		zap.L().Error(err.Error())
		panic(err)
	}

	deploymentsClient := clientset.AppsV1().Deployments(apiv1.NamespaceDefault)
	list, err := deploymentsClient.List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		zap.L().Error(err.Error())
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	zap.L().Info("Deployments:")
	for _, d := range list.Items {
		zap.L().Info(" * " + d.Name)
	}

	return c.JSON(fiber.Map{"deployments": list.Items})
}
