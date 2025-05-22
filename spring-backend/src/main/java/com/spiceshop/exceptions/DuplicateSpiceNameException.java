package com.spiceshop.exceptions;

public class DuplicateSpiceNameException extends RuntimeException {
    private final Long existingId;

    public DuplicateSpiceNameException(String message, Long existingId) {
        super(message);
        this.existingId = existingId;
    }

    public Long getExistingId() {
        return existingId;
    }
}
