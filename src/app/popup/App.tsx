import { ImageIcon, Loader2Icon, Trash2Icon, UploadIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    async function loadSavedData() {
      try {
        const result = await chrome.storage.local.get([
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
    }

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
      await chrome.storage.local.set({ userPhoto: photoData });
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
      await chrome.storage.local.remove("userPhoto");
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
      await chrome.storage.local.set({ falApiKey: apiKey.trim() });
      console.log("API key saved successfully");
    } catch (error) {
      console.error("Failed to save API key:", error);
      alert("Failed to save API key. Please try again.");
    } finally {
      setIsSavingApiKey(false);
    }
  };

  return (
    <div className="flex w-80 flex-col gap-4 p-4">
      {/* Header */}
      {/* <div className="mb-6 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Sparkles className="text-purple-600" size={24} />
          <h1 className="font-bold text-gray-800 text-xl">Virtual Try-On</h1>
        </div>
        <p className="text-gray-600 text-sm">
          Upload your photo to try on clothes virtually
        </p>
      </div> */}

      {/* API Key Section */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Required</CardTitle>
          <CardDescription>
            Please enter your Fal AI API key to use virtual try-on
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Enter your Fal API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button
              onClick={handleSaveApiKey}
              disabled={isSavingApiKey}
              className="w-full"
            >
              {isSavingApiKey && <Loader2Icon className="animate-spin" />}
              Save API Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Photo Upload Section */}
      <Card>
        <CardContent className="flex flex-col items-center">
          {!userPhoto ? (
            <>
              <ImageIcon size={32} />
              <h3 className="mt-3 font-semibold text-base">
                Upload Your Photo
              </h3>
              <p className="mb-2 text-center text-muted-foreground text-sm">
                Choose a clear photo of yourself for better results
              </p>
            </>
          ) : (
            <div className="relative">
              <img
                src={userPhoto.data}
                alt={userPhoto.name}
                className="aspect-3/2 rounded-lg border object-cover"
              />
              <Button
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2"
                variant="destructive"
                size="icon"
                title="Remove photo"
              >
                <Trash2Icon />
              </Button>
            </div>
          )}

          <div className="mt-4 w-full">
            <Input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />

            <Button
              asChild
              className="w-full"
              variant={userPhoto ? "outline" : "default"}
            >
              <Label htmlFor="file-upload">
                {isUploading ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <UploadIcon />
                )}
                Upload {userPhoto && "new"} image
              </Label>
            </Button>
          </div>
        </CardContent>
      </Card>

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
