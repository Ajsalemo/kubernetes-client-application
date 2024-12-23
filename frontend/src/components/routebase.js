import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Dashboard } from "./dashboard";
import { ScrollToAnchor } from "./scrollToAnchor"
import { Deployment } from "./deployment";

export const RouteBase = () => (
    <BrowserRouter>
        <ScrollToAnchor />
        <Routes>
            <Route path="/" Component={Dashboard} />
            <Route path="/deployment/:deployment" Component={Deployment} />
        </Routes>
    </BrowserRouter>
)