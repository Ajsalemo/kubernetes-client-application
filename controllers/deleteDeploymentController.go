package controllers

import (
	"context"

	config "github.com/Ajsalemo/kubernetes-client-application/config"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func DeleteDeployment(c *fiber.Ctx) error {
	clientset, err := config.KubeConfig()
	if err != nil {
		zap.L().Error(err.Error())
		panic(err)
	}

	var deleteDeploymentStruct = config.DeleteDeploymentStruct{}
	deploymentsClient := clientset.AppsV1().Deployments(apiv1.NamespaceDefault)
	// Parse the request body into the k8sDeploymentName struct
	if err := c.BodyParser(&deleteDeploymentStruct); err != nil {
		zap.L().Error(err.Error())
		return err
	}

	deletePolicy := metav1.DeletePropagationForeground
	if err := deploymentsClient.Delete(context.TODO(), deleteDeploymentStruct.Name, metav1.DeleteOptions{
		PropagationPolicy: &deletePolicy,
	}); err != nil {
		zap.L().Error(err.Error())
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	zap.L().Info("Deleted deployment " + deleteDeploymentStruct.Name)
	return c.JSON(fiber.Map{"message": "Deleted deployment " + deleteDeploymentStruct.Name})
}
