import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Dashboard } from "./dashboard";
import { Deployment } from "./deployment";
import { ListAllPodsForDeployment } from "./listallpodsfordeployment";
import { ScrollToAnchor } from "./scrollToAnchor";

export const RouteBase = () => (
    <BrowserRouter>
        <ScrollToAnchor />
        <Routes>
            <Route path="/" Component={Dashboard} />
            <Route path="/deployment/:deployment" Component={Deployment} />
            <Route path="/deployment/:deployment/pods/:app" Component={ListAllPodsForDeployment} />
        </Routes>
    </BrowserRouter>
)