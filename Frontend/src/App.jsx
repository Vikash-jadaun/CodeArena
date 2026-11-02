import {Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import {checkAuth} from "./authSlice"
import { useDispatch,useSelector } from "react-redux";
import { useEffect } from "react";
// import AdminPanel from "./pages/AdminPanel";
// import ProblemPage from "./pages/ProblemPage";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage"
import Admin from "./pages/Admin";
import AdminVideo from "./components/AdminVideo";
import AdminDelete from "./components/AdminDelete"
import AdminUpload from "./components/AdminUpload";
import { ThemeProvider } from "./components/ThemeProvider";

function App(){

  const {isAuthenticated,user,loading}= useSelector((state)=>state.auth)
  const  dispatch=useDispatch()

  useEffect(()=>{
    dispatch(checkAuth())
  },[dispatch]);

 if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  return (
    <ThemeProvider><>
    <Routes>
      <Route path="/" element={isAuthenticated?<Homepage></Homepage>:<Navigate to="/Signup"/>}></Route>
      <Route path="/Login" element={isAuthenticated?<Navigate to="/"/>:<Login></Login>}></Route>
      <Route path="/Signup" element={isAuthenticated?<Navigate to="/"/>:<Signup></Signup>}></Route>
      {/* <Route path="/admin" element={<AdminPanel/>} ></Route>
      <Route path="/problem/:problemId" element={<ProblemPage/>}></Route> */}
      <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
      <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
      <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />
      <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />
      <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />} />
      <Route path="/problem/:problemId" element={<ProblemPage/>}></Route>
      {/* <Route
        path="/admin"
        element={isAuthenticated&&user?.role==='admin'?<AdminPanel/>:<Navigate to="/"/>
      }
      /> */}
    </Routes>
    </></ThemeProvider>
  )
}

export default App;
