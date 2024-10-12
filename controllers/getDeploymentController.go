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
func GetDeployments(c *fiber.Ctx) error {
	clientset, err := config.KubeConfig()
	if err != nil {
		zap.L().Error(err.Error())
		panic(err)
	}

	deploymentsClient := clientset.AppsV1().Deployments(apiv1.NamespaceDefault)
	listOptions := metav1.ListOptions{
		LabelSelector: "app=nginx-deployment",
	}
	getDeployment, err := deploymentsClient.List(context.TODO(), metav1.ListOptions{LabelSelector: listOptions.LabelSelector})

	if err != nil {
		zap.L().Error(err.Error())
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	for _, d := range getDeployment.Items {
		zap.L().Info(" * " + d.GetName())
	}

	return c.JSON(fiber.Map{"deployments": getDeployment.Items})
}
