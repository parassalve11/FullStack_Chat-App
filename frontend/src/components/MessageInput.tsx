import { Loader2, Paperclip, Send, X } from "lucide-react";
import { useState } from "react";

interface MesageInputprops {
  selectedUser: string | null;
  message: string;
  setMessage: (value: any) => void;
  handleSendMessage: (e: any, imageFile: File | null) => void;
}

export default function MessageInput({
  selectedUser,
  message,
  setMessage,
  handleSendMessage,
}: MesageInputprops) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!message?.trim() && !imageFile) return;

    setIsUploading(true);
    await handleSendMessage(e, imageFile);

    setIsUploading(false);
    setImageFile(null);
  };

  if (!selectedUser) return null;
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-t border-gray-700 pt-2 w-full px-3 max-w-6xl"
    >
      {imageFile && (
        <div className="relative w-fit">
          <img
            src={URL.createObjectURL(imageFile)}
            alt="preview"
            className="size-24 object-cover rounded-2xl border border-gray-600"
          />
          <button
            type="button"
            className="absolute -right-3 -top-2 bg-black
          rounded-full p-1"
            onClick={() => setImageFile(null)}
          >
            <X size={8} className="text-white" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 rounded px-3 py-2 transition-colors">
          <Paperclip size={18} className="text-gray-400" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e: any) => {
              const file = e.currentTarget.files?.[0];
              if (file && file.type.startsWith("image/")) {
                setImageFile(file);
              }
            }}
          />
        </label>
        <input
          type="text"
          className="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400"
          placeholder={imageFile ? "Add a Caption ..." : "Type a Message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          disabled={(!imageFile && !message) || isUploading}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-1
           disabled:opacity-50 disabled:cursor-none text-white"
        >
            {isUploading ? <Loader2  className="animate-spin"/> : <Send className="" />}
        </button>
      </div>
    </form>
  );
}
