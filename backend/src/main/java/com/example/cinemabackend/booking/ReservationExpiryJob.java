package com.example.cinemabackend.booking;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name="app.holds.cleanup-enabled",havingValue="true",matchIfMissing=true)
public class ReservationExpiryJob {
    private final BookingService bookings;
    public ReservationExpiryJob(BookingService bookings) { this.bookings=bookings; }
    @Scheduled(fixedDelay=1000)
    public void releaseExpiredHolds() { bookings.expireHolds(); }
}

