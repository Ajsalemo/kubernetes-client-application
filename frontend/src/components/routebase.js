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
            <Route path="/deployment/:deployment" Component={Deployment} />
            <Route path="/deployment/:deployment/pods/:app" Component={ListAllPodsForDeployment} />
            <Route path="/deployment/:deployment/pod/get/:pod" Component={GetPod} />
        </Routes>
    </BrowserRouter>
)