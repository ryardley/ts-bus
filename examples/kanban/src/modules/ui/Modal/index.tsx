import React from "react";
import { Dialog, DialogBackdrop } from "reakit/Dialog";
import styled from "styled-components";
import IconButton from "../IconButton";

const StyledBackdrop = styled(DialogBackdrop)`
  background: rgba(0, 0, 0, 0.3);
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

const StyledDialog = styled(Dialog)`
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
`;

type ModalProps = {
  visible: boolean;
  children: React.ReactNode;
  onCloseRequest?: () => void;
};

const CloseButtonFrame = styled.div`
  position: relative;
`;

const CloseButton = styled(IconButton).attrs({ icon: "Close" })`
  position: absolute;
  top: 0;
  right: 0;
`;

function WithCloseButton({
  children,
  onClick
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <CloseButtonFrame>
      {children}
      <CloseButton onClick={onClick} />
    </CloseButtonFrame>
  );
}

export function Modal({
  visible,
  children,
  onCloseRequest = () => {}
}: ModalProps) {
  const args = {
    unstable_hiddenId: "my-dialog",
    visible
  };
  return (
    <>
      <StyledBackdrop {...args} onClick={onCloseRequest} />
      <StyledDialog {...args} aria-label="Edit Card">
        <WithCloseButton onClick={onCloseRequest}>{children}</WithCloseButton>
      </StyledDialog>
    </>
  );
}
