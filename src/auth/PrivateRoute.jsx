import { Navigate, Outlet } from "react-router-dom";
import { isLoggedIn } from "./auth";

const PrivateRoute =()=>{

    if(isLoggedIn()){
        return <Outlet/>
    }else{
        return <Navigate to={"/login"}/>
    }
}

export default PrivateRoute;