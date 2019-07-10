import React, { useState, useCallback } from "react";
import styled from "styled-components";

const TextAreaField = styled.textarea`
  width: calc(100% - 2rem);
  padding: 1rem;
`;

export function NewTaskEditor({
  onChange
}: {
  onChange: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const handleUpdate = useCallback(() => {
    onChange(value);
  }, [value, onChange]);

  const handleBlur = useCallback(() => {
    handleUpdate();
  }, [handleUpdate]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        handleUpdate();
      }
    },
    [handleUpdate]
  );
  const handleChange = useCallback(
    (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
      setValue(event.currentTarget.value);
    },
    [setValue]
  );
  return (
    <TextAreaField
      autoFocus={true}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}
