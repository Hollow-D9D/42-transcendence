import React from "react";

interface SquareProps {
    position: string;
    width: string;
    height: string;
    borderRadius: string;
    border: string;
    color: string;
    marginLeft?: string;
  marginBlockStart?: string;
    // left: string;
    // top: string;
}

const Square: React.FC<SquareProps> = ({
    position = "relative",
    width,
    height,
    borderRadius,
    border,
    color,
    marginLeft,
    marginBlockStart,
    // left,
    // top,
}) => {
    return (
        <div
            style={{
                width,
                height,
                borderRadius,
                border,
                color,
                marginLeft,
                marginBlockStart,
                // top,
            }}
        ></div>
    );
};

export default Square;
