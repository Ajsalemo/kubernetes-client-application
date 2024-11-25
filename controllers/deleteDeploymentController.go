package controllers

import (
	"context"
	"fmt"
	"time"

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

	// Check if the parameter is empty - if so, return a 400 for bad request
	if c.Params("deployment") == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Deployment name is required"})
	}

	deploymentName := c.Params("deployment")
	zap.L().Info("User provided deployment name: " + deploymentName)

	deploymentsClient := clientset.AppsV1().Deployments(apiv1.NamespaceDefault)

	deletePolicy := metav1.DeletePropagationForeground
	if err := deploymentsClient.Delete(context.TODO(), deploymentName, metav1.DeleteOptions{
		PropagationPolicy: &deletePolicy,
	}); err != nil {
		zap.L().Error(err.Error())
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	// GC may take some time to delete a Deployment. On the client side, a call to list deployments immediately after deletion may still return the deleted object
	// To ensure that the object is deleted and the returned list is updated for the client, poll Deployments until the object is deleted
	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()
	start := time.Now()
	for {
		select {
		case <-ticker.C:
			zap.L().Info("Polling to check if deployment: " + deploymentName + " is deleted")
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

			elapsed := time.Since(start)
			zap.L().Info("Polling deletion: " + elapsed.String())
			// If the elapsed time is greater than 30 seconds, return a 500
			if elapsed > 30*time.Second {
				zap.L().Info("Elapsed time: " + elapsed.String())
				zap.L().Warn("Deletion took longer than 30 seconds, exiting")
				return c.Status(500).JSON(fiber.Map{"error": "Deletion took longer than 30 seconds"})
			}
			// Check if the deployment still exists
			// This polls at .5 intervals. If the deployment is not found, this will indicate it's been deleted
			// Since k8s GC may take some time to delete a deployment
			if len(getDeployment.Items) == 0 {
				zap.L().Info("Deletion took " + elapsed.String())
				zap.L().Info("Deployment: " + deploymentName + " is not found, Deployment has been deleted")
				zap.L().Info("Deleted deployment " + deploymentName)
				return c.JSON(fiber.Map{"message": "Deleted deployment " + deploymentName})
			}

		}
	}
}
