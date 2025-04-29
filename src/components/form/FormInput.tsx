"use client";

import { FormInputProps } from "./types";
import { Typography } from "@/components/ui/Typography";

export function FormInput(props: Readonly<FormInputProps>) {
  const {
    id,
    name,
    label,
    value,
    onChange,
    placeholder,
    required = false,
    className = props.inputComponent === "input" ? "sm:col-span-3" : "col-span-full",
  } = props;
  
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm/6 font-medium text-gray-900"
      >
        <Typography variant="body-sm" className="font-medium">
          {label}
        </Typography>
      </label>
      <div className="mt-2">
        {props.inputComponent === "input" ? (
          <input
            id={id}
            name={name}
            type={props.type ?? "text"}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600 sm:text-sm/6"
          />
        ) : (
          <textarea
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            rows={props.rows ?? 2}
            required={required}
            placeholder={placeholder}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600 sm:text-sm/6"
          />
        )}
      </div>
    </div>
  );
} 