package main

import (
	controllers "github.com/Ajsalemo/kubernetes-client-application/controllers"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

func init() {
	zap.ReplaceGlobals(zap.Must(zap.NewProduction()))

}

func main() {
	app := fiber.New()

	app.Get("/api/deployment/create", controllers.CreateDeployment)
	app.Get("/api/deployment/delete", controllers.DeleteDeployment)
	app.Get("/api/deployment/list", controllers.ListDeployments)

	zap.L().Info("Fiber listening on port 3000")
	err := app.Listen(":3000")

	if err != nil {
		zap.L().Fatal(err.Error())
	}
}
