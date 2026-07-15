import { useEffect, useState } from "react";

const PINCODE_KEY = "ayuzee_pincode";
const CITY_KEY = "ayuzee_city";
const PINCODE_CHANGED = "ayuzee:pincode-changed";

const readValue = (key: string) => localStorage.getItem(key) || "";

export const usePincode = () => {
  const [pincode, setPincodeState] = useState(() => readValue(PINCODE_KEY));
  const [city, setCityState] = useState(() => readValue(CITY_KEY));
  const [deliveryAvailable, setDeliveryAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => {
      const savedPin = readValue(PINCODE_KEY);
      setPincodeState(savedPin);
      setCityState(readValue(CITY_KEY));
      setDeliveryAvailable(savedPin ? /^[1-9][0-9]{5}$/.test(savedPin) : null);
    };

    window.addEventListener("storage", sync);
    window.addEventListener(PINCODE_CHANGED, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(PINCODE_CHANGED, sync);
    };
  }, []);

  const checkPincode = (pin: string) => {
    const trimmed = pin.trim();
    const valid = /^[1-9][0-9]{5}$/.test(trimmed);

    localStorage.setItem(PINCODE_KEY, trimmed);
    setPincodeState(trimmed);
    setDeliveryAvailable(valid);
    window.dispatchEvent(new Event(PINCODE_CHANGED));

    return valid;
  };

  const clearPincode = () => {
    localStorage.removeItem(PINCODE_KEY);
    localStorage.removeItem(CITY_KEY);
    setPincodeState("");
    setCityState("");
    setDeliveryAvailable(null);
    window.dispatchEvent(new Event(PINCODE_CHANGED));
  };

  return { pincode, city, deliveryAvailable, checkPincode, clearPincode };
};