import { createBrowserRouter } from "react-router-dom";
import Layout from "@/components/shared/Layout";
import Dashboard from "@/features/dashboard/Dashboard";
import ApplyForm from "@/features/applications/ApplyForm";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true, // This makes the Dashboard the default "/" route
                element: <Dashboard />,
            },
            {
                path: "apply",
                element: <ApplyForm />,
            },
        ],
    },
]);