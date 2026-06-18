"use client";

import React from "react";
import IntlTelInput from "@intl-tel-input/react/with-utils";
import "intl-tel-input/styles";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  id?: string;
  placeholder?: string;
  theme?: "dark" | "light";
}

export function PhoneInput({
  value,
  onChange,
  required = false,
  id,
  placeholder,
  theme = "dark"
}: PhoneInputProps) {
  return (
    <div className={theme === "light" ? "iti-phone-light" : "iti-phone-dark"} style={{ width: "100%" }}>
      <IntlTelInput
        value={value}
        onChangeNumber={onChange}
        initialCountry="ae"
        countrySearch={true}
        placeholderNumberType="MOBILE"
        strictMode={true}
        inputProps={{
          id,
          required,
          placeholder
        }}
      />
    </div>
  );
}
