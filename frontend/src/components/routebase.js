import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Dashboard } from "./dashboard";
import { Deployment } from "./deployment";
import { GetPod } from "./getpod";
import { ListAllPodsForDeployment } from "./listallpodsfordeployment";
import { ScrollToAnchor } from "./scrollToAnchor";

export const RouteBase = () => (
    <BrowserRouter>
        <ScrollToAnchor />
        <Routes>
            <Route path="/" Component={Dashboard} />
            <Route path="/deployment" Component={Deployment} />
            <Route path="/deployment/pods/" Component={ListAllPodsForDeployment} />
            <Route path="/pod" Component={GetPod} />
        </Routes>
    </BrowserRouter>
)