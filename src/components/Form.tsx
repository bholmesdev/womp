// Generated by simple:form

import { navigate } from "astro:transitions/client";
import {
  type ComponentProps,
  createContext,
  useContext,
  useState,
  useRef,
} from "react";
import {
  DropZone,
  FileTrigger,
  type DropZoneProps,
  type FileDropItem,
} from "react-aria-components";
import {
  type FieldErrors,
  type FormState,
  type FormValidator,
  getInitialFormState,
  toSetValidationErrors,
  toTrackAstroSubmitStatus,
  toValidateField,
  validateForm,
  formNameInputProps,
} from "simple:form";

export function useCreateFormContext(
  validator: FormValidator,
  fieldErrors?: FieldErrors,
  formRef?: React.MutableRefObject<HTMLFormElement | null>
) {
  const initial = getInitialFormState({ validator, fieldErrors });
  const [formState, setFormState] = useState<FormState>(initial);
  return {
    value: formState,
    set: setFormState,
    formRef,
    validator,
    setValidationErrors: toSetValidationErrors(setFormState),
    validateField: toValidateField(setFormState),
    trackAstroSubmitStatus: toTrackAstroSubmitStatus(setFormState),
  };
}

export function useFormContext() {
  const formContext = useContext(FormContext);
  if (!formContext) {
    throw new Error(
      "Form context not found. `useFormContext()` should only be called from children of a <Form> component."
    );
  }
  return formContext;
}

type FormContextType = ReturnType<typeof useCreateFormContext>;

const FormContext = createContext<FormContextType | undefined>(undefined);

export function Form({
  children,
  validator,
  context,
  fieldErrors,
  name,
  ...formProps
}: {
  validator: FormValidator;
  context?: FormContextType;
  fieldErrors?: FieldErrors;
} & Omit<ComponentProps<"form">, "method" | "onSubmit">) {
  const formRef = useRef<HTMLFormElement>(null);
  const formContext =
    context ?? useCreateFormContext(validator, fieldErrors, formRef);

  return (
    <FormContext.Provider value={formContext}>
      <form
        {...formProps}
        ref={formRef}
        method="POST"
        onSubmit={async (e) => {
          const formData = new FormData(e.currentTarget);
          formContext.set((formState) => ({
            ...formState,
            isSubmitPending: true,
            submitStatus: "validating",
          }));
          const parsed = await validateForm({ formData, validator });
          if (parsed.data) {
            return formContext.trackAstroSubmitStatus();
          }

          e.preventDefault();
          e.stopPropagation();
          formContext.setValidationErrors(parsed.fieldErrors);
        }}
      >
        {name ? <input {...formNameInputProps} value={name} /> : null}
        {children}
      </form>
    </FormContext.Provider>
  );
}

export function FileDropInput({
  children,
  fileTriggerBtn,
  ...props
}: DropZoneProps & {
  name: string;
  children: React.ReactNode;
  fileTriggerBtn?: React.ReactNode;
}) {
  const formContext = useFormContext();
  const { formRef, validator } = formContext;
  const fieldState = formContext.value.fields[props.name];
  if (!fieldState) {
    throw new Error(
      `Input "${props.name}" not found in form. Did you use the <Form> component?`
    );
  }

  async function uploadFile(file: File) {
    if (!formRef?.current) return;

    const formData = new FormData(formRef.current);
    formData.set(props.name, file);

    formContext.set((formState) => ({
      ...formState,
      isSubmitPending: true,
      submitStatus: "validating",
    }));
    const parsed = await validateForm({ formData, validator });
    if (parsed.data) {
      navigate(window.location.href, { formData });
      return formContext.trackAstroSubmitStatus();
    }
    formContext.setValidationErrors(parsed.fieldErrors);
  }

  return (
    <DropZone
      {...props}
      getDropOperation={(types) =>
        types.has("audio/mpeg") ? "copy" : "cancel"
      }
      onDrop={async (e) => {
        const fileDropItem = e.items.find((file) => file.kind === "file") as
          | FileDropItem
          | undefined;
        if (!fileDropItem) return;
        const file = await fileDropItem.getFile();

        uploadFile(file);
      }}
    >
      {children}
      {fileTriggerBtn && (
        <FileTrigger
          allowsMultiple
          onSelect={(e) => {
            const files = e ? Array.from(e) : [];
            const file = files[0];
            if (!file) return;

            uploadFile(file);
          }}
        >
          {fileTriggerBtn}
        </FileTrigger>
      )}
    </DropZone>
  );
}

export function Input(inputProps: ComponentProps<"input"> & { name: string }) {
  const formContext = useFormContext();
  const fieldState = formContext.value.fields[inputProps.name];
  if (!fieldState) {
    throw new Error(
      `Input "${inputProps.name}" not found in form. Did you use the <Form> component?`
    );
  }

  const { hasErroredOnce, validationErrors, validator } = fieldState;
  return (
    <>
      <input
        onBlur={async (e) => {
          const value = e.target.value;
          if (value === "") return;
          formContext.validateField(inputProps.name, value, validator);
        }}
        onChange={async (e) => {
          if (!hasErroredOnce) return;
          const value = e.target.value;
          formContext.validateField(inputProps.name, value, validator);
        }}
        {...inputProps}
      />
      {validationErrors?.map((e) => (
        <p key={e}>{e}</p>
      ))}
    </>
  );
}
