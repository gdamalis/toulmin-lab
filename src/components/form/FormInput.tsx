"use client";

import { FormInputProps, TextInputProps, TextareaProps } from "./types";
import { Typography } from "@/components/ui/Typography";

export function FormInput(props: Readonly<FormInputProps>) {
  const {
    id,
    name,
    label,
    value,
    onChange,
    onBlur,
    placeholder,
    required = false,
    error,
    className,
    ariaInvalid,
    ariaDescribedby,
    inputComponent,
    ...restProps
  } = props;

  const hasError = !!error;
  const errorId = `${id}-error`;
  
  // Check input type based on the extracted inputComponent
  const isInput = inputComponent === "input";
  const isTextArea = inputComponent === "textarea";
  
  // Determine the appropriate className based on the component type
  const componentClassName = className ?? (isInput 
    ? "sm:col-span-3" 
    : "col-span-full");

  // Get input class names based on error state
  const getInputClasses = () => {
    const baseClasses =
      "block w-full rounded-md bg-white px-3 py-1.5 text-base outline-1 -outline-offset-1 sm:text-sm/6";
    const normalClasses =
      "text-gray-900 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600";
    const errorClasses =
      "text-red-900 outline-red-300 placeholder:text-red-300 focus:outline-2 focus:-outline-offset-2 focus:outline-red-600";

    return `${baseClasses} ${hasError ? errorClasses : normalClasses}`;
  };

  // Common props for form controls
  const inputProps = {
    id,
    name,
    value,
    onChange,
    onBlur,
    required: false,
    "aria-required": required,
    placeholder: required ? `${placeholder} *` : placeholder,
    className: getInputClasses(),
    "aria-invalid": ariaInvalid ?? hasError,
    "aria-describedby": ariaDescribedby ?? (hasError ? errorId : undefined),
  };

  // Render text input
  const renderTextInput = () => {
    // If not an input type, return null 
    if (!isInput) return null;
    
    return (
      <input
        type={(restProps as TextInputProps)?.type ?? "text"}
        {...inputProps}
        {...restProps}
      />
    );
  };

  // Render textarea
  const renderTextarea = () => {
    // If not a textarea type, return null
    if (!isTextArea) return null;
    
    return (
      <textarea
        rows={(restProps as TextareaProps)?.rows ?? 2}
        {...inputProps}
        {...restProps}
      />
    );
  };

  // Render error message (if any)
  const renderErrorMessage = () => {
    if (!hasError) return null;

    return (
      <p id={errorId} className="mt-2 text-sm text-red-600">
        {error}
      </p>
    );
  };

  return (
    <div className={componentClassName}>
      <label htmlFor={id} className="block text-sm/6 font-medium text-gray-900">
        <Typography variant="body-sm" className="font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Typography>
      </label>
      <div className="mt-2 relative">
        {isInput ? renderTextInput() : renderTextarea()}
        {renderErrorMessage()}
      </div>
    </div>
  );
}
