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
	secretClient := clientset.CoreV1().Secrets(apiv1.NamespaceDefault)
	deletePolicy := metav1.DeletePropagationForeground

	// If a secret exists for the deployment, delete it - this infers that the deployment is using a private registry
	getSecret, err := secretClient.Get(context.TODO(), fmt.Sprintf("%s-image-pull-secret", deploymentName), metav1.GetOptions{})
	// If error is `nil`, the secret exists and we should delete it
	if err == nil {
		zap.L().Info("ImagePullSecrets: " + getSecret.GetName() + " found for deployment: " + deploymentName)
		zap.L().Info("Deleting ImagePullSecrets: " + getSecret.GetName())
		if err := secretClient.Delete(context.TODO(), fmt.Sprintf("%s-image-pull-secret", deploymentName), metav1.DeleteOptions{}); err != nil {
			zap.L().Error(err.Error())
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		zap.L().Info("Deleted ImagePullSecrets: " + getSecret.GetName() + " for deployment: " + deploymentName)
	} else {
		// If the error is not `nil`, the secret does not exist and this will infer a public registry was used
		if err.Error() == "secrets \""+deploymentName+"-image-pull-secret\" not found" {
			zap.L().Info("No ImagePullSecrets found for deployment: " + deploymentName)
			// Otherwise, return a 500 for any other error since this should indicate an actual error has occurred
		} else {
			zap.L().Error(err.Error())
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
	}

	// Delete the deployment
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
			// Create a Secret client to list secrets
			secretListOptions := metav1.ListOptions{
				FieldSelector: fmt.Sprintf("metadata.name=%s", fmt.Sprintf("%s-image-pull-secret", deploymentName)),
			}

			listSecrets, err := secretClient.List(context.TODO(), metav1.ListOptions{FieldSelector: secretListOptions.FieldSelector})
			if err != nil {
				zap.L().Error(err.Error())
				return c.Status(500).JSON(fiber.Map{"error": err.Error()})
			}
			zap.L().Info("Secrets found: " + fmt.Sprint(len(listSecrets.Items)))
			// If the length of the listSecrets is 0, log that no secrets were found
			if (len(listSecrets.Items)) == 0 {
				zap.L().Info("No ImagePullSecrets found for deployment: " + deploymentName + " - Number of ImagePullSecrets: " + fmt.Sprint(len(listSecrets.Items)))
			} else {
				zap.L().Info("ImagePullSecrets found for deployment: " + deploymentName + " - Number of ImagePullSecrets: " + fmt.Sprint(len(listSecrets.Items)))
				// Log the Secret names
				for _, s := range listSecrets.Items {
					zap.L().Info(" * " + s.GetName())
				}
			}
			// Create a deployment client to list deployments
			deploymentsClient := clientset.AppsV1().Deployments(apiv1.NamespaceDefault)
			deploymentListOptions := metav1.ListOptions{
				FieldSelector: fmt.Sprintf("metadata.name=%s", deploymentName),
			}
			getDeployment, err := deploymentsClient.List(context.TODO(), metav1.ListOptions{FieldSelector: deploymentListOptions.FieldSelector})
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
			// If the elapsed time is greater than 60 seconds, return a 500
			if elapsed > 60*time.Second {
				zap.L().Info("Elapsed time: " + elapsed.String())
				zap.L().Warn("Deletion took longer than 30 seconds, exiting")
				return c.Status(500).JSON(fiber.Map{"error": "Deletion took longer than 30 seconds"})
			}
			// Check if the deployment still exists
			// This polls at .5 intervals. If the deployment is not found, this will indicate it's been deleted
			// Since k8s GC may take some time to delete a deployment
			// Secrets deletion is normally faster - we want both the deployment and associated image pull secret to be deleted
			if len(getDeployment.Items) == 0 && len(listSecrets.Items) == 0 {
				zap.L().Info("Deletion took " + elapsed.String())
				zap.L().Info("Deployment: " + deploymentName + " is not found, Deployment has been deleted. Deployment items is " + fmt.Sprint(len(getDeployment.Items)))
				zap.L().Info("Secret: " + getSecret.GetName() + " is not found, Secret has been deleted. Secret items is " + fmt.Sprint(len(listSecrets.Items)))
				zap.L().Info("Deleted deployment " + deploymentName)
				zap.L().Info("Deleted secret " + getSecret.GetName())
				return c.JSON(fiber.Map{"message": "Deleted deployment " + deploymentName})
			}

		}
	}
}
