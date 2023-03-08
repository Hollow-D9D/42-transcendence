import React from "react";
import { Route, Routes } from "react-router-dom";

import Home from "./components/Home";
import Profile from "./components/Profile";
import SettingPage from "./components/SettingPage";
import { AchievementShowMore } from "./components/AchievementShowMore";
import { PongGame } from "./components/PongGame";

const App: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settingPage" element={<SettingPage />} />
      <Route path="/AchievementShowMore" element={<AchievementShowMore />} />
      <Route path="/PongGame" element={<PongGame />} />

    </Routes>
  );
};

export default App;
