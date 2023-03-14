import React from "react";
import { Route, Routes } from "react-router-dom";

import Home from "./components/Home";
import Profile from "./components/Profile";
import SettingPage from "./components/SettingPage";
import { HistoryShowMore } from "./components/HistoryShowMore";
import { PongGame } from "./components/PongGame";
import { AchievementShowMore } from "./components/AchievementShowMore";
const App: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settingPage" element={<SettingPage />} />
      <Route path="/HistoryShowMore" element={<HistoryShowMore />} />
      <Route path="/PongGame" element={<PongGame />} />
      <Route path="/AchievementShowMore" element={<AchievementShowMore />} />

    </Routes>
  );
};

export default App;
