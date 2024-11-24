package main

import (
	"github.com/Ajsalemo/kubernetes-client-application/config"
	controllers "github.com/Ajsalemo/kubernetes-client-application/controllers"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"go.uber.org/zap"
)

func init() {
	zap.ReplaceGlobals(zap.Must(zap.NewProduction()))
}

func main() {
	app := fiber.New()
	app.Use(cors.New())

	app.Post("/api/deployment/create", controllers.CreateDeployment)
	app.Delete("/api/deployment/delete/:deployment", controllers.DeleteDeployment)
	app.Get("/api/deployment/list", controllers.ListDeployments)
	app.Get("/api/deployment/get/:deployment", controllers.GetDeployments)
	app.Get("/api/pod/get/:pod", controllers.GetPods)
	// Check if .kubeconfig is accessible at startup
	_, kubeErr := config.KubeConfig()
	if kubeErr != nil {
		zap.L().Error(kubeErr.Error())
		panic(kubeErr)
	}

	zap.L().Info("Fiber listening on port 3070")
	err := app.Listen(":3070")

	if err != nil {
		zap.L().Fatal(err.Error())
	}
}
