import React, { useEffect, useState } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

export function BookingPage() {
  const navigate = useNavigate();
  const [bookedLockers, setBookedLockers] = useState([]);
  const [userData, setUserData] = useState(null); // Store user info
  const lockDuration = 900000; // 15 mins in milliseconds

  // Fetch user data on login
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/user", { // Updated port to match the backend
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

  // Check if locker is already booked or expired
  useEffect(() => {
    const storedBookedLockers = JSON.parse(localStorage.getItem("bookedLockers")) || [];
    const firstUserId = localStorage.getItem("firstUserId"); // Fetch first user ID from localStorage

    // Check if the booking is still valid (within lockDuration)
    if (storedBookedLockers.length > 0) {
      const timeElapsed = Date.now() - parseInt(localStorage.getItem("lockerTimestamp"));

      if (timeElapsed < lockDuration) {
        setBookedLockers(storedBookedLockers); // Set booked lockers
      } else {
        // If booking expired, reset localStorage
        localStorage.removeItem("bookedLockers");
        localStorage.removeItem("lockerTimestamp");
        localStorage.removeItem("firstUserId"); // Remove first user ID when booking expires
      }
    }
  }, []);

  const handleCheckboxChange = async (lockerType) => {
    if (bookedLockers.includes(lockerType)) {
      // If the locker is already booked, navigate to the PinPage to check PIN
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
        setBookedLockers(updatedBookedLockers); // Update booked lockers
        localStorage.setItem("bookedLockers", JSON.stringify(updatedBookedLockers));
        localStorage.setItem("lockerTimestamp", Date.now().toString());

        const pinResponse = await fetch(`http://localhost:8000/api/pin?locker_type=${lockerType}`);
        const pinData = await pinResponse.json();
        alert(`Your ${lockerType.toUpperCase()} locker PIN is: ${pinData.pin}`);

        // Save first user ID who booked the locker
        localStorage.setItem("firstUserId", userData.id);

        navigate(`/pin?lockerType=${lockerType}`);
      } else {
        console.error("Failed to book locker");
      }
    } catch (error) {
      console.error("Error booking locker:", error);
    }
  };

  const isFirstUser = userData?.id === localStorage.getItem("firstUserId");
  const isLockerBooked = (lockerType) => bookedLockers.includes(lockerType);
  const isButtonDisabled = (lockerType) => isLockerBooked(lockerType) && !isFirstUser;

  const resetLockerStatus = () => {
    // Clear localStorage and reset state
    localStorage.removeItem("bookedLockers");
    localStorage.removeItem("lockerTimestamp");
    localStorage.removeItem("firstUserId");

    setBookedLockers([]); // Clear the booked lockers in state
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
            disabled={isButtonDisabled("hot")} // Disable button if it's already booked by another user
          >
            {isLockerBooked("hot") 
              ? isFirstUser 
                ? "Check PIN" 
                : "Already booked" 
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
            onClick={() => handleCheckboxChange("cold")}
            disabled={isButtonDisabled("cold")} // Disable button if it's already booked by another user
          >
            {isLockerBooked("cold") 
              ? isFirstUser 
                ? "Check PIN" 
                : "Already booked" 
              : "Book"}
          </Button>
        </div>
      </div>

      {/* Reset Locker Status Button */}
      <div className="mt-6">
        <Button
          variant="outlined"
          color="red"
          onClick={resetLockerStatus}
        >
          Reset Locker Status
        </Button>
      </div>
    </div>
  );
}

export default BookingPage;
