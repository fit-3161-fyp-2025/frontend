import { useState, useEffect } from "react";
import { useLocation } from "react-router";

export function MockDataToggle() {
  const [showMockData, setShowMockData] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if mock data is enabled
    const mockDataEnabled = localStorage.getItem("showMockData") === "true";
    setShowMockData(mockDataEnabled);
  }, []);

  const handleToggle = (enabled: boolean) => {
    setShowMockData(enabled);
    localStorage.setItem("showMockData", enabled.toString());
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Only show in development and on team details pages
  if (import.meta.env.PROD) return null;
  if (!location.pathname.includes("/teams/")) return null;

  return (
    <div className="fixed top-2 right-2 z-50">
      <div className={`border rounded-md p-2 shadow-lg ${showMockData ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`}>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="mockDataToggle"
            checked={showMockData}
            onChange={(e) => handleToggle(e.target.checked)}
            className="w-4 h-4 accent-green-600"
          />
          <div>
            <label htmlFor="mockDataToggle" className={`text-xs font-bold cursor-pointer ${showMockData ? 'text-green-800' : 'text-yellow-800'}`}>
              {showMockData ? '✅ Mock Active' : '🔧 Mock Data'}
            </label>
            {showMockData && (
              <div>
                <div className="text-xs text-green-700">
                  {String.fromCharCode(8203)}12 members • 2 execs
                </div>
                <button 
                  onClick={handleRefresh}
                  className="mt-1 px-1 py-0.5 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                >
                  🔄
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
