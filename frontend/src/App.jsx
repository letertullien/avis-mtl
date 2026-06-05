
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Accueil from "./pages/Accueil/Accueil";
import DetailAlerte from "./pages/DetailAlerte/DetailAlerte";
import PageIntrouvable from "./pages/PageIntrouvable/PageIntrouvable";
import './App.css'


function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/"                   element={<Accueil />} />
        <Route path="/alertes/:id"        element={<DetailAlerte />} />
      </Route>
      <Route path="*"                     element={<PageIntrouvable />} />
    </Routes>
  );
}
 
export default App;
 