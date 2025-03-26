import React, { useEffect, useState } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

export function BookingPage() {
  const navigate = useNavigate();
  const [bookedLockers, setBookedLockers] = useState([]);
  const [userData, setUserData] = useState(null);
  const [pendingConfirmation, setPendingConfirmation] = useState({ hot: false, cold: false }); // Track first click
  const lockDuration = 900000; // 15 mins in milliseconds

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/user", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          throw new Error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const storedBookedLockers = JSON.parse(localStorage.getItem("bookedLockers")) || [];
    const firstUserId = localStorage.getItem("firstUserId");

    if (storedBookedLockers.length > 0) {
      const timeElapsed = Date.now() - parseInt(localStorage.getItem("lockerTimestamp"));

      if (timeElapsed < lockDuration) {
        setBookedLockers(storedBookedLockers);
      } else {
        localStorage.removeItem("bookedLockers");
        localStorage.removeItem("lockerTimestamp");
        localStorage.removeItem("firstUserId");
      }
    }
  }, []);

  const handleCheckboxChange = async (lockerType) => {
    if (bookedLockers.includes(lockerType)) {
      navigate(`/pin?lockerType=${lockerType}`);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/locker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locker_type: lockerType }),
      });

      if (response.ok) {
        const updatedBookedLockers = [...bookedLockers, lockerType];
        setBookedLockers(updatedBookedLockers);
        localStorage.setItem("bookedLockers", JSON.stringify(updatedBookedLockers));
        localStorage.setItem("lockerTimestamp", Date.now().toString());

        const pinResponse = await fetch(`http://localhost:8000/api/pin?locker_type=${lockerType}`);
        const pinData = await pinResponse.json();
        alert(`Your ${lockerType.toUpperCase()} locker PIN is: ${pinData.pin}`);

        localStorage.setItem("firstUserId", userData.id);

        navigate(`/pin?lockerType=${lockerType}`);
      } else {
        console.error("Failed to book locker");
      }
    } catch (error) {
      console.error("Error booking locker:", error);
    }
  };

  const handleButtonClick = (lockerType) => {
    if (!pendingConfirmation[lockerType]) {
      setPendingConfirmation((prev) => ({ ...prev, [lockerType]: true }));
    } else {
      handleCheckboxChange(lockerType);
      setPendingConfirmation((prev) => ({ ...prev, [lockerType]: false }));
    }
  };

  const isFirstUser = userData?.id === localStorage.getItem("firstUserId");
  const isLockerBooked = (lockerType) => bookedLockers.includes(lockerType);
  const isButtonDisabled = (lockerType) => isLockerBooked(lockerType) && !isFirstUser;

  const resetLockerStatus = () => {
    localStorage.removeItem("bookedLockers");
    localStorage.removeItem("lockerTimestamp");
    localStorage.removeItem("firstUserId");

    setBookedLockers([]);
    alert("Locker status has been reset.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-blue-500 text-white">
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

      <div className="text-center mt-16 mb-6">
        <Typography variant="h1" className="text-4xl font-bold">
          Booking the Locker for 1 day
        </Typography>
        <Typography className="text-lg mt-2">Hot   :     Cold</Typography>
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
            onClick={() => handleButtonClick("hot")}
            disabled={isButtonDisabled("hot")}
          >
            {isLockerBooked("hot")
              ? isFirstUser
                ? "Check PIN"
                : "Already booked"
              : pendingConfirmation.hot
                ? "Confirm?"
                : "Book"}
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
            onClick={() => handleButtonClick("cold")}
            disabled={isButtonDisabled("cold")}
          >
            {isLockerBooked("cold")
              ? isFirstUser
                ? "Check PIN"
                : "Already booked"
              : pendingConfirmation.cold
                ? "Confirm?"
                : "Book"}
          </Button>
        </div>
      </div>

      <div className="text-center mt-16 mb-6 text-gray-100">
        <Typography variant="h0" className="text-1xl font-bold">
          **Once you confirm your booking, the temperature control system in the locker will activate.**
        </Typography>
      </div>

      {/* Reset Locker Status Button */}
      <div className="mt-6">
        <Button variant="outlined" color="red" onClick={resetLockerStatus}>
          Reset Locker Status
        </Button>
      </div>
    </div>
  );
}

export default BookingPage;
