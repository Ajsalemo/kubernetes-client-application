package controllers

import (
	"context"
	"time"

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

	podName := c.Params("pod")

	zap.L().Info("User provided pod name: " + podName)

	podsClient := clientset.CoreV1().Pods(apiv1.NamespaceDefault)
	podDeleteErr := podsClient.Delete(context.TODO(), podName, metav1.DeleteOptions{})

	if podDeleteErr != nil {
		zap.L().Error(podDeleteErr.Error())
		return c.Status(500).JSON(fiber.Map{"error": podDeleteErr.Error()})
	}

	// Since k8s will create a pod right after the delete event - it may look like 2 pods are returned in a list, since 1 is deleting and 1 is replacing the deleted one
	// As a one of other potential solutions, use a loop to watch until the pod is completely removed before returning a response
	//
	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()
	start := time.Now()
	for {
		select {
		case <-ticker.C:
			zap.L().Info("Polling to check if pod: " + podName + " is deleted")

			_, err := podsClient.Get(context.TODO(), podName, metav1.GetOptions{})
			if err != nil {
				if err.Error() == "pods \""+podName+"\" not found" {
					zap.L().Info("Pod: " + podName + " has been deleted")
					return c.JSON(fiber.Map{"pods": "Deleted pod " + podName})
				} else {
					zap.L().Error(err.Error())
					return c.Status(500).JSON(fiber.Map{"error": err.Error()})
				}
			} else {
				zap.L().Info("Pod: " + podName + " is still pending deletion")
			}

			elapsed := time.Since(start)
			zap.L().Info("Polling deletion: " + elapsed.String())
			// If the elapsed time is greater than 30 seconds, return a 500
			if elapsed > 30*time.Second {
				zap.L().Info("Elapsed time: " + elapsed.String())
				zap.L().Warn("Deletion took longer than 30 seconds, exiting")
				return c.Status(500).JSON(fiber.Map{"error": "Deletion took longer than 30 seconds"})
			}

		}
	}
}
