package controllers

import (
	"context"
	"strconv"

	config "github.com/Ajsalemo/kubernetes-client-application/config"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func CreateDeployment(c *fiber.Ctx) error {
	clientset, err := config.KubeConfig()
	if err != nil {
		zap.L().Error(err.Error())
		panic(err)
	}

	var createDeploymentStruct = config.CreateDeploymentStruct{}
	deploymentsClient := clientset.AppsV1().Deployments(apiv1.NamespaceDefault)
	// Parse the request body into the createDeploymentStruct struct
	if err := c.BodyParser(&createDeploymentStruct); err != nil {
		zap.L().Error(err.Error())
		return err
	}

	containerPort, err := strconv.ParseInt(createDeploymentStruct.ContainerPort, 10, 32)
	if err != nil {
		zap.L().Error(err.Error())
		return err
	}

	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name: createDeploymentStruct.DeploymentName,
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: config.Int32Ptr(1),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app": createDeploymentStruct.DeploymentLabel,
				},
			},
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"app": createDeploymentStruct.DeploymentLabel,
					},
				},
				Spec: apiv1.PodSpec{
					Containers: []apiv1.Container{
						{
							Name:  createDeploymentStruct.ContainerName,
							Image: createDeploymentStruct.ContainerImageName + ":" + createDeploymentStruct.ContainerImageTag,
							Ports: []apiv1.ContainerPort{
								{
									Name:          "http",
									Protocol:      apiv1.ProtocolTCP,
									ContainerPort: int32(containerPort),
								},
							},
						},
					},
				},
			},
		},
	}

	// Create Deployment
	zap.L().Info("Creating deployment " + createDeploymentStruct.DeploymentName)
	result, err := deploymentsClient.Create(context.TODO(), deployment, metav1.CreateOptions{})
	if err != nil {
		zap.L().Error(err.Error())
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	zap.L().Info("Created deployment " + result.GetObjectMeta().GetName())
	return c.JSON(fiber.Map{"message": "Created deployment " + result.GetObjectMeta().GetName()})
}
