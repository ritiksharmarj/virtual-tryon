import { Camera, Key, Sparkles, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";

interface UserPhoto {
  data: string;
  name: string;
  uploadedAt: string;
}

function App() {
  const [userPhoto, setUserPhoto] = useState<UserPhoto | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);

  // Load saved photo on component mount
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

  // Helper function to use API key from your .env file
  const useEnvApiKey = async () => {
    const envApiKey =
      "3da79fe0-8cad-41e8-a322-217b9a0a9421:3c404fa4c22d4dd4e59da20b729b10a2";
    if (envApiKey) {
      setApiKey(envApiKey);
      await browser.storage.local.set({ falApiKey: envApiKey });
      setShowApiKeyInput(false);
      console.log("API key set from environment");
    }
  };

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
        uploadedAt: new Date().toISOString(),
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
      setShowApiKeyInput(false);
      console.log("API key saved successfully");
    } catch (error) {
      console.error("Failed to save API key:", error);
      alert("Failed to save API key. Please try again.");
    } finally {
      setIsSavingApiKey(false);
    }
  };

  const handleChangeApiKey = async () => {
    try {
      // Clear from storage
      await browser.storage.local.remove("falApiKey");
      // Clear from state
      setApiKey("");
      setShowApiKeyInput(true);
      console.log("API key cleared");
    } catch (error) {
      console.error("Failed to clear API key:", error);
    }
  };

  const handleCancelApiKey = async () => {
    // Reload the API key from storage to reset any changes
    try {
      const result = await browser.storage.local.get("falApiKey");
      setApiKey(result.falApiKey || "");
      setShowApiKeyInput(false);
    } catch (error) {
      console.error("Failed to reload API key:", error);
      setApiKey("");
      setShowApiKeyInput(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="w-80 p-6 bg-gradient-to-br from-purple-50 to-blue-50 min-h-96">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="text-purple-600" size={24} />
          <h1 className="text-xl font-bold text-gray-800">Virtual Try-On</h1>
        </div>
        <p className="text-sm text-gray-600">
          Upload your photo to try on clothes virtually
        </p>
      </div>

      {/* API Key Section */}
      <div className="mb-6">
        {!apiKey ? (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="text-orange-600" size={16} />
              <h3 className="font-medium text-orange-800 text-sm">
                Setup Required
              </h3>
            </div>
            <p className="text-xs text-orange-700 mb-3">
              Please enter your Fal AI API key to use virtual try-on
            </p>
            {!showApiKeyInput ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowApiKeyInput(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors w-full"
                >
                  Add API Key
                </button>
                <button
                  type="button"
                  onClick={useEnvApiKey}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors w-full"
                >
                  Use Key from .env File
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Fal AI API key"
                  className="w-full px-3 py-2 border border-orange-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    disabled={!apiKey.trim() || isSavingApiKey}
                    className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    {isSavingApiKey ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelApiKey}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="text-green-600" size={16} />
                <span className="font-medium text-green-800 text-sm">
                  API Key Set
                </span>
              </div>
              <button
                type="button"
                onClick={handleChangeApiKey}
                className="text-green-700 hover:text-green-800 text-xs underline"
              >
                Change
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Photo Upload Section */}
      <div className="space-y-4">
        {!userPhoto ? (
          <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center">
            <Camera className="mx-auto text-purple-400 mb-3" size={32} />
            <h3 className="font-medium text-gray-700 mb-2">
              Upload Your Photo
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Choose a clear photo of yourself for better results
            </p>

            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <div className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 justify-center">
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors"
                title="Remove photo"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Photo Info */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 text-sm truncate">
                    {userPhoto.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Uploaded{" "}
                    {new Date(userPhoto.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Upload New Photo Button */}
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <div className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 justify-center border border-gray-300">
                <Upload size={16} />
                Upload New Photo
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 text-sm mb-2">How to use:</h4>
        <ol className="text-xs text-blue-700 space-y-1">
          <li>1. Upload your photo above</li>
          <li>2. Right-click on any clothing image on e-commerce sites</li>
          <li>3. Select "Virtual Try-On" from the menu</li>
          <li>4. Wait for the AI to generate your virtual try-on!</li>
        </ol>
      </div>

      {/* API Key Notice */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">Powered by Fal AI</p>
      </div>
    </div>
  );
}

export default App;
