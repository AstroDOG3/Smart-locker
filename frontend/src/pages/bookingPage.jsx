import React, { useEffect, useState } from "react";
import { Typography, Button } from "@material-tailwind/react";

export function BookingPage() {
  const [selectedLocker, setSelectedLocker] = useState(null);
  const lockDuration = 3600000; // 1 hour in milliseconds

  useEffect(() => {
    const storedLocker = localStorage.getItem("selectedLocker");
    const lockerTimestamp = localStorage.getItem("lockerTimestamp");

    if (storedLocker && lockerTimestamp) {
      const timeElapsed = Date.now() - parseInt(lockerTimestamp);
      if (timeElapsed < lockDuration) {
        setSelectedLocker(storedLocker);
      } else {
        localStorage.removeItem("selectedLocker");
        localStorage.removeItem("lockerTimestamp");
      }
    }
  }, []);

  const handleCheckboxChange = (lockerType) => {
    if (!selectedLocker) {
      setSelectedLocker(lockerType);
      localStorage.setItem("selectedLocker", lockerType);
      localStorage.setItem("lockerTimestamp", Date.now().toString());
      window.location.href = "/pin";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-blue-500 text-white">
      {/* Navbar with gradient */}
      <nav className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg fixed top-0 z-50">
        <Typography variant="h4" className="font-bold text-2xl">
          LOCKERY
        </Typography>
        <a href="/logout">
          <Button variant="text" className="text-white">
            Log out
          </Button>
        </a>
      </nav>

      {/* Content */}
      <div className="text-center mt-16 mb-6">
        <Typography variant="h1" className="text-4xl font-bold">
          Booking the Locker for 1 day
        </Typography>
        <Typography className="text-lg mt-2">Hot:Cold</Typography>
      </div>

      <div className="flex gap-8">
        {/* Hot Locker Option */}
        <div className="bg-white p-6 rounded-lg shadow-lg text-center w-64">
          <Typography variant="h5" color="gray" className="mb-4 font-semibold">
            HOT
          </Typography>
          <Button
            variant="filled"
            color="blue"
            fullWidth
            onClick={() => handleCheckboxChange("hot")}
            disabled={!!selectedLocker}
          >
            Book
          </Button>
        </div>

        {/* Cold Locker Option */}
        <div className="bg-white p-6 rounded-lg shadow-lg text-center w-64">
          <Typography variant="h5" color="gray" className="mb-4 font-semibold">
            COLD
          </Typography>
          <Button
            variant="filled"
            color="blue"
            fullWidth
            onClick={() => handleCheckboxChange("cold")}
            disabled={!!selectedLocker}
          >
            Book
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
