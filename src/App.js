import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login/Login';
import SignUp from './components/SignUp/SignUp';
import { ToastContainer } from 'react-toastify';
import PrivateRoute from './auth/PrivateRoute';
import Dashboard from './components/Dashboard/Dashboard';
import Inventory from './components/Inventory/Inventory';
import Home from './components/Home/Home';
import Collection from './components/Collection/Collection';
import Game from './components/Game/Game';
import PvP from './components/PvP/PvP';

function App() {
  return (
    <BrowserRouter>
    <ToastContainer position='bottom-center'/>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/signUp" element={<SignUp/>}/>
      <Route path="/collection" element={<Collection/>}/>
      <Route path="/player" element={<PrivateRoute/>}>
          <Route path="dashboard" element={<Dashboard/>}/>
          <Route path="inventory" element={<Inventory/>}/>
          <Route path="game" element={<Game/>}/>
          <Route path="pvp" element={<PvP/>}/>
        </Route>
    </Routes>
    </BrowserRouter>
  );
}

export default App;
