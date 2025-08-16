import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { showSuccess, showError } from "@/hooks/use-toast";
import { uploadLogo, deleteLogo, getLogoPathFromUrl, isStorageUrl } from "@/lib/logo-service";

interface LogoUploadProps {
  logo?: string;
  onLogoChange: (logo: string | undefined) => void;
}

export const LogoUpload = ({ logo, onLogoChange }: LogoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Using enhanced toast helpers

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError(
        "Invalid File Type",
        "Please select an image file (PNG, JPG, GIF, etc.)"
      );
      return;
    }

    // Validate file size (max 2MB for better performance)
    if (file.size > 2 * 1024 * 1024) {
      showError(
        "File Too Large",
        "Please select an image smaller than 2MB"
      );
      return;
    }

    setIsUploading(true);

    try {
      // Delete existing logo if it exists and is stored in Supabase Storage
      if (logo && isStorageUrl(logo)) {
        const logoPath = getLogoPathFromUrl(logo);
        if (logoPath) {
          await deleteLogo(logoPath);
        }
      }

      // Upload new logo to Supabase Storage
      const result = await uploadLogo(file);
      
      if (result) {
        onLogoChange(result.url);
        showSuccess(
          "Logo Uploaded Successfully!",
          "Your logo has been added to the invoice"
        );
      } else {
        showError(
          "Upload Failed",
          "Failed to upload logo. Please try again."
        );
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      showError(
        "Upload Failed",
        "Failed to upload logo. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveLogo = async () => {
    if (!logo) return;

    try {
      // Delete from Supabase Storage if it's a storage URL
      if (isStorageUrl(logo)) {
        const logoPath = getLogoPathFromUrl(logo);
        if (logoPath) {
          await deleteLogo(logoPath);
        }
      }

      onLogoChange(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      showSuccess(
        "Logo Removed",
        "Logo has been removed from the invoice"
      );
    } catch (error) {
      console.error('Error removing logo:', error);
      // Still remove from UI even if storage deletion fails
      onLogoChange(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      showSuccess(
        "Logo Removed",
        "Logo has been removed from the invoice"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Company Logo</Label>
        <p className="text-sm text-muted-foreground">
          Add your company logo to make your invoices more professional
        </p>
      </div>

      {logo ? (
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <img
                src={logo}
                alt="Company Logo"
                className="w-20 h-20 object-contain border border-border rounded-lg bg-muted/20"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">Logo uploaded successfully</p>
              <p className="text-sm text-muted-foreground">
                Your logo will appear on all invoices
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveLogo}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Remove
            </Button>
          </div>
        </Card>
      ) : (
        <Card
          className={`p-8 border-2 border-dashed transition-colors cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              {isDragging ? (
                <Upload className="w-8 h-8 text-primary" />
              ) : (
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium">
                {isDragging ? "Drop your logo here" : "Upload Company Logo"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop an image file, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supports PNG, JPG, GIF • Max 2MB
              </p>
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Choose File
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};
