import { ChangeEvent, ReactNode } from "react";
import { ToulminArgument } from "@/types/client";

export interface FormSectionProps {
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
}

export type BaseInputProps = {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  readonly onBlur?: () => void;
  readonly placeholder: string;
  readonly required?: boolean;
  readonly className?: string;
  readonly error?: string;
  readonly ariaInvalid?: boolean;
  readonly ariaDescribedby?: string;
};

export type TextInputProps = BaseInputProps & {
  readonly type?: "text" | "email" | "password";
  readonly inputComponent: "input";
};

export type TextareaProps = BaseInputProps & {
  readonly rows?: number;
  readonly inputComponent: "textarea";
};

export type FormInputProps = TextInputProps | TextareaProps;

export interface ToulminFormProps {
  readonly onSubmit: (data: ToulminArgument) => void | Promise<void>;
  readonly onChange?: (data: ToulminArgument) => void;
  readonly initialData?: ToulminArgument;
}
