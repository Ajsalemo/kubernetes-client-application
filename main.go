package main

import (
	"context"
	"path/filepath"

	"go.uber.org/zap"
	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

func init() {
	zap.ReplaceGlobals(zap.Must(zap.NewProduction()))
}

func int32Ptr(i int32) *int32 { return &i }

func createDeployment(clientset *kubernetes.Clientset) {
	deploymentsClient := clientset.AppsV1().Deployments(apiv1.NamespaceDefault)

	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name: "demo-deployment",
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: int32Ptr(1),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app": "demo",
				},
			},
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"app": "demo",
					},
				},
				Spec: apiv1.PodSpec{
					Containers: []apiv1.Container{
						{
							Name:  "nginx",
							Image: "nginx:latest",
							Ports: []apiv1.ContainerPort{
								{
									Name:          "http",
									Protocol:      apiv1.ProtocolTCP,
									ContainerPort: 80,
								},
							},
						},
					},
				},
			},
		},
	}

	// Create Deployment
	zap.L().Info("Creating deployment")
	result, err := deploymentsClient.Create(context.TODO(), deployment, metav1.CreateOptions{})
	if err != nil {
		zap.L().Error(err.Error())
		panic(err)
	}
	zap.L().Info("Created deployment " + result.GetObjectMeta().GetName())
}

func main() {
	var kubeconfig string
	// Point to the kubeconfig file
	if home := homedir.HomeDir(); home != "" {
		kubeconfig = filepath.Join(home, ".kube", "config")
		zap.L().Info("kubeconfig location is set to " + kubeconfig)
	} else {
		zap.L().Error("kubeconfig location is not set")
	}

	config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		zap.L().Error(err.Error())
		panic(err)
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		zap.L().Error(err.Error())
		panic(err)
	}

	createDeployment(clientset)
}
