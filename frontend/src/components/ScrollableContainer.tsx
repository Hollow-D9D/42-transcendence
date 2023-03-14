import styled from 'styled-components';

export const ScrollableContainer = styled.div`
  height: 896px;
  overflow-y: scroll;
  padding-right: 20px;

  &::-webkit-scrollbar {
    width: 15px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
    border: 1px solid #A4A4A4;
    border-radius: 4px;
    margin-block-start: 10px;
    margin-block-end: 10px;
    width: 20px;
  }

  &::-webkit-scrollbar-thumb {
    background: #B12D2D;
    border-radius: 4px;
  }
`;