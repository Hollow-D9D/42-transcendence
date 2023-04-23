import React from "react";
import Square from "./SquareShaped";

interface OvalProps {
  width: string;
  height: string;
  borderRadius: string;
  border: string;
  color: string;
  marginBottom?: string;
  marginBlockStart?: string;
  marginLeft?: string;
  children?: React.ReactNode;
}

const Oval: React.FC<OvalProps> = ({
  width,
  height,
  borderRadius,
  border,
  color,
  marginBottom = "10px",
  marginBlockStart = "10px",
  marginLeft = "-30px",
  children
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        border,
        color,
        marginBottom,
        marginBlockStart,
        marginLeft,
      }}
    >
      {children}
    </div>
  );
};

export default Oval;
