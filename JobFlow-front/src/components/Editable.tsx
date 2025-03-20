import { Edit2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Editable({
  text,
  placeholder,
  children,
  inputRef,
  onChange,
  ...props
}: any) {
  const [isEditing, setEditing] = useState(false);

  // Event handler while pressing any key while editing
  const handleKeyDown = (event: any) => {
    // Handle when key is pressed
  };

  const handleBlur = () => {
    setEditing(false);
    if (text !== inputRef.current.value) {
      onChange({ [inputRef.current.name]: inputRef.current.value });
    }
  };

  useEffect(() => {
    if (inputRef.current && isEditing === true) {
      inputRef.current.focus();
    }
  }, [isEditing, inputRef]);

  return (
    <>
      {isEditing ? (
        <div onBlur={handleBlur} onKeyDown={(e) => handleKeyDown(e)}>
          {children}
        </div>
      ) : (
        <p
          className="flex items-center gap-2 group"
          onClick={() => setEditing(true)}
        >
          <span>{text || placeholder || "Editable content"}</span>
          <Edit2 size={16} className="hidden group-hover:block" />
        </p>
      )}
    </>
  );
}
