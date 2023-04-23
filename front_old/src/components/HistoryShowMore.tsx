import React from 'react'
import { ChangeProfileImage } from './ChangeProfileImage'
import { ScrollableContainer } from './ScrollableContainer';
import Oval from './OvalShaped'
import Square from './SquareShaped'

export const HistoryShowMore = () => {
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
        height: "896px",
        background: "#B12D2D",
      }}>
      <ChangeProfileImage />
      <h2 style={{
        position: "absolute",
        top: "40%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontFamily: 'Figma Hand',
        fontStyle: "normal",
        fontWeight: 100,
        fontSize: "30px",
        lineHeight: "150%",
        color: "#ccc",
      }}>
        Achievements
      </h2>
      <div
        style={{
          backgroundColor: "#ccc",
          transform: "translate(-50%, -50%)",
          borderRadius: "2%",
          position: "absolute",
          width: "800px",
          height: "400px",
          left: "50%",
          top: "70%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowY: "scroll",
        }}
      >
        <ScrollableContainer>
          <div style={{ 
            display: "flex",
            flexWrap: "wrap",
            marginBlockStart: "5px",
            marginLeft: "10px",
            gap: '10px',
          }}>
            {[...Array(50)].map((_, i) => (
              <Oval
                key={i}
                width="350px"
                height="120px"
                borderRadius="20%/40%"
                border="2.5px dashed red"
                color="#B12D2D"
                marginBottom="2px"
                marginBlockStart="10px"
                marginLeft="0px"
              >
                <Square
                  position="relative"
                  width="100px"
                  height="80px"
                  borderRadius="10%"
                  border="1.5px solid #A4A4A4"
                  color="#A4A4A4"
                  marginLeft="200px"
                  marginBlockStart="18px"
                />
              </Oval>
            ))}
          </div>
        </ScrollableContainer>
      </div >


    </div>
  )
}
