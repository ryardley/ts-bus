import React, {
  useRef,
  useState,
  useCallback,
  SyntheticEvent,
  KeyboardEvent
} from "react";
import styled from "styled-components";
import TextInput from "../TextInput";
const DisplayText = styled.div``;
type Props = {
  className?: string;
  onEnterPressed?: () => void;
  onChange: (value: string) => void;
  children: string;
};
export default function EditableText({
  className,
  onEnterPressed = () => {},
  onChange,
  children
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const inputEl = useRef<HTMLInputElement>(null);

  const reportChange = useCallback(
    (label: string) => {
      onChange(label);
    },
    [onChange]
  );

  const handleChange = useCallback(
    (event: SyntheticEvent<HTMLInputElement>) => {
      reportChange(event.currentTarget.value);
    },
    [reportChange]
  );

  const handleBlur = useCallback(
    (event: SyntheticEvent<HTMLInputElement>) => {
      setEditMode(false);
      reportChange(event.currentTarget.value);
    },
    [reportChange, setEditMode]
  );

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        setEditMode(false);
        onEnterPressed();
      }
    },
    [onEnterPressed]
  );

  const handleDisplayClick = useCallback(() => {
    setEditMode(true);
    setTimeout(() => {
      if (inputEl && inputEl.current) {
        inputEl.current.focus();
        inputEl.current.select();
      }
    }, 200);
  }, [inputEl, setEditMode]);

  return (
    <>
      {editMode ? (
        <TextInput
          ref={inputEl}
          className={className}
          autoFocus={true}
          value={children}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
      ) : (
        <DisplayText className={className} onClick={handleDisplayClick}>
          {children}
        </DisplayText>
      )}
    </>
  );
}
