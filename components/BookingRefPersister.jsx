"use client";

import { useEffect } from "react";
import { saveTrackedBooking } from "@/lib/bookingPersistence";

export default function BookingRefPersister({ booking }) {
  const ref = booking?.bookingReference;
  const status = booking?.status;
  const date = booking?.date;
  const startTime = booking?.startTime;
  const serviceName = booking?.serviceName || booking?.service?.name;
  const firstName = booking?.firstName || booking?.customer?.firstName;

  useEffect(() => {
    if (!ref) return;
    saveTrackedBooking({
      bookingReference: ref,
      status,
      date,
      startTime,
      serviceName,
      firstName,
    });
  }, [ref, status, date, startTime, serviceName, firstName]);

  return null;
}
