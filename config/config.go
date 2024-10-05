package config

import (
	"path/filepath"

	"go.uber.org/zap"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

func Int32Ptr(i int32) *int32 { return &i }

func KubeConfig() (*kubernetes.Clientset, error) {
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

	return clientset, err
}
