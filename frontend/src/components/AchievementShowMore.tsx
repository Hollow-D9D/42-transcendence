import React, { useRef, useState } from 'react'
import { ChangeProfileImage } from './ChangeProfileImage'
import Oval from './OvalShaped';
import Square from './SquareShaped';
import { ScrollableContainer } from './ScrollableContainer';

export const AchievementShowMore = () => {
  const [width, setWidth] = useState<number>(0);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const newWidth = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setWidth(newWidth);
  };
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
      <div 
      onScroll={handleScroll}
      style={{
        position: "relative",
      }}>
        <h1 style={{
          backgroundColor: "#A4A4A4",
          padding: "20px 46px",
          borderRadius: "5px",
          position: "absolute",
          top: "-550px",
          left: "26%",
          fontSize: "20px",
          color: "black",
          transform: "translate(-50%, -50%)",
          zIndex: 1,

        }}>
          Rank name
        </h1>
        <div style={{
          position: "absolute",
          bottom: "-2px",
          left: 85,
          right: 0,
          top: "-500px",
          height: "20px",
          width: "200px",
          content: "",
          display: "block",
          backgroundColor: "#A4A4A4",
        }}>
          <div
          style={{
            position: "absolute",
            bottom: "-2px",
            left: 90,
            height: "20px",
            content: "",
            display: "block",
            backgroundColor: "#B12D2D",
            width: `${width}%`,
            zIndex: 0,
          }}>
          </div>
        </div>
      </div>
      <div 
        style={{
          backgroundColor: "#ccc",
          borderRadius: "2%",
          position: "absolute",
          width: "400px",
          height: "600px",
          left: "45%",
          top: "30%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowY: "scroll",
        }}
      >
        <ScrollableContainer>

          <div>
            {[...Array(50)].map((_, i) => (
              <Oval
                key={i}
                width="350px"
                height="120px"
                borderRadius="20%/40%"
                border="2.5px dashed red"
                color="#B12D2D"
                marginBottom="10px"
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
    </div >
  );
};
