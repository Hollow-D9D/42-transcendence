import React from 'react'
import { ChangeProfileImage } from './ChangeProfileImage'

export const AchievementShowMore = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        left: 0,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        display: 'flex',
        padding: '0 20px',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: "border-box",

        // position: "relative",
        height: "896px",

        background: "#B12D2D",
      }}>
      <ChangeProfileImage />
    </div>
  )
}
