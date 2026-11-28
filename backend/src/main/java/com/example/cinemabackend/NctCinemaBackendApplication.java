package com.example.cinemabackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class NctCinemaBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(NctCinemaBackendApplication.class, args);
    }

}
