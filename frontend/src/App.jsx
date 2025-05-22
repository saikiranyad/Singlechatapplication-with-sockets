// import Chatui from "./Pages/Chatui"
// import Loginpage from "./Pages/Loginpage"
// import Signup from "./Pages/Signup"
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Update from "./Pages/Update";


// function App() {
 
//   return (
//   <>
//   <BrowserRouter>
//   <Routes>
//     <Route path='/' element={<Chatui/>}/>
//     <Route path='/login' element={<Loginpage/>}/>
//     <Route path='/signup' element={<Signup/>}/>
//     <Route path='/update' element={<Update/>}/>
//   </Routes>
//   </BrowserRouter>
//   </>
//   )
// }

// export default App
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Chatui from "./Pages/Chatui";
import Loginpage from "./Pages/Loginpage";
import Signup from "./Pages/Signup";
import Update from "./Pages/Update";
import { useGetMeQuery } from "./redux/Api/userApi";

const ProtectedRoute = () => {
  const { data, isLoading, isError } = useGetMeQuery();

  if (isLoading) return <div className="p-5">Checking authentication...</div>;

  // if auth failed (user not logged in)
  if (isError || !data?.user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Loginpage />} />
        <Route path="/signup" element={<Signup />} />


        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Chatui />} />
          <Route path="/update" element={<Update />} />
        </Route>


        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
