import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import { Paperclip, UploadCloud } from "lucide-react";
import { useState } from "react";
import { DropzoneOptions } from "react-dropzone";

const FileDropzone = ({
  onFilesChange,
}: {
  onFilesChange: (files: File[] | null) => void;
}) => {
  const [files, setFiles] = useState<File[] | null>([]);

  const dropzone = {
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    multiple: true,
    maxFiles: 1,
    maxSize: 1 * 1024 * 1024,
  } satisfies DropzoneOptions;

  return (
    <FileUploader
      value={files}
      onValueChange={(value) => {
        setFiles(value);
        onFilesChange(value);
      }}
      dropzoneOptions={dropzone}
      className="relative bg-background rounded-lg p-2"
    >
      <FileInput className="outline-dashed outline-1 outline-white">
        <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full ">
          <UploadCloud />
          <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span>
            &nbsp; or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">DOCX</p>
        </div>
      </FileInput>
      <FileUploaderContent>
        {files?.map((file, i) => (
          <FileUploaderItem
            key={i}
            index={i}
            aria-roledescription={`file ${i + 1} containing ${file.name}`}
          >
            <Paperclip className="h-4 w-4 stroke-current" />
            <span>{file.name}</span>
          </FileUploaderItem>
        ))}
      </FileUploaderContent>
    </FileUploader>
  );
};

export default FileDropzone;
