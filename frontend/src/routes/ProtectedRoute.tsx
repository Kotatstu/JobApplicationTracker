import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() 
{
    const { user, isLoading} = useAuth()

    if (isLoading) 
        return <div className="p-8">Loading</div>

    if (!user)
        return <Navigate to="/login" replace></Navigate>

    return <Outlet></Outlet>
}