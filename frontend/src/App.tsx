import React from "react";
import { Route, Routes } from "react-router-dom";

import Home from "./components/Home";
import Profile from "./components/Profile";
import SettingPage from "./components/SettingPage";

const App: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settingPage" element={<SettingPage />} />
    </Routes>
  );
};

export default App;
