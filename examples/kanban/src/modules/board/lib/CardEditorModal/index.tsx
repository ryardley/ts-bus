import React, { useCallback, useState } from "react";
import { WithId, Task } from "../../types";
import { Modal } from "../../../ui/Modal";
import { CardEditor } from "./CardEditor";

type Props = {
  visible: boolean;
  card: WithId<Task>;
  onClose: (value: WithId<Task>) => void;
  onDelete: (value: string) => void;
};
export default ({ card, visible, onClose, onDelete }: Props) => {
  const [value, setValue] = useState<string>(card.label);

  const handleCloseRequest = useCallback(() => {
    onClose({ ...card, label: value });
  }, [value, onClose, card]);

  const handleChange = useCallback(
    (value: string) => {
      setValue(value);
    },
    [setValue]
  );

  const handleDeleteRequest = useCallback(() => {
    handleCloseRequest();
    onDelete(card.id);
  }, [onDelete, handleCloseRequest, card]);

  return (
    <Modal visible={visible} onCloseRequest={handleCloseRequest}>
      <CardEditor
        value={value}
        onChange={handleChange}
        onEnterPressed={handleCloseRequest}
        onDelete={handleDeleteRequest}
      />
    </Modal>
  );
};
