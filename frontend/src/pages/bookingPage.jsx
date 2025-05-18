import React, { useEffect, useState } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

export function BookingPage() {
  const navigate = useNavigate();
  const [bookedLockers, setBookedLockers] = useState([]);
  const [userData, setUserData] = useState(null);
  const [pendingConfirmation, setPendingConfirmation] = useState({ hot: false, cold: false });
  const lockDuration = 900000; // 15 mins in milliseconds

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5020/api/user", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          localStorage.setItem("username", data.username); // Store username
          console.log("Username stored:", localStorage.getItem("username")); // Confirm it was stored
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
  const username = localStorage.getItem("username");
  if (!username) {
    console.error("Username not found in localStorage.");
    return;
  }

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
      body: JSON.stringify({ locker_type: lockerType, username }),
    });

    if (response.ok) {
      const updatedBookedLockers = [...bookedLockers, lockerType];
      setBookedLockers(updatedBookedLockers);
      localStorage.setItem("bookedLockers", JSON.stringify(updatedBookedLockers));
      localStorage.setItem("lockerTimestamp", Date.now().toString());
      localStorage.setItem("firstUserId", userData.id);

      const pinResponse = await fetch(`http://localhost:8000/api/pin?locker_type=${lockerType}`);
      const pinData = await pinResponse.json();
      alert(`Your ${lockerType.toUpperCase()} locker PIN is: ${pinData.pin}`);

      // ✅ Send POST to Raspberry Pi to start the Peltier system
      console.log("Sending request to Pi to start Peltier...");

      try {
        const piStartResponse = await fetch("https://a638-158-108-228-212.ngrok-free.app/api/start_peltier", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ locker_type: lockerType }),
        });

        if (piStartResponse.ok) {
          const piResult = await piStartResponse.json();
          console.log("Pi response:", piResult);
        } else {
          const errorText = await piStartResponse.text();
          console.error("Failed to start Peltier system. Response:", errorText);
        }
      } catch (error) {
        console.error("Error communicating with Raspberry Pi:", error);
      }

      navigate(`/pin?lockerType=${lockerType}`);
    } else {
      console.error("Failed to book locker:", await response.text());
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

  const resetLockerStatus = async () => {
    localStorage.removeItem("bookedLockers");
    localStorage.removeItem("lockerTimestamp");
    localStorage.removeItem("firstUserId");

    setBookedLockers([]);
    alert("Locker status has been reset.");

    try {
      // Send reset request to the backend
      const response = await fetch("http://localhost:8000/api/reset_lockers", {
        method: "POST",
      });

      if (response.ok) {
        console.log("Locker statuses reset successfully.");
        // Optionally send a reset signal to Raspberry Pi here too
        const piResponse = await fetch("https://a638-158-108-228-212.ngrok-free.app/api/reset_lockers", {
          method: "POST",
        });
        if (piResponse.ok) {
          console.log("Raspberry Pi locker statuses reset successfully.");
        } else {
          console.error("Failed to reset Raspberry Pi locker statuses.");
        }
      } else {
        console.error("Failed to reset lockers.");
      }
    } catch (error) {
      console.error("Error resetting lockers:", error);
    }
  };

  const handleLogout = async () => {
    const username = localStorage.getItem("username");

    // Clear the stored data
    localStorage.removeItem("username");
    localStorage.removeItem("bookedLockers");
    localStorage.removeItem("lockerTimestamp");
    localStorage.removeItem("firstUserId");

    // Send logout request to Raspberry Pi
    try {
      const piLogoutResponse = await fetch("https://a638-158-108-228-212.ngrok-free.app/api/free_locker", {
        method: "POST",
        body: JSON.stringify({
          locker_type: "hot", // Specify the type of locker or a shared key
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (piLogoutResponse.ok) {
        console.log("Successfully informed Raspberry Pi about the logout.");
      } else {
        console.error("Failed to inform Raspberry Pi about the logout.");
      }
    } catch (error) {
      console.error("Error during logout process:", error);
    }

    // Navigate to the login page or home
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-blue-500 text-white">
      <nav className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg fixed top-0 z-50">
        <Typography variant="h4" className="font-bold text-2xl">
          LOCKERY
        </Typography>
        <Button variant="text" className="text-white" onClick={handleLogout}>
          Log out
        </Button>
      </nav>

      <div className="text-center mt-20 mb-6">
        <Typography variant="h1" className="text-4xl font-bold">
          Booking the Locker for 1 day
        </Typography>
        <Typography className="text-lg mt-2">
          Hot : Cold
        </Typography>

        {userData && (
          <Typography className="text-md mt-2 text-white">
            Welcome, <strong>{userData.username}</strong>!
          </Typography>
        )}
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

      <div className="mt-6">
        <Button variant="outlined" color="red" onClick={resetLockerStatus}>
          Reset Locker Status
        </Button>
      </div>
    </div>
  );
}

export default BookingPage;
