import {
  Camera,
  Key,
  Loader2Icon,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fileToBase64 } from "@/lib/utils";

interface UserPhoto {
  data: string;
  name: string;
  createdAt: string;
}

function App() {
  const [userPhoto, setUserPhoto] = useState<UserPhoto | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);

  // Load saved photo and fal api key
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const result = await browser.storage.local.get([
          "userPhoto",
          "falApiKey",
        ]);
        if (result.userPhoto) {
          setUserPhoto(result.userPhoto);
        }
        if (result.falApiKey) {
          setApiKey(result.falApiKey);
        }
      } catch (error) {
        console.error("Failed to load saved data:", error);
      }
    };

    loadSavedData();
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      const photoData: UserPhoto = {
        data: base64,
        name: file.name,
        createdAt: new Date().toISOString(),
      };

      // Save to local storage
      await browser.storage.local.set({ userPhoto: photoData });
      setUserPhoto(photoData);
    } catch (error) {
      console.error("Failed to upload photo:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await browser.storage.local.remove("userPhoto");
      setUserPhoto(null);
    } catch (error) {
      console.error("Failed to remove photo:", error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      alert("Please enter a valid API key");
      return;
    }

    setIsSavingApiKey(true);
    try {
      await browser.storage.local.set({ falApiKey: apiKey.trim() });
      console.log("API key saved successfully");
    } catch (error) {
      console.error("Failed to save API key:", error);
      alert("Failed to save API key. Please try again.");
    } finally {
      setIsSavingApiKey(false);
    }
  };

  return (
    <div className="min-h-96 w-80 bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Sparkles className="text-purple-600" size={24} />
          <h1 className="font-bold text-gray-800 text-xl">Virtual Try-On</h1>
        </div>
        <p className="text-gray-600 text-sm">
          Upload your photo to try on clothes virtually
        </p>
      </div>

      {/* API Key Section */}
      <div className="mb-6">
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Key className="text-orange-600" size={16} />
            <h3 className="font-medium text-orange-800 text-sm">
              Setup Required
            </h3>
          </div>
          <p className="mb-3 text-orange-700 text-xs">
            Please enter your Fal AI API key to use virtual try-on
          </p>

          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter your Fal API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button onClick={handleSaveApiKey} disabled={isSavingApiKey}>
              {isSavingApiKey && <Loader2Icon className="animate-spin" />}
              Save API Key
            </Button>
          </div>
        </div>
      </div>

      {/* Photo Upload Section */}
      <div className="space-y-4">
        {!userPhoto ? (
          <div className="rounded-lg border-2 border-purple-300 border-dashed p-6 text-center">
            <Camera className="mx-auto mb-3 text-purple-400" size={32} />
            <h3 className="mb-2 font-medium text-gray-700">
              Upload Your Photo
            </h3>
            <p className="mb-4 text-gray-500 text-xs">
              Choose a clear photo of yourself for better results
            </p>

            {/** biome-ignore lint/a11y/noLabelWithoutControl: Chack later */}
            <label className="cursor-pointer">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <div className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-purple-700">
                {isUploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Choose Photo
                  </>
                )}
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Uploaded Photo Preview */}
            <div className="relative">
              <img
                src={userPhoto.data}
                alt="User profile for virtual try-on"
                className="h-48 w-full rounded-lg border border-gray-200 object-cover"
              />
              <Button
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2 rounded-full"
                variant="destructive"
                size="icon"
                title="Remove photo"
              >
                <Trash2 size={14} />
              </Button>
            </div>

            {/* Photo Info */}
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="truncate font-medium text-gray-700 text-sm">
                    {userPhoto.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Uploaded{" "}
                    {new Date(userPhoto.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
              </div>
            </div>

            {/* Upload New Photo Button */}
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <div className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-200">
                <Upload size={16} />
                Upload New Photo
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-2 font-medium text-blue-800 text-sm">How to use:</h4>
        <ol className="space-y-1 text-blue-700 text-xs">
          <li>1. Upload your photo above</li>
          <li>2. Right-click on clothing image</li>
          <li>3. Select "Virtual Try-On" from the menu</li>
          <li>4. Wait for the AI to generate your virtual try-on!</li>
        </ol>
      </div>
    </div>
  );
}

export default App;
