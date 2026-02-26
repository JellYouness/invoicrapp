import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Palette } from "lucide-react";
import { InvoiceTheme } from "@/types/invoice";
import { getAllThemeMetadataSync, getThemeById } from "@/lib/invoice-themes";
import { useEffect, useState } from "react";

interface ThemeSelectionProps {
  selectedTheme?: InvoiceTheme;
  onThemeSelect: (theme: InvoiceTheme) => void;
}

export const ThemeSelection = ({
  selectedTheme,
  onThemeSelect,
}: ThemeSelectionProps) => {
  const [availableThemes, setAvailableThemes] = useState<any[]>([]);
  const [loadedThemes, setLoadedThemes] = useState<{
    [key: string]: InvoiceTheme;
  }>({});

  useEffect(() => {
    // Load theme metadata for display
    const metadata = getAllThemeMetadataSync();
    setAvailableThemes(metadata);

    // Preload all themes for previews
    const loadAllThemes = async () => {
      const themes: { [key: string]: InvoiceTheme } = {};
      for (const meta of metadata) {
        try {
          const theme = await getThemeById(meta.id);
          if (theme) {
            themes[meta.id] = theme;
            // Inject theme CSS for previews
            const existingStyle = document.getElementById(
              `theme-preview-${meta.id}`
            );
            if (!existingStyle && theme.customCSS) {
              const styleElement = document.createElement("style");
              styleElement.id = `theme-preview-${meta.id}`;
              styleElement.textContent = theme.customCSS;
              document.head.appendChild(styleElement);
            }
          }
        } catch (error) {
          console.error(`Failed to load theme ${meta.id}:`, error);
        }
      }
      setLoadedThemes(themes);
    };

    loadAllThemes();
  }, []);

  const handleThemeSelect = async (themeId: string) => {
    try {
      const theme = await getThemeById(themeId);
      if (theme) {
        onThemeSelect(theme);
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 h-full">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 lg:mb-2">
          <Palette className="w-6 h-6 text-primary" />
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold">
            Choose Your Invoice Theme
          </h2>
        </div>
        {/* <p className="text-muted-foreground">Select a professional design for your invoices</p> */}
      </div>

      <Card className="grid md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 overflow-y-auto p-6 bg-muted/90 rounded-lg h-[90%]">
        {availableThemes.map((theme) => (
          <Card
            key={theme.id}
            className={`relative p-3 cursor-pointer transition-all duration-300 hover:shadow-lg h-60 ${
              selectedTheme.id === theme.id
                ? "ring-2 ring-primary shadow-lg scale-105"
                : "hover:shadow-md"
            }`}
            onClick={() => handleThemeSelect(theme.id)}
          >
            {selectedTheme.id === theme.id && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}

            <div className="md:space-y-2">
              {/* Theme Info */}
              <div className="text-center">
                <h3
                  className="font-semibold text-md pb-1 border-b-2 w-36 mx-auto"
                  style={{ borderColor: theme.preview?.primary || "#e5e7eb" }}
                >
                  {theme.name}
                </h3>
                {/* <p className="text-sm text-muted-foreground mt-1">{theme.description}</p> */}
                {/* <p className="text-xs text-muted-foreground">v{theme.version} by {theme.author}</p> */}
              </div>
              {/* Mini Invoice Preview */}
              <div className="h-40 md:h-44 w-32 bg-white rounded-lg shadow-sm border p-2 mx-auto relative scale-[0.9] md:scale-100">
                {/* Invoice Header */}
                <div
                  className="flex justify-between items-start pb-2 border-b p-2 rounded-t-lg -m-2 mb-3"
                  style={{
                    backgroundColor: theme.preview?.primary || "#374151",
                    borderColor: theme.preview?.secondary || "#e5e7eb",
                  }}
                >
                  <div className="space-y-1">
                    <div
                      className={`h-2 w-16 rounded ${
                        theme.preview?.headerText
                          ? "bg-[" + theme.preview?.headerText + "]"
                          : "bg-white/90"
                      }`}
                    />
                    <div
                      className={`h-1 w-12 rounded ${
                        theme.preview?.headerText
                          ? "bg-[" + theme.preview?.headerText + "]"
                          : "bg-white/60"
                      }`}
                    />
                  </div>
                  <div
                    className={`w-5 h-5 rounded ${
                      theme.preview?.headerText
                        ? "bg-[" + theme.preview?.headerText + "]"
                        : "bg-white/80"
                    }`}
                  />
                </div>

                {/* Company & Client Info */}
                <div className="grid grid-cols-2 justify-items-stretch gap-3 mb-4 px-1">
                  <div className="space-y-1">
                    <div className="h-1 w-12 bg-gray-300 rounded" />
                    <div className="h-1 w-14 bg-gray-200 rounded" />
                    <div className="h-1 w-10 bg-gray-200 rounded" />
                  </div>
                  <div className="space-y-1 justify-self-end flex flex-col items-end ">
                    <div className="h-1 w-8 bg-gray-300 rounded" />
                    <div className="h-1 w-10 bg-gray-200 rounded" />
                    {/* <div className="h-2 w-14 bg-gray-200 rounded" /> */}
                  </div>
                </div>

                {/* Invoice Items */}
                <div className="space-y-1 mb-3 px-1">
                  <div className="flex justify-between items-center">
                    <div className="h-1.5 w-14 bg-gray-200 rounded" />
                    <div className="h-1.5 w-10 bg-gray-300 rounded" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-1.5 w-10 bg-gray-200 rounded" />
                    <div className="h-1.5 w-12 bg-gray-300 rounded" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-1.5 w-16 bg-gray-200 rounded" />
                    <div className="h-1.5 w-8 bg-gray-300 rounded" />
                  </div>
                </div>

                {/* Total */}
                <div
                  className="flex justify-between items-center pt-2 border-t absolute bottom-4 left-4 right-4"
                  style={{ borderColor: theme.preview?.secondary || "#e5e7eb" }}
                >
                  <div
                    className="h-3 w-10 rounded"
                    style={
                      {
                        // backgroundColor: theme.preview?.accent || "#374151",
                      }
                    }
                  />
                  <div
                    className="h-2 w-8 rounded"
                    style={{
                      backgroundColor: theme.preview?.accent || "#374151",
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </Card>
    </div>
  );
};
